'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Deal } from '@/types'

export default function AnalyticsDashboard() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    const { data } = await supabase
      .from('crm_deals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setDeals(data)
    setLoading(false)
  }

  // Calculate metrics
  const totalPipeline = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const wonDeals = deals.filter(d => d.stage === 'won')
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0)
  const avgDealSize = deals.length > 0 ? totalPipeline / deals.length : 0
  const conversionRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0

  // Pipeline by stage
  const stageData = [
    { name: 'Lead', value: deals.filter(d => d.stage === 'lead').length, color: '#94A3B8' },
    { name: 'Contacted', value: deals.filter(d => d.stage === 'contacted').length, color: '#3B82F6' },
    { name: 'Discovery', value: deals.filter(d => d.stage === 'discovery').length, color: '#8B5CF6' },
    { name: 'Proposal', value: deals.filter(d => d.stage === 'proposal').length, color: '#EAB308' },
    { name: 'Negotiation', value: deals.filter(d => d.stage === 'negotiation').length, color: '#F97316' },
    { name: 'Won', value: wonDeals.length, color: '#22C55E' },
  ]

  // Revenue forecast (mock data - would be real in production)
  const forecastData = [
    { month: 'Jan', actual: 12000, projected: 15000 },
    { month: 'Feb', actual: 18000, projected: 20000 },
    { month: 'Mar', actual: 15000, projected: 18000 },
    { month: 'Apr', actual: 22000, projected: 25000 },
    { month: 'May', actual: 28000, projected: 30000 },
    { month: 'Jun', actual: 32000, projected: 35000 },
  ]

  const MetricCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 card-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
          <Icon size={20} className="text-brand-blue" />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-light-textSecondary dark:text-dark-textSecondary">Real-time insights into your sales performance</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Pipeline" 
          value={`$${totalPipeline.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={DollarSign}
        />
        <MetricCard 
          title="Won Revenue" 
          value={`$${wonValue.toLocaleString()}`}
          change="+8.2%"
          trend="up"
          icon={TrendingUp}
        />
        <MetricCard 
          title="Avg Deal Size" 
          value={`$${Math.round(avgDealSize).toLocaleString()}`}
          change="-2.1%"
          trend="down"
          icon={Target}
        />
        <MetricCard 
          title="Conversion Rate" 
          value={`${conversionRate.toFixed(1)}%`}
          change="+5.4%"
          trend="up"
          icon={Activity}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Forecast */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 card-shadow">
          <h3 className="font-semibold mb-4">Revenue Forecast</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, '']}
              />
              <Line type="monotone" dataKey="actual" stroke="#2F6EDB" strokeWidth={2} name="Actual" />
              <Line type="monotone" dataKey="projected" stroke="#6DBE45" strokeWidth={2} strokeDasharray="5 5" name="Projected" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 card-shadow">
          <h3 className="font-semibold mb-4">Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-brand-blue/5 to-brand-green/5 rounded-xl p-6 border border-brand-blue/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">AI Insights</h3>
            <ul className="space-y-2 text-sm text-light-textSecondary dark:text-dark-textSecondary">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                Your pipeline velocity is 23% faster than last month
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                Deals in "Proposal Sent" stage have 68% win rate
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                3 deals haven't had activity in 7+ days - follow up recommended
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}