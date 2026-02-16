'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, differenceInDays, isBefore, parseISO } from 'date-fns'
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { toast } from 'sonner'

interface Deal {
  id: string
  title: string
  stage: string
  value: number
  probability: number
  account_id?: string
  next_step?: string
  next_step_date?: string
  closed_at?: string
  crm_accounts?: { name: string }
}

interface Project {
  id: string
  monthly_value: number
}

interface IntelligenceAccount {
  id: string
  email?: string
}

interface IntelligenceContact {
  id: string
  last_contacted_at?: string
}

interface IntelligenceMember {
  id: string
  user_id?: string
}

interface DataQualityAlert {
  type: string
  count: number
  message: string
  icon: any
  color: string
}

interface DealHealth {
  id: string
  title: string
  account_name: string
  value: number
  stage: string
  score: number
  next_step?: string
  next_step_date?: string
  isOverdue: boolean
  daysOverdue: number
}

const stageColors: Record<string, string> = {
  'new_lead': '#94A3B8',
  'contacted': '#3B82F6',
  'discovery': '#8B5CF6',
  'proposal_sent': '#EAB308',
  'negotiation': '#F97316',
  'won': '#22C55E',
  'lost': '#EF4444',
}

const stageLabels: Record<string, string> = {
  'new_lead': 'New Lead',
  'contacted': 'Contacted',
  'discovery': 'Discovery',
  'proposal_sent': 'Proposal',
  'negotiation': 'Negotiation',
  'won': 'Won',
  'lost': 'Lost',
}

export default function IntelligenceDashboard() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    pipelineValue: 0,
    weightedForecast: 0,
    closedRevenue: 0,
    monthlyRecurring: 0,
  })
  const [pipelineData, setPipelineData] = useState<{stage: string, value: number, count: number}[]>([])
  const [dealHealths, setDealHealths] = useState<DealHealth[]>([])
  const [dataQualityAlerts, setDataQualityAlerts] = useState<DataQualityAlert[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    
    try {
      // Fetch deals
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('*, crm_accounts(name)')
        .order('value', { ascending: false })

      // Fetch projects for MRR
      const { data: projects } = await supabase
        .from('crm_client_projects')
        .select('monthly_value')

      // Fetch data quality metrics
      const { data: accounts } = await supabase
        .from('crm_accounts')
        .select('email')

      const { data: contacts } = await supabase
        .from('crm_contacts')
        .select('last_contacted_at')

      const { data: members } = await supabase
        .from('crm_members')
        .select('user_id')

      if (deals) {
        calculateMetrics(deals, projects || [])
        calculatePipelineData(deals)
        calculateDealHealths(deals)
      }

      calculateDataQualityAlerts(accounts || [], contacts || [], deals || [], members || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load intelligence data')
    }
    
    setLoading(false)
  }

  const calculateMetrics = (deals: Deal[], projects: any[]) => {
    const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage))
    
    const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0)
    const weightedForecast = activeDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0)
    const closedRevenue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + (d.value || 0), 0)
    const monthlyRecurring = projects.reduce((sum, p) => sum + (p.monthly_value || 0), 0)

    setMetrics({
      pipelineValue,
      weightedForecast,
      closedRevenue,
      monthlyRecurring,
    })
  }

  const calculatePipelineData = (deals: Deal[]) => {
    const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage))
    const stageOrder = ['new_lead', 'contacted', 'discovery', 'proposal_sent', 'negotiation']
    
    const data = stageOrder.map(stage => {
      const stageDeals = activeDeals.filter(d => d.stage === stage)
      return {
        stage: stageLabels[stage],
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
        count: stageDeals.length,
      }
    })

    setPipelineData(data)
  }

  const calculateDealHealths = (deals: Deal[]) => {
    const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage))
    const today = new Date()

    const stagePoints: Record<string, number> = {
      'new_lead': 10,
      'contacted': 25,
      'discovery': 40,
      'proposal_sent': 55,
      'negotiation': 70,
    }

    const healths: DealHealth[] = activeDeals.map(deal => {
      let score = stagePoints[deal.stage] || 10
      
      // Value bonus
      if (deal.value > 5000) score += 10
      else if (deal.value > 2000) score += 5

      // Timing penalty
      let isOverdue = false
      let daysOverdue = 0
      if (deal.next_step_date) {
        const stepDate = parseISO(deal.next_step_date)
        isOverdue = isBefore(stepDate, today)
        if (isOverdue) {
          daysOverdue = differenceInDays(today, stepDate)
          score -= 25
        } else if (differenceInDays(stepDate, today) < 3) {
          score -= 10
        }
      }

      return {
        id: deal.id,
        title: deal.title,
        account_name: deal.crm_accounts?.name || 'Unknown',
        value: deal.value || 0,
        stage: deal.stage,
        score: Math.max(0, Math.min(100, score)),
        next_step: deal.next_step,
        next_step_date: deal.next_step_date,
        isOverdue,
        daysOverdue,
      }
    })

    // Sort by urgency (overdue first, then by score)
    healths.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1
      if (!a.isOverdue && b.isOverdue) return 1
      return a.score - b.score
    })

    setDealHealths(healths.slice(0, 6)) // Top 6 most urgent
  }

  const calculateDataQualityAlerts = (
    accounts: any[], 
    contacts: any[], 
    deals: Deal[],
    members: any[]
  ) => {
    const alerts: DataQualityAlert[] = []

    // Accounts with NULL email
    const accountsNoEmail = accounts.filter(a => !a.email).length
    if (accountsNoEmail > 0) {
      alerts.push({
        type: 'accounts_no_email',
        count: accountsNoEmail,
        message: `${accountsNoEmail} account${accountsNoEmail > 1 ? 's' : ''} missing email`,
        icon: Mail,
        color: 'text-yellow-500',
      })
    }

    // Contacts never contacted
    const contactsNeverContacted = contacts.filter(c => !c.last_contacted_at).length
    if (contactsNeverContacted > 0) {
      alerts.push({
        type: 'contacts_never_contacted',
        count: contactsNeverContacted,
        message: `${contactsNeverContacted} contact${contactsNeverContacted > 1 ? 's' : ''} never contacted`,
        icon: Users,
        color: 'text-orange-500',
      })
    }

    // Deals with overdue next step
    const today = new Date()
    const overdueDeals = deals.filter(d => 
      !['won', 'lost'].includes(d.stage) && 
      d.next_step_date && 
      isBefore(parseISO(d.next_step_date), today)
    ).length
    if (overdueDeals > 0) {
      alerts.push({
        type: 'deals_overdue',
        count: overdueDeals,
        message: `${overdueDeals} deal${overdueDeals > 1 ? 's' : ''} with overdue next step`,
        icon: Calendar,
        color: 'text-red-500',
      })
    }

    // Won deals missing closed_at
    const wonDealsNoClosed = deals.filter(d => d.stage === 'won' && !d.closed_at).length
    if (wonDealsNoClosed > 0) {
      alerts.push({
        type: 'won_deals_no_closed',
        count: wonDealsNoClosed,
        message: `${wonDealsNoClosed} won deal${wonDealsNoClosed > 1 ? 's' : ''} missing closed date`,
        icon: CheckCircle,
        color: 'text-yellow-500',
      })
    }

    // Members not linked to auth
    const membersNoAuth = members.filter(m => !m.user_id).length
    if (membersNoAuth > 0) {
      alerts.push({
        type: 'members_no_auth',
        count: membersNoAuth,
        message: `${membersNoAuth} member${membersNoAuth > 1 ? 's' : ''} not linked to auth`,
        icon: Users,
        color: 'text-blue-500',
      })
    }

    setDataQualityAlerts(alerts)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 card-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-textSecondary">Pipeline Value</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.pipelineValue)}</h3>
              <p className="text-xs text-light-textSecondary mt-1">Active deals only</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <DollarSign size={20} className="text-brand-blue" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 card-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-textSecondary">Weighted Forecast</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.weightedForecast)}</h3>
              <p className="text-xs text-light-textSecondary mt-1">Value × Probability</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-brand-green" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 card-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-textSecondary">Closed Revenue</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.closedRevenue)}</h3>
              <p className="text-xs text-green-500 mt-1">Won deals</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 card-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-textSecondary">Monthly Recurring</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(metrics.monthlyRecurring)}</h3>
              <p className="text-xs text-brand-blue mt-1">From projects</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <DollarSign size={20} className="text-brand-blue" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Chart & Deal Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Stage Chart */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 card-shadow">
          <h3 className="font-semibold mb-4">Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.3} />
              <XAxis 
                dataKey="stage" 
                stroke="#94A3B8" 
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={11}
                tickFormatter={(v) => `$${v/1000}k`}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name, props) => [
                  formatCurrency(Number(value)),
                  `${props?.payload?.count || 0} deals`
                ]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={stageColors[Object.keys(stageLabels).find(k => stageLabels[k] === entry.stage) || 'new_lead']} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Deal Health Cards */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 card-shadow">
          <h3 className="font-semibold mb-4">Deal Health (by Urgency)</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {dealHealths.length === 0 ? (
              <p className="text-light-textSecondary text-center py-8">No active deals</p>
            ) : (
              dealHealths.map((deal) => (
                <div 
                  key={deal.id} 
                  className={`p-3 rounded-lg border ${
                    deal.isOverdue 
                      ? 'border-red-500/30 bg-red-500/5' 
                      : 'border-light-border dark:border-dark-border bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{deal.title}</h4>
                        {deal.isOverdue && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-red-500 text-white font-medium">
                            {deal.daysOverdue}d OVERDUE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-light-textSecondary">{deal.account_name}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-medium">{formatCurrency(deal.value)}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-brand-blue/10 text-brand-blue">
                          {stageLabels[deal.stage]}
                        </span>
                      </div>
                      {deal.next_step && (
                        <p className="text-xs text-light-textSecondary mt-1 truncate">
                          Next: {deal.next_step}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 text-right">
                      <div className={`text-lg font-bold ${getScoreTextColor(deal.score)}`}>
                        {deal.score}
                      </div>
                      <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${getScoreColor(deal.score)}`}
                          style={{ width: `${deal.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Data Quality Alerts */}
      {dataQualityAlerts.length > 0 && (
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-yellow-500" />
            <h3 className="font-semibold">Data Quality Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dataQualityAlerts.map((alert) => {
              const Icon = alert.icon
              return (
                <div 
                  key={alert.type}
                  className="flex items-center gap-3 p-3 rounded-lg bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary border border-light-border dark:border-dark-border"
                >
                  <Icon size={18} className={alert.color} />
                  <span className="text-sm">{alert.message}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}