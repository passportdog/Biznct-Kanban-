'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Deal } from '@/types'

interface DealScore {
  deal_id: string
  score: number // 0-100
  factors: {
    name: string
    impact: 'positive' | 'negative' | 'neutral'
    weight: number
  }[]
  prediction: 'likely_win' | 'at_risk' | 'stalled' | 'needs_attention'
  recommendation: string
}

export default function DealAIInsights() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [scores, setScores] = useState<Record<string, DealScore>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDealsAndScore()
  }, [])

  const fetchDealsAndScore = async () => {
    const { data } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('type', 'pipeline')
      .neq('stage', 'won')
      .neq('stage', 'lost')
      .order('value', { ascending: false })
      .limit(10)

    if (data) {
      setDeals(data)
      // Calculate AI scores
      const calculatedScores: Record<string, DealScore> = {}
      data.forEach(deal => {
        calculatedScores[deal.id] = calculateDealScore(deal)
      })
      setScores(calculatedScores)
    }
    setLoading(false)
  }

  const calculateDealScore = (deal: Deal): DealScore => {
    let score = 50 // Base score
    const factors: DealScore['factors'] = []

    // Stage factor
    const stageWeights: Record<string, number> = {
      'lead': 10,
      'contacted': 20,
      'discovery': 35,
      'proposal': 60,
      'negotiation': 80,
    }
    const stageWeight = stageWeights[deal.stage] || 10
    score += stageWeight
    factors.push({
      name: `Stage: ${deal.stage}`,
      impact: stageWeight > 30 ? 'positive' : 'neutral',
      weight: stageWeight
    })

    // Value factor
    if (deal.value > 10000) {
      score += 10
      factors.push({ name: 'High value deal', impact: 'positive', weight: 10 })
    }

    // Has next step
    if (deal.next_step && deal.next_step_date) {
      const daysUntil = Math.ceil((new Date(deal.next_step_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntil < 0) {
        score -= 15
        factors.push({ name: 'Next step overdue', impact: 'negative', weight: -15 })
      } else if (daysUntil <= 3) {
        score += 10
        factors.push({ name: 'Follow-up scheduled soon', impact: 'positive', weight: 10 })
      }
    } else {
      score -= 20
      factors.push({ name: 'No next step defined', impact: 'negative', weight: -20 })
    }

    // Priority
    if (deal.priority === 'high') {
      score += 5
      factors.push({ name: 'High priority', impact: 'positive', weight: 5 })
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score))

    // Determine prediction
    let prediction: DealScore['prediction']
    if (score >= 75) prediction = 'likely_win'
    else if (score >= 50) prediction = 'needs_attention'
    else if (score >= 30) prediction = 'at_risk'
    else prediction = 'stalled'

    // Generate recommendation
    let recommendation = ''
    if (prediction === 'likely_win') {
      recommendation = 'This deal is on track. Keep momentum with regular follow-ups.'
    } else if (prediction === 'needs_attention') {
      recommendation = 'Schedule a call to address any concerns and move forward.'
    } else if (prediction === 'at_risk') {
      recommendation = 'Deal is stalling. Consider a discount or added value proposition.'
    } else {
      recommendation = 'Urgent: No activity detected. Immediate outreach required.'
    }

    return {
      deal_id: deal.id,
      score,
      factors,
      prediction,
      recommendation
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    if (score >= 30) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    if (score >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getPredictionIcon = (prediction: DealScore['prediction']) => {
    switch (prediction) {
      case 'likely_win': return <CheckCircle size={16} className="text-green-500" />
      case 'needs_attention': return <Clock size={16} className="text-yellow-500" />
      case 'at_risk': return <AlertTriangle size={16} className="text-orange-500" />
      case 'stalled': return <XCircle size={16} className="text-red-500" />
    }
  }

  const getPredictionLabel = (prediction: DealScore['prediction']) => {
    switch (prediction) {
      case 'likely_win': return 'Likely to Win'
      case 'needs_attention': return 'Needs Attention'
      case 'at_risk': return 'At Risk'
      case 'stalled': return 'Stalled'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    )
  }

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl card-shadow overflow-hidden">
      <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand-blue" />
          <h3 className="font-semibold">AI Deal Scoring</h3>
        </div>
        <span className="text-xs text-light-textSecondary">Top 10 deals by value</span>
      </div>

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {deals.map((deal) => {
          const score = scores[deal.id]
          if (!score) return null

          return (
            <div key={deal.id} className="p-4 rounded-lg bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{deal.title}</h4>
                  <p className="text-sm text-light-textSecondary">{deal.company_name}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {getPredictionIcon(score.prediction)}
                  <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                    {score.score}
                  </div>
                </div>
              </div>

              {/* Score Bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full ${getScoreBg(score.score)} transition-all`}
                  style={{ width: `${score.score}%` }}
                />
              </div>

              {/* Prediction Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  score.prediction === 'likely_win' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                  score.prediction === 'needs_attention' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' :
                  score.prediction === 'at_risk' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30'
                }`}>
                  {getPredictionLabel(score.prediction)}
                </span>
                <span className="text-sm text-light-textSecondary">
                  ${deal.value?.toLocaleString()}
                </span>
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-lg bg-brand-blue/5 border border-brand-blue/10">
                <div className="flex items-start gap-2">
                  <TrendingUp size={14} className="text-brand-blue mt-0.5" />
                  <p className="text-sm text-light-textSecondary">{score.recommendation}</p>
                </div>
              </div>

              {/* Key Factors */}
              <div className="mt-3 flex flex-wrap gap-2">
                {score.factors.slice(0, 3).map((factor, idx) => (
                  <span 
                    key={idx}
                    className={`text-xs px-2 py-1 rounded ${
                      factor.impact === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                      factor.impact === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    {factor.name}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}