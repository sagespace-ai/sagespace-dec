import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) return null

  return {
    id: user.id,
    name: profile.name,
    email: user.email || profile.email,
    image: profile.image,
    credits: profile.credits || 200,
    xp: profile.xp || 0,
    role: profile.role || "user",
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
