'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseISO, isBefore, differenceInDays } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import KanbanColumn from './kanban-column'
import { Deal, KanbanType } from '@/types'

interface KanbanBoardProps {
  type: KanbanType
}

const pipelineColumns = [
  { id: 'new_lead', label: 'New Lead', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'discovery', label: 'Discovery', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
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
  const [contacts, setContacts] = useState<{id: string, first_name: string, last_name?: string}[]>([])
  const [members, setMembers] = useState<{id: string, display_name: string}[]>([])
  const supabase = createClient()

  const columns = type === 'pipeline' ? pipelineColumns : deliveryColumns

  useEffect(() => {
    fetchDeals()
    fetchAccounts()
    fetchContacts()
    fetchMembers()
  }, [type])

  const fetchDeals = async () => {
    setLoading(true)

    if (type === 'delivery') {
      // Delivery projects live in crm_client_projects, not crm_deals
      const { data, error } = await supabase
        .from('crm_client_projects')
        .select('*, crm_accounts(name)')
        .order('updated_at', { ascending: false })

      if (!error && data) {
        const mapped = data.map(p => ({
          id: p.id,
          title: p.title,
          stage: p.stage,
          value: p.monthly_value || 0,
          probability: 0,
          account_id: p.account_id,
          owner_id: p.owner_id,
          service_type: p.services || [],
          company_name: (p.crm_accounts as any)?.name,
          crm_accounts: p.crm_accounts as { name: string } | undefined,
          next_step: p.next_step,
          created_at: p.created_at,
          updated_at: p.updated_at,
        } as Deal))
        setDeals(mapped)
      }
    } else {
      // Pipeline deals from crm_deals — no type filter, stage column is used instead
      const { data, error } = await supabase
        .from('crm_deals')
        .select('*, crm_accounts(name)')
        .order('updated_at', { ascending: false })

      if (!error && data) {
        const mapped = data.map(d => ({
          ...d,
          company_name: (d.crm_accounts as any)?.name || d.company_name,
        }))
        setDeals(mapped)
      }
    }
    setLoading(false)
  }

  const fetchAccounts = async () => {
    const { data } = await supabase.from('crm_accounts').select('id, name').limit(100)
    if (data) setAccounts(data)
  }

  const fetchContacts = async () => {
    const { data } = await supabase.from('crm_contacts').select('id, first_name, last_name').limit(100)
    if (data) setContacts(data)
  }

  const fetchMembers = async () => {
    const { data } = await supabase.from('crm_members').select('id, display_name').limit(100)
    if (data) setMembers(data)
  }

  const handleStageChange = async (dealId: string, newStage: string) => {
    const deal = deals.find(d => d.id === dealId)
    if (!deal) return

    const updates: any = { stage: newStage }

    // If moving to won, set closed_at and probability
    if (newStage === 'won') {
      updates.closed_at = new Date().toISOString()
      updates.probability = 100

      // Create activity log
      await supabase.from('crm_activities').insert({
        entity_type: 'deal',
        entity_id: dealId,
        activity_type: 'stage_change',
        description: `Deal won - $${deal.value?.toLocaleString()}`,
        performed_by: null,
        metadata: { previous_stage: deal.stage, new_stage: 'won' }
      })

      // Create client project from won deal
      if (deal.account_id) {
        const { error: projectError } = await supabase.from('crm_client_projects').insert({
          deal_id: dealId,
          account_id: deal.account_id,
          title: deal.title,
          stage: 'onboarding',
          services: deal.service_type || [],
          monthly_value: deal.value || 0,
          owner_id: deal.owner_id,
        })

        if (!projectError) {
          toast.success('Project auto-created from won deal!')
        }
      }

      toast.success('Deal marked as won! Project created.')
    }

    // If moving to lost, set closed_at
    if (newStage === 'lost') {
      updates.closed_at = new Date().toISOString()
      updates.probability = 0
    }

    const table = type === 'delivery' ? 'crm_client_projects' : 'crm_deals'
    const { error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', dealId)

    if (!error) {
      setDeals(deals.map(d => d.id === dealId ? { ...d, ...updates } : d))
    }
  }

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    if (type === 'delivery') {
      const payload = {
        title: formData.get('title') as string,
        stage: selectedColumn,
        account_id: (formData.get('account_id') as string) || null,
        owner_id: (formData.get('owner_id') as string) || null,
        monthly_value: parseFloat(formData.get('value') as string) || 0,
        services: (formData.get('service_type') as string || '').split(',').map(t => t.trim()).filter(Boolean),
        next_step: (formData.get('next_step') as string) || null,
      }

      const { data, error } = await supabase
        .from('crm_client_projects')
        .insert([payload])
        .select()

      if (!error && data) {
        const newProject: Deal = {
          id: data[0].id,
          title: data[0].title,
          stage: data[0].stage,
          value: data[0].monthly_value || 0,
          probability: 0,
          account_id: data[0].account_id,
          owner_id: data[0].owner_id,
          service_type: data[0].services || [],
          company_name: accounts.find(a => a.id === data[0].account_id)?.name,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
        }
        setDeals([...deals, newProject])
        setShowAddModal(false)
        setSelectedColumn('')
        toast.success('Project created successfully!')
      } else {
        toast.error('Failed to create project')
      }
    } else {
      // Correct payload matching crm_deals schema — no type, priority, status, company_name, contact_name, owner_name, description
      const payload = {
        title: formData.get('title') as string,
        stage: selectedColumn,
        value: parseFloat(formData.get('value') as string) || 0,
        probability: parseInt(formData.get('probability') as string) || 20,
        account_id: (formData.get('account_id') as string) || null,
        contact_id: (formData.get('contact_id') as string) || null,
        owner_id: (formData.get('owner_id') as string) || null,
        next_step: (formData.get('next_step') as string) || null,
        next_step_date: (formData.get('next_step_date') as string) || null,
        service_type: (formData.get('service_type') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      }

      const { data, error } = await supabase
        .from('crm_deals')
        .insert([payload])
        .select()

      if (!error && data) {
        const newDeal: Deal = {
          ...data[0],
          company_name: accounts.find(a => a.id === data[0].account_id)?.name,
          owner_name: members.find(m => m.id === data[0].owner_id)?.display_name,
        }
        setDeals([...deals, newDeal])
        setShowAddModal(false)
        setSelectedColumn('')
        toast.success('Deal created successfully!')
      } else {
        toast.error('Failed to create deal')
      }
    }
  }

  const openAddModal = (columnId: string) => {
    setSelectedColumn(columnId)
    setShowAddModal(true)
  }

  const isOverdue = (deal: Deal) => {
    if (!deal.next_step_date || ['won', 'lost'].includes(deal.stage)) return false
    return isBefore(parseISO(deal.next_step_date), new Date())
  }

  const getOverdueDays = (deal: Deal) => {
    if (!deal.next_step_date) return 0
    return differenceInDays(new Date(), parseISO(deal.next_step_date))
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
            onStageChange={handleStageChange}
            isOverdue={isOverdue}
            getOverdueDays={getOverdueDays}
          />
        ))}
      </div>

      {/* Add Deal / Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-light-surface dark:bg-dark-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-1">
                {type === 'delivery' ? 'Create New Project' : 'Create New Deal'}
              </h2>
              <p className="text-sm text-light-textSecondary mb-6">
                Stage: {columns.find(c => c.id === selectedColumn)?.label}
              </p>

              <form onSubmit={handleAddDeal} className="space-y-5">
                {/* Title & Account */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {type === 'delivery' ? 'Project Title *' : 'Deal Title *'}
                    </label>
                    <input
                      name="title"
                      required
                      placeholder="e.g., Website Redesign"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Account</label>
                    <select
                      name="account_id"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
                    >
                      <option value="">— Unassigned —</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Value & Probability */}
                {type === 'pipeline' ? (
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Monthly Value ($)</label>
                    <input
                      name="value"
                      type="number"
                      min="0"
                      placeholder="5000"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
                    />
                  </div>
                )}

                {/* Contact (pipeline only) & Owner */}
                <div className={`grid gap-4 ${type === 'pipeline' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {type === 'pipeline' && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Primary Contact</label>
                      <select
                        name="contact_id"
                        className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
                      >
                        <option value="">— Unassigned —</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>{`${contact.first_name} ${contact.last_name || ''}`.trim()}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Deal Owner</label>
                    <select
                      name="owner_id"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
                    >
                      <option value="">— Unassigned —</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.display_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Next Step */}
                <div className={`grid gap-4 ${type === 'pipeline' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Next Step</label>
                    <input
                      name="next_step"
                      placeholder="e.g., Send proposal"
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
                    />
                  </div>
                  {type === 'pipeline' && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Due Date</label>
                      <input
                        name="next_step_date"
                        type="date"
                        className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
                      />
                    </div>
                  )}
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Services (comma separated)</label>
                  <input
                    name="service_type"
                    placeholder="website, seo, ads, ..."
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary"
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
                    {type === 'delivery' ? 'Create Project' : 'Create Deal'}
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
