'use client'

import { Plus } from 'lucide-react'
import { Deal } from '@/types'
import DealCard from './deal-card'

interface KanbanColumnProps {
  column: {
    id: string
    label: string
    color: string
  }
  deals: Deal[]
  onAddDeal: () => void
  onStageChange?: (dealId: string, newStage: string) => void
  isOverdue?: (deal: Deal) => boolean
  getOverdueDays?: (deal: Deal) => number
}

export default function KanbanColumn({ 
  column, 
  deals, 
  onAddDeal,
  onStageChange,
  isOverdue,
  getOverdueDays
}: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)

  return (
    <div className="flex-shrink-0 w-80 flex flex-col">
      <div className={`${column.color} rounded-t-xl p-3`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">{column.label}</h3>
          <button
            onClick={onAddDeal}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-light-textSecondary dark:text-dark-textSecondary">
          <span>{deals.length} deals</span>
          {totalValue > 0 && (
            <span>${totalValue.toLocaleString()}</span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary rounded-b-xl p-2 space-y-2 min-h-[200px]">
        {deals.map((deal) => (
          <DealCard 
            key={deal.id} 
            deal={deal} 
            isOverdue={isOverdue?.(deal)}
            overdueDays={getOverdueDays?.(deal)}
          />
        ))}
      </div>
    </div>
  )
}