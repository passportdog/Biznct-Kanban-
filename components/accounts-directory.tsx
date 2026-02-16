'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, 
  Search, 
  Plus, 
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Tag,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { format } from 'date-fns'

interface Account {
  id: string
  name: string
  industry?: string
  location?: string
  status: 'lead' | 'active' | 'past' | 'churn_risk'
  tags?: string[]
  website?: string
  phone?: string
  email?: string
  notes?: string
  created_at: string
  updated_at: string
}

const statusColors = {
  lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  past: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  churn_risk: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const industryIcons: Record<string, string> = {
  'Restaurant': '🍽️',
  'Retail': '🛍️',
  'Healthcare': '🏥',
  'Technology': '💻',
  'Construction': '🏗️',
  'Automotive': '🚗',
  'Default': '🏢',
}

export default function AccountsDirectory() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from('crm_accounts')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setAccounts(data)
    }
    setLoading(false)
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const newAccount = {
      name: formData.get('name') as string,
      industry: formData.get('industry') as string,
      location: formData.get('location') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      status: formData.get('status') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      notes: formData.get('notes') as string,
    }

    const { data, error } = await supabase
      .from('crm_accounts')
      .insert([newAccount])
      .select()

    if (!error && data) {
      setAccounts([data[0], ...accounts])
      setShowAddModal(false)
    }
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(search.toLowerCase()) ||
                         account.industry?.toLowerCase().includes(search.toLowerCase()) ||
                         account.location?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || account.status === filter
    return matchesSearch && matchesFilter
  })

  const getIndustryIcon = (industry?: string) => {
    return industryIcons[industry || ''] || industryIcons.Default
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
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:outline-none focus:border-brand-blue w-64"
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
          >
            <option value="all">All Status</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="past">Past</option>
            <option value="churn_risk">Churn Risk</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Accounts', value: accounts.length, icon: Building2 },
          { label: 'Active Clients', value: accounts.filter(a => a.status === 'active').length, icon: ArrowUpRight, color: 'text-green-500' },
          { label: 'Leads', value: accounts.filter(a => a.status === 'lead').length, icon: ArrowDownRight, color: 'text-blue-500' },
          { label: 'Churn Risk', value: accounts.filter(a => a.status === 'churn_risk').length, icon: ArrowDownRight, color: 'text-red-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-light-surface dark:bg-dark-surface rounded-xl p-4 card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light-textSecondary">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</p>
              </div>
              <stat.icon size={20} className="text-light-textSecondary" />
            </div>
          </div>
        ))}
      </div>

      {/* Accounts Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto mb-4 text-light-textSecondary opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No accounts found</h3>
            <p className="text-light-textSecondary">Add your first account to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((account) => (
              <div 
                key={account.id} 
                className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-2xl">
                      {getIndustryIcon(account.industry)}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-brand-blue transition-colors">{account.name}</h3>
                      <p className="text-sm text-light-textSecondary">{account.industry || 'No industry'}</p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-light-surfaceSecondary rounded">
                    <MoreHorizontal size={16} className="text-light-textSecondary" />
                  </button>
                </div>

                {/* Status & Location */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[account.status]}`}>
                    {account.status.replace('_', ' ')}
                  </span>
                  {account.location && (
                    <span className="flex items-center gap-1 text-xs text-light-textSecondary">
                      <MapPin size={12} />
                      {account.location}
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-3">
                  {account.email && (
                    <div className="flex items-center gap-2 text-sm text-light-textSecondary">
                      <Mail size={14} />
                      <span className="truncate">{account.email}</span>
                    </div>
                  )}
                  {account.phone && (
                    <div className="flex items-center gap-2 text-sm text-light-textSecondary">
                      <Phone size={14} />
                      <span>{account.phone}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {account.tags && account.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {account.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-brand-blue/10 text-brand-blue">
                        {tag}
                      </span>
                    ))}
                    {account.tags.length > 3 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{account.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs text-light-textSecondary">
                  <span>Updated {format(new Date(account.updated_at), 'MMM d')}</span>
                  {account.website && (
                    <a 
                      href={account.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-blue hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-light-surface dark:bg-dark-surface rounded-xl w-full max-w-lg p-6 card-shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Account</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <input name="name" required className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <select name="industry" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary">
                    <option value="">Select...</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Retail">Retail</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Technology">Technology</option>
                    <option value="Construction">Construction</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input name="email" type="email" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input name="phone" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input name="location" placeholder="City, State" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input name="website" placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select name="status" className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary">
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="past">Past</option>
                    <option value="churn_risk">Churn Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input name="tags" placeholder="VIP, Enterprise, ..." className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea name="notes" rows={3} className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}