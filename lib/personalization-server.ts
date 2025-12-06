/**
 * Server-only personalization functions
 * This file should NOT be imported in client components
 */

import type { UserProfile } from "@/types/user"

/**
 * Get user profile from Supabase (or return null if not available)
 * NOTE: This function should only be called from server components or API routes
 * For client components, fetch the profile via an API route instead
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, avatar_url")
      .eq("id", userId)
      .single()

    if (!profile) return null

    // For now, we'll need to add profession/interests/goals to the profiles table
    // For MVP, we can infer from existing data or use defaults
    return {
      id: profile.id,
      name: profile.name || undefined,
      email: profile.email || undefined,
      avatarUrl: profile.avatar_url || undefined,
      // TODO: Add profession, interests, goals fields to profiles table
      profession: undefined,
      interests: undefined,
      goals: undefined,
    }
  } catch (error) {
    console.error("[personalization] Error fetching user profile:", error)
    return null
  }
}

