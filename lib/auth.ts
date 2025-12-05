import { createClient } from "@/lib/supabase/server"

export async function getServerSession() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    return null
  }

  return {
    user: {
      id: user.id,
      name: profile.name,
      email: user.email || profile.email,
      image: profile.image,
      credits: profile.credits || 200,
      xp: profile.xp || 0,
      role: profile.role || "user",
    },
  }
}

// Legacy compatibility - authOptions is no longer used but kept for existing imports
export const authOptions = {}
