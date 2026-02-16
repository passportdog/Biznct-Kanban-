'use client'

import { useState } from 'react'
import { X, Send, Bot, Sparkles } from 'lucide-react'

interface AIAssistantProps {
  onClose: () => void
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your BizNet AI assistant. I can help you:\n\n• Summarize your pipeline\n• Draft follow-up messages\n• Create tasks from notes\n• Identify stuck deals\n• Generate standup agendas\n\nWhat would you like help with?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    
    setMessages([...messages, { role: 'user', content: input }])
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I\'m analyzing your request. In the full version, I\'ll connect to your CRM data and provide actionable insights.' 
      }])
    }, 1000)
    
    setInput('')
  }

  const suggestions = [
    'Summarize today\'s pipeline',
    'What deals need follow-up?',
    'Draft follow-up for Manhattan Gyros',
    'Create onboarding checklist',
  ]

  return (
    <div className="w-96 bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border flex flex-col">
      <div className="h-16 border-b border-light-border dark:border-dark-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">BizNet AI</h3>
            <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">Your CRM assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-light-surfaceSecondary dark:hover:bg-dark-surfaceSecondary rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                message.role === 'user'
                  ? 'bg-brand-blue text-white'
                  : 'bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary border border-light-border dark:border-dark-border'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className="text-xs px-2 py-1 rounded-full bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary text-light-textSecondary dark:text-dark-textSecondary hover:bg-brand-blue/10 hover:text-brand-blue transition-colors flex items-center gap-1"
            >
              <Sparkles size={10} />
              {suggestion}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 rounded-lg bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary border border-light-border dark:border-dark-border text-sm focus:outline-none focus:border-brand-blue"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}