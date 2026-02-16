'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { 
  User, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  Phone, 
  Mail, 
  Calendar,
  MoreHorizontal
} from 'lucide-react'

interface Activity {
  id: string
  type: 'comment' | 'status_change' | 'file_upload' | 'task_complete' | 'call' | 'email' | 'meeting'
  description: string
  author: string
  author_avatar?: string
  deal_title?: string
  deal_id?: string
  created_at: string
  metadata?: any
}

const activityIcons = {
  comment: MessageSquare,
  status_change: CheckCircle,
  file_upload: FileText,
  task_complete: CheckCircle,
  call: Phone,
  email: Mail,
  meeting: Calendar,
}

const activityColors = {
  comment: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  status_change: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  file_upload: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  task_complete: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  call: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  email: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  meeting: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
}

export default function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchActivities()
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('activities')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crm_activities' },
        (payload) => {
          fetchActivities()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchActivities = async () => {
    const { data } = await supabase
      .from('crm_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) {
      setActivities(data)
    }
    setLoading(false)
  }

  // Mock data for demo
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'status_change',
      description: 'moved "Manhattan Gyros Website" to Proposal Sent',
      author: 'Marcus',
      deal_title: 'Manhattan Gyros Website',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      type: 'comment',
      description: 'added a comment: "Client wants to add online ordering. Need to scope this."',
      author: 'Kenny',
      deal_title: 'Precision Golf Carts Redesign',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      type: 'call',
      description: 'logged a 15-min call with owner',
      author: 'Marcus',
      deal_title: 'Southern Aggregates SEO',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: '4',
      type: 'file_upload',
      description: 'uploaded "Proposal_v2.pdf"',
      author: 'Kenny',
      deal_title: 'Manhattan Gyros Website',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: '5',
      type: 'task_complete',
      description: 'completed task "Send discovery questionnaire"',
      author: 'Marcus',
      deal_title: 'MedSpa Marketing Package',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

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
        <h3 className="font-semibold">Activity Timeline</h3>
        <button className="text-sm text-brand-blue hover:underline">View all</button>
      </div>
      
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className="space-y-4">
          {displayActivities.map((activity, index) => {
            const Icon = activityIcons[activity.type]
            const colorClass = activityColors[activity.type]
            
            return (
              <div key={activity.id} className="flex gap-3 group">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={14} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.author}</span>{' '}
                    <span className="text-light-textSecondary dark:text-dark-textSecondary">
                      {activity.description}
                    </span>
                  </p>
                  
                  {activity.deal_title && (
                    <p className="text-xs text-brand-blue mt-1 hover:underline cursor-pointer">
                      {activity.deal_title}
                    </p>
                  )}
                  
                  <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                {/* Actions */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-light-surfaceSecondary dark:hover:bg-dark-surfaceSecondary rounded">
                  <MoreHorizontal size={14} className="text-light-textSecondary" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}