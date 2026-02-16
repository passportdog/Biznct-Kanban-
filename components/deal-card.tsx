'use client'

import { Deal } from '@/types'
import { Building2, User, DollarSign, Calendar } from 'lucide-react'

interface DealCardProps {
  deal: Deal
}

export default function DealCard({ deal }: DealCardProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-3 card-shadow hover:card-shadow-hover transition-all cursor-pointer border border-light-border dark:border-dark-border hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm line-clamp-2">{deal.title}</h4>
        {deal.priority && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[deal.priority]}`}>
            {deal.priority}
          </span>
        )}
      </div>

      {deal.company_name && (
        <div className="flex items-center gap-1.5 text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2">
          <Building2 size={12} />
          <span className="truncate">{deal.company_name}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {deal.value > 0 && (
            <div className="flex items-center gap-1 text-light-textSecondary dark:text-dark-textSecondary">
              <DollarSign size={12} />
              <span>{deal.value.toLocaleString()}</span>
            </div>
          )}
          {deal.probability && (
            <div className="flex items-center gap-1 text-light-textSecondary dark:text-dark-textSecondary">
              <span>{deal.probability}%</span>
            </div>
          )}
        </div>

        {deal.next_step_date && (
          <div className="flex items-center gap-1 text-brand-blue dark:text-brand-green">
            <Calendar size={12} />
            <span>{new Date(deal.next_step_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {deal.owner_name && (
        <div className="mt-2 pt-2 border-t border-light-border dark:border-dark-border flex items-center gap-2">
          <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-xs">
            {deal.owner_name.charAt(0)}
          </div>
          <span className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
            {deal.owner_name}
          </span>
        </div>
      )}
    </div>
  )
}