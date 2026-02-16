export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/dashboard'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session error:', error)
      redirect('/login')
    }

    if (!session) {
      console.log('No session found, redirecting to login')
      redirect('/login')
    }

    console.log('Session found for user:', session.user.email)
    return <Dashboard user={session.user} />
  } catch (err) {
    console.error('Home page error:', err)
    redirect('/login')
  }
}