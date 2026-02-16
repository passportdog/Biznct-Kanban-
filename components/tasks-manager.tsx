'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Flag,
  User,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'high' | 'medium' | 'low'
  due_date?: string
  assigned_to?: string
  assigned_name?: string
  deal_id?: string
  deal_title?: string
  account_id?: string
  account_name?: string
  created_at: string
  updated_at: string
}

const priorityConfig = {
  high: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Flag },
  medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Flag },
  low: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Flag },
}

const statusConfig = {
  todo: { label: 'To Do', icon: Circle, color: 'text-gray-400' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
}

export default function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [deals, setDeals] = useState<{id: string, title: string}[]>([])
  const [accounts, setAccounts] = useState<{id: string, name: string}[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchTasks()
    fetchDeals()
    fetchAccounts()
  }, [])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('crm_tasks')
      .select('*')
      .order('due_date', { ascending: true })

    if (!error && data) {
      setTasks(data)
    }
    setLoading(false)
  }

  const fetchDeals = async () => {
    const { data } = await supabase.from('crm_deals').select('id, title').limit(50)
    if (data) setDeals(data)
  }

  const fetchAccounts = async () => {
    const { data } = await supabase.from('crm_accounts').select('id, name').limit(50)
    if (data) setAccounts(data)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const dealId = formData.get('deal_id') as string
    const accountId = formData.get('account_id') as string
    
    const newTask = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      priority: formData.get('priority') as string,
      due_date: formData.get('due_date') as string || null,
      assigned_name: formData.get('assigned_name') as string,
      deal_id: dealId || null,
      deal_title: dealId ? deals.find(d => d.id === dealId)?.title : null,
      account_id: accountId || null,
      account_name: accountId ? accounts.find(a => a.id === accountId)?.name : null,
    }

    const { data, error } = await supabase
      .from('crm_tasks')
      .insert([newTask])
      .select()

    if (!error && data) {
      setTasks([...tasks, data[0]])
      setShowAddModal(false)
    }
  }

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    const { error } = await supabase
      .from('crm_tasks')
      .update({ status: newStatus })
      .eq('id', task.id)

    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                         task.description?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || task.status === filter
    return matchesSearch && matchesFilter
  })

  const overdueTasks = filteredTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done')
  const todayTasks = filteredTasks.filter(t => t.due_date && format(new Date(t.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
  const upcomingTasks = filteredTasks.filter(t => !overdueTasks.includes(t) && !todayTasks.includes(t))

  const renderTaskCard = (task: Task) => {
    const PriorityIcon = priorityConfig[task.priority].icon
    const StatusIcon = statusConfig[task.status].icon
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

    return (
      <div 
        key={task.id} 
        className={`bg-light-surface dark:bg-dark-surface rounded-xl p-4 card-shadow hover:card-shadow-hover transition-all group ${
          task.status === 'done' ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <button 
            onClick={() => toggleTaskStatus(task)}
            className={`mt-0.5 ${statusConfig[task.status].color} hover:opacity-80 transition-opacity`}
          >
            <StatusIcon size={20} />
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${task.status === 'done' ? 'line-through text-light-textSecondary' : ''}`}>
              {task.title}
            </h4>
            
            {task.description && (
              <p className="text-sm text-light-textSecondary mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-3 mt-3">
              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${priorityConfig[task.priority].color}`}>
                <PriorityIcon size={12} />
                {task.priority}
              </span>
              
              {task.due_date && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-light-textSecondary'}`}>
                  <Calendar size={12} />
                  {isOverdue ? 'Overdue: ' : ''}
                  {format(new Date(task.due_date), 'MMM d')}
                </span>
              )}
              
              {task.assigned_name && (
                <span className="flex items-center gap-1 text-xs text-light-textSecondary">
                  <User size={12} />
                  {task.assigned_name}
                </span>
              )}
            </div>

            {(task.deal_title || task.account_name) && (
              <div className="mt-2 text-xs">
                {task.deal_title && (
                  <span className="text-brand-blue hover:underline cursor-pointer">
                    📋 {task.deal_title}
                  </span>
                )}
                {task.account_name && (
                  <span className="text-brand-blue hover:underline cursor-pointer ml-2">
                    🏢 {task.account_name}
                  </span>
                )}
              </div>
            )}
          </div>

          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-light-surfaceSecondary rounded">
            <MoreHorizontal size={16} className="text-light-textSecondary" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-textSecondary" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:outline-none focus:border-brand-blue w-64"
            />
          </div>
          
          <div className="flex gap-1 bg-light-surface dark:bg-dark-surface rounded-lg p-1">
            {(['all', 'todo', 'in_progress', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-brand-blue text-white' 
                    : 'text-light-textSecondary hover:bg-light-surfaceSecondary'
                }`}
              >
                {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: tasks.length, color: '' },
          { label: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: 'text-gray-500' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'text-blue-500' },
          { label: 'Done', value: tasks.filter(t => t.status === 'done').length, color: 'text-green-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 card-shadow">
            <p className="text-sm text-light-textSecondary">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {overdueTasks.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-red-500 font-semibold mb-3">
              <AlertCircle size={18} />
              Overdue ({overdueTasks.length})
            </h3>
            <div className="space-y-3">
              {overdueTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

        {todayTasks.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-brand-blue font-semibold mb-3">
              <Calendar size={18} />
              Due Today ({todayTasks.length})
            </h3>
            <div className="space-y-3">
              {todayTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-light-textSecondary font-semibold mb-3">
              <CheckSquare size={18} />
              Upcoming ({upcomingTasks.length})
            </h3>
            <div className="space-y-3">
              {upcomingTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-20">
            <CheckSquare size={48} className="mx-auto mb-4 text-light-textSecondary opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-light-textSecondary">Create your first task to get started</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-light-surface dark:bg-dark-surface rounded-xl w-full max-w-lg p-6 card-shadow max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title *</label>
                <input 
                  name="title" 
                  required 
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows={3}
                  placeholder="Add details..."
                  className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select name="priority" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select name="status" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary">
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input 
                    name="due_date" 
                    type="date"
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                  <input 
                    name="assigned_name" 
                    placeholder="Name"
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Link to Deal</label>
                  <select name="deal_id" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary">
                    <option value="">None</option>
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>{deal.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Link to Account</label>
                  <select name="account_id" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary">
                    <option value="">None</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surfaceSecondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}