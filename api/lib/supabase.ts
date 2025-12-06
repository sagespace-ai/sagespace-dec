/**
 * Supabase Client Configuration
 * 
 * This file creates Supabase clients for both client-side and server-side use.
 * The service role key is used for API routes (bypasses RLS).
 */

import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client (uses anon key, respects RLS)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client (uses service role key, bypasses RLS)
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role key')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper to get authenticated user from request
export async function getAuthenticatedUser(authToken: string | null) {
  if (!authToken) {
    return null
  }

  const supabase = createSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser(authToken)

  if (error || !user) {
    return null
  }

  return user
}
