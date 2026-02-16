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
  const supabase = createClient()

  const columns = type === 'pipeline' ? pipelineColumns : deliveryColumns

  useEffect(() => {
    fetchDeals()
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

  const handleAddDeal = async (columnId: string) => {
    const title = prompt('Deal title:')
    if (!title) return

    const { data, error } = await supabase
      .from('crm_deals')
      .insert([{
        title,
        stage: columnId,
        type,
        value: 0,
        probability: 20,
        status: 'active'
      }])
      .select()

    if (!error && data) {
      setDeals([...deals, data[0]])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          deals={deals.filter((d) => d.stage === column.id)}
          onAddDeal={() => handleAddDeal(column.id)}
        />
      ))}
    </div>
  )
}