'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'

// Hardcoded Supabase config
const SUPABASE_URL = 'https://jdlcgozjavmwlpjxqxiz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbGNnb3pqYXZtd2xwanhxeGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTQzMTYsImV4cCI6MjA4NjU5MDMxNn0.EeTUTIM9_lZO5oyiGiENjC66p2RloOeBSnpls4Cej7A'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [supabase, setSupabase] = useState<any>(null)

  // Lazy load Supabase client only on client side
  useEffect(() => {
    import('@supabase/supabase-js').then(({ createClient }) => {
      setSupabase(createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login response:', { data, error })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data?.session) {
        console.log('Login successful, waiting for session to settle...')
        
        // Wait a moment for the session to be properly stored
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('Redirecting to dashboard...')
        
        // Try Next.js router first, then fallback to window.location
        try {
          router.push('/')
          router.refresh()
        } catch (e) {
          console.log('Router push failed, using window.location')
          window.location.href = '/'
        }
        
        // Force reload after a short delay if router doesn't work
        setTimeout(() => {
          console.log('Forcing page reload...')
          window.location.href = '/'
        }, 1000)
      } else {
        setError('No session created. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      <div className="w-full max-w-md p-8 bg-light-surface dark:bg-dark-surface rounded-2xl card-shadow">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to BizNet</h1>
          <p className="text-light-textSecondary dark:text-dark-textSecondary">
            Sign in to access your CRM
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary border border-light-border dark:border-dark-border focus:outline-none focus:border-brand-blue transition-colors"
              placeholder="you@biznet.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-light-surfaceSecondary dark:bg-dark-surfaceSecondary border border-light-border dark:border-dark-border focus:outline-none focus:border-brand-blue transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !supabase}
            className="w-full py-2.5 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-light-textSecondary dark:text-dark-textSecondary">
          BizNet-only access. Contact your administrator for an account.
        </p>
      </div>
    </div>
  )
}