export type KanbanType = 'pipeline' | 'delivery'

export interface Deal {
  id: string
  title: string
  stage: string
  value: number
  probability: number
  account_id?: string
  contact_id?: string
  owner_id?: string
  service_type?: string[]
  next_step?: string
  next_step_date?: string
  lost_reason?: string
  closed_at?: string
  crm_accounts?: { name: string }
  // Display-only fields populated client-side from joined data
  company_name?: string
  owner_name?: string
  priority?: 'high' | 'medium' | 'low'
  created_at: string
  updated_at: string
}

export interface Account {
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

export interface Contact {
  id: string
  name: string
  role?: string
  email?: string
  phone?: string
  preferred_contact?: 'email' | 'phone' | 'text'
  company_id?: string
  company_name?: string
  notes?: string
  last_contacted?: string
  next_follow_up?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'high' | 'medium' | 'low'
  due_date?: string
  assigned_to?: string
  assigned_name?: string
  deal_id?: string
  deal_title?: string
  account_id?: string
  account_name?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  content: string
  author_id: string
  author_name: string
  deal_id?: string
  account_id?: string
  task_id?: string
  is_internal: boolean
  created_at: string
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'file'
  description: string
  author_id: string
  author_name: string
  deal_id?: string
  account_id?: string
  contact_id?: string
  created_at: string
}