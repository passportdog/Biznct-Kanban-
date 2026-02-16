import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jdlcgozjavmwlpjxqxiz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbGNnb3pqYXZtd2xwanhxeGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTQzMTYsImV4cCI6MjA4NjU5MDMxNn0.EeTUTIM9_lZO5oyiGiENjC66p2RloOeBSnpls4Cej7A'

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey)
}