import { createClient } from '@/lib/supabase/server'
import Dashboard from '@/components/dashboard'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Middleware already handles redirect if no user,
  // but this is a safety check
  if (!user) {
    return null
  }

  return <Dashboard user={user} />
}