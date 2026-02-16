'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Home, 
  TrendingUp, 
  Truck, 
  Building2, 
  CheckSquare,
  Plus,
  Settings,
  Moon,
  Sun,
  LogOut,
  Keyboard
} from 'lucide-react'

interface Command {
  id: string
  title: string
  shortcut?: string
  icon: any
  action: () => void
  category: string
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const commands: Command[] = [
    // Navigation
    { id: 'home', title: 'Go to Dashboard', shortcut: 'G D', icon: Home, category: 'Navigation', action: () => router.push('/') },
    { id: 'pipeline', title: 'Go to Sales Pipeline', shortcut: 'G P', icon: TrendingUp, category: 'Navigation', action: () => router.push('/?view=pipeline') },
    { id: 'delivery', title: 'Go to Client Delivery', shortcut: 'G C', icon: Truck, category: 'Navigation', action: () => router.push('/?view=delivery') },
    { id: 'accounts', title: 'Go to Accounts', shortcut: 'G A', icon: Building2, category: 'Navigation', action: () => router.push('/?view=accounts') },
    { id: 'tasks', title: 'Go to Tasks', shortcut: 'G T', icon: CheckSquare, category: 'Navigation', action: () => router.push('/?view=tasks') },
    
    // Actions
    { id: 'new-deal', title: 'Create New Deal', shortcut: 'C D', icon: Plus, category: 'Actions', action: () => { /* trigger new deal modal */ } },
    { id: 'new-account', title: 'Create New Account', shortcut: 'C A', icon: Plus, category: 'Actions', action: () => { } },
    { id: 'new-task', title: 'Create New Task', shortcut: 'C T', icon: Plus, category: 'Actions', action: () => { } },
    
    // Settings
    { id: 'toggle-theme', title: 'Toggle Dark Mode', shortcut: '⌘ D', icon: Moon, category: 'Settings', action: () => { document.documentElement.classList.toggle('dark') } },
    { id: 'settings', title: 'Open Settings', icon: Settings, category: 'Settings', action: () => { } },
    { id: 'logout', title: 'Logout', icon: LogOut, category: 'Settings', action: () => { window.location.href = '/login' } },
  ]

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  )

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-light-surface dark:bg-dark-surface rounded-xl card-shadow overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-light-border dark:border-dark-border">
          <Search size={20} className="text-light-textSecondary" />
          <input
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <kbd className="px-2 py-1 rounded bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary text-xs">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category} className="mb-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-light-textSecondary uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-1">
                {cmds.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action()
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-light-surfaceSecondary dark:hover:bg-dark-surfaceSecondary transition-colors text-left group"
                    >
                      <Icon size={18} className="text-light-textSecondary group-hover:text-brand-blue" />
                      <span className="flex-1">{cmd.title}</span>
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 rounded bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary text-xs text-light-textSecondary">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-light-textSecondary">
              <Keyboard size={48} className="mx-auto mb-4 opacity-50" />
              <p>No commands found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-3 border-t border-light-border dark:border-dark-border text-xs text-light-textSecondary">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-light-surfaceSecondary">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-light-surfaceSecondary">↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-light-surfaceSecondary">↵</kbd>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-light-surfaceSecondary">esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}