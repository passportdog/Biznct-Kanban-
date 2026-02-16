'use client'

import { User } from '@supabase/supabase-js'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Truck, 
  Building2, 
  CheckSquare,
  LogOut 
} from 'lucide-react'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  user: User
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Sales Pipeline', icon: TrendingUp },
  { id: 'delivery', label: 'Client Delivery', icon: Truck },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
]

// Hardcoded Supabase config
const SUPABASE_URL = 'https://jdlcgozjavmwlpjxqxiz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbGNnb3pqYXZtd2xwanhxeGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTQzMTYsImV4cCI6MjA4NjU5MDMxNn0.EeTUTIM9_lZO5oyiGiENjC66p2RloOeBSnpls4Cej7A'

export default function Sidebar({ activeView, onViewChange, user }: SidebarProps) {
  const handleLogout = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
        <h1 className="text-xl font-bold text-brand-blue">BizNet</h1>
      </div>

      <nav className="flex-1 py-4 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive 
                  ? 'bg-brand-blue/10 text-brand-blue dark:bg-brand-green/10 dark:text-brand-green border-l-2 border-brand-blue dark:border-brand-green' 
                  : 'text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceSecondary dark:hover:bg-dark-surfaceSecondary'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="mb-4 px-3">
          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary truncate">
            {user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceSecondary dark:hover:bg-dark-surfaceSecondary transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}