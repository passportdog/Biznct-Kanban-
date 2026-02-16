'use client'

import { User } from '@supabase/supabase-js'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Truck, 
  Building2, 
  CheckSquare,
  BarChart3,
  Sparkles,
  LogOut 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import BiznctLogo from './biznct-logo'

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

const aiItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
]

export default function Sidebar({ activeView, onViewChange, user }: SidebarProps) {
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border gap-3">
        <BiznctLogo className="w-8 h-8" />
        <h1 className="text-xl font-bold text-brand-blue">Biznct</h1>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-light-textSecondary uppercase tracking-wide mb-2">
            Main
          </p>
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
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-light-textSecondary uppercase tracking-wide mb-2">
            Intelligence
          </p>
          {aiItems.map((item) => {
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
        </div>
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