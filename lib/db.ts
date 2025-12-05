import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export type Agent = {
  id: string
  name: string
  avatar: string
  role: string
  status: string
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  name: string
  image: string | null
  role: string
  tier: string
  credits: number
  xp: number
  referral_code: string | null
  referred_by: string | null
  created_at: string
  updated_at: string
}

export type Conversation = {
  id: string
  user_id: string
  agent_id: string
  title: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  role: string
  content: string
  created_at: string
}

export type Database = {
  agents: Agent
  profiles: Profile
  conversations: Conversation
  messages: Message
}

// Create a Supabase client with service role key for server-side database operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export const prisma = supabase
export const db = supabase
