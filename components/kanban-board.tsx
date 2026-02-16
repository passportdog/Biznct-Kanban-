'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import KanbanColumn from './kanban-column'
import { Deal, KanbanType } from '@/types'

interface KanbanBoardProps {
  type: KanbanType
}

const pipelineColumns = [
  { id: 'lead', label: 'New Lead', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'discovery', label: 'Discovery Call', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'proposal', label: 'Proposal Sent', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'won', label: 'Won', color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'lost', label: 'Lost', color: 'bg-red-50 dark:bg-red-900/20' },
]

const deliveryColumns = [
  { id: 'onboarding', label: 'Onboarding', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'waiting_client', label: 'Waiting on Client', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'in_production', label: 'In Production', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'review', label: 'Review', color: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'delivered', label: 'Delivered', color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'ongoing', label: 'Retainer', color: 'bg-teal-50 dark:bg-teal-900/20' },
]

export default function KanbanBoard({ type }: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState('')
  const [accounts, setAccounts] = useState<{id: string, name: string}[]>([])
  const supabase = createClient()

  const columns = type === 'pipeline' ? pipelineColumns : deliveryColumns

  useEffect(() => {
    fetchDeals()
    fetchAccounts()
  }, [type])

  const fetchDeals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('type', type)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setDeals(data)
    }
    setLoading(false)
  }

  const fetchAccounts = async () => {
    const { data } = await supabase.from('crm_accounts').select('id, name').limit(100)
    if (data) setAccounts(data)
  }

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const accountId = formData.get('company_id') as string
    const accountName = accounts.find(a => a.id === accountId)?.name

    const newDeal = {
      title: formData.get('title') as string,
      stage: selectedColumn,
      type,
      value: parseInt(formData.get('value') as string) || 0,
      probability: parseInt(formData.get('probability') as string) || 20,
      priority: formData.get('priority') as string,
      status: 'active',
      company_id: accountId || null,
      company_name: accountName || formData.get('company_name') as string,
      contact_name: formData.get('contact_name') as string,
      owner_name: formData.get('owner_name') as string,
      next_step: formData.get('next_step') as string,
      next_step_date: formData.get('next_step_date') as string || null,
      description: formData.get('description') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
    }

    const { data, error } = await supabase
      .from('crm_deals')
      .insert([newDeal])
      .select()

    if (!error && data) {
      setDeals([...deals, data[0]])
      setShowAddModal(false)
      setSelectedColumn('')
    }
  }

  const openAddModal = (columnId: string) => {
    setSelectedColumn(columnId)
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            deals={deals.filter((d) => d.stage === column.id)}
            onAddDeal={() => openAddModal(column.id)}
          />
        ))}
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-light-surface dark:bg-dark-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-1">Create New Deal</h2>
              <p className="text-sm text-light-textSecondary mb-6">
                Stage: {columns.find(c => c.id === selectedColumn)?.label}
              </p>

              <form onSubmit={handleAddDeal} className="space-y-5">
                {/* Title & Company */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Deal Title *</label>
                    <input 
                      name="title" 
                      required 
                      placeholder="e.g., Website Redesign"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary focus:outline-none focus:border-brand-blue" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Company Name</label>
                    <input 
                      name="company_name" 
                      placeholder="e.g., Acme Corp"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                    />
                  </div>
                </div>

                {/* Link to Account */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Link to Existing Account</label>
                  <select 
                    name="company_id"
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
                  >
                    <option value="">-- Select Account --</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>

                {/* Value & Probability */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Deal Value ($)</label>
                    <input 
                      name="value" 
                      type="number"
                      min="0"
                      placeholder="10000"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Probability (%)</label>
                    <input 
                      name="probability" 
                      type="number"
                      min="0"
                      max="100"
                      defaultValue="20"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Priority</label>
                    <select 
                      name="priority"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Contact & Owner */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Primary Contact</label>
                    <input 
                      name="contact_name" 
                      placeholder="John Doe"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Deal Owner</label>
                    <input 
                      name="owner_name" 
                      placeholder="Your name"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                    />
                  </div>
                </div>

                {/* Next Step */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Next Step</label>
                    <input 
                      name="next_step" 
                      placeholder="e.g., Send proposal"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Due Date</label>
                    <input 
                      name="next_step_date" 
                      type="date"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
                  <input 
                    name="tags" 
                    placeholder="website, urgent, enterprise, ..."
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" 
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description / Notes</label>
                  <textarea 
                    name="description" 
                    rows={4}
                    placeholder="Add any details about this deal..."
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary resize-none" 
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-light-border dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surfaceSecondary transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Create Deal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}