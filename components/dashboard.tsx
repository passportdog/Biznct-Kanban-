'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import Sidebar from './sidebar'
import KanbanBoard from './kanban-board'
import AIAssistant from './ai-assistant'
import AnalyticsDashboard from './analytics-dashboard'
import ActivityTimeline from './activity-timeline'
import CommandPalette from './command-palette'
import DealAIInsights from './deal-ai-insights'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeView, setActiveView] = useState('dashboard')
  const [showAI, setShowAI] = useState(false)

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar activeView={activeView} onViewChange={setActiveView} user={user} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-light-border dark:border-dark-border flex items-center justify-between px-6 bg-light-surface dark:bg-dark-surface">
          <div>
            <h1 className="text-xl font-semibold">
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'pipeline' && 'Sales Pipeline'}
              {activeView === 'delivery' && 'Client Delivery'}
              {activeView === 'accounts' && 'Accounts'}
              {activeView === 'tasks' && 'Tasks'}
              {activeView === 'analytics' && 'Analytics'}
              {activeView === 'ai-insights' && 'AI Insights'}
            </h1>
            <p className="text-xs text-light-textSecondary">
              {activeView === 'dashboard' && 'Welcome back! Here\'s what\'s happening today.'}
              {activeView === 'pipeline' && 'Track and manage your sales opportunities'}
              {activeView === 'delivery' && 'Manage client projects and deliverables'}
              {activeView === 'accounts' && 'Manage your client relationships'}
              {activeView === 'tasks' && 'Stay on top of your to-do list'}
              {activeView === 'analytics' && 'Deep insights into your sales performance'}
              {activeView === 'ai-insights' && 'AI-powered deal predictions and recommendations'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <span>AI Assistant</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-light-textSecondary hidden sm:block">{user.email}</span>
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {activeView === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <AnalyticsDashboard />
                </div>
                <div className="space-y-6">
                  <ActivityTimeline />
                </div>
              </div>
            )}
            {activeView === 'pipeline' && <KanbanBoard type="pipeline" />}
            {activeView === 'delivery' && <KanbanBoard type="delivery" />}
            {activeView === 'accounts' && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <span className="text-4xl">🏢</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Accounts Management</h3>
                <p className="text-light-textSecondary">Full accounts directory coming soon</p>
              </div>
            )}
            {activeView === 'tasks' && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Task Management</h3>
                <p className="text-light-textSecondary">Advanced task tracking coming soon</p>
              </div>
            )}
            {activeView === 'analytics' && <AnalyticsDashboard />}
            {activeView === 'ai-insights' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DealAIInsights />
                <ActivityTimeline />
              </div>
            )}
          </div>
          
          {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
        </div>
      </main>

      <CommandPalette />
    </div>
  )
}