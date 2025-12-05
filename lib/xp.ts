import { supabase } from "./db"
import { DEMO_MODE, getDemoXP, awardDemoXP } from "@/lib/demo"

const XP_PER_LEVEL = 100

export const XP_REWARDS = {
  first_chat: 10,
  chat_turn: 5,
  council_complete: 8,
  artifact_created: 3,
  daily_streak: 2,
  persona_created: 5,
} as const

export type XPReason = keyof typeof XP_REWARDS

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function getNextLevelXP(xp: number): number {
  const currentLevel = getLevel(xp)
  return currentLevel * XP_PER_LEVEL
}

export async function awardXP(
  userId: string,
  reason: XPReason,
  customAmount?: number,
): Promise<{ success: boolean; xp: number; level: number; leveledUp: boolean }> {
  try {
    if (DEMO_MODE.enabled) {
      const amount = customAmount ?? XP_REWARDS[reason]
      awardDemoXP(amount)
      const totalXP = getDemoXP()
      const oldLevel = getLevel(totalXP - amount)
      const newLevel = getLevel(totalXP)
      return {
        success: true,
        xp: totalXP,
        level: newLevel,
        leveledUp: newLevel > oldLevel,
      }
    }

    const { data: user, error: fetchError } = await supabase.from("profiles").select("xp").eq("id", userId).single()

    if (fetchError || !user) {
      console.error("[xp] Error fetching user:", fetchError)
      return { success: false, xp: 0, level: 1, leveledUp: false }
    }

    const oldLevel = getLevel(user.xp)
    const amount = customAmount ?? XP_REWARDS[reason]
    const newXP = user.xp + amount

    const { error: updateError } = await supabase.from("profiles").update({ xp: newXP }).eq("id", userId)

    if (updateError) {
      console.error("[xp] Error updating XP:", updateError)
      return { success: false, xp: 0, level: 1, leveledUp: false }
    }

    const newLevel = getLevel(newXP)
    const leveledUp = newLevel > oldLevel

    return {
      success: true,
      xp: newXP,
      level: newLevel,
      leveledUp,
    }
  } catch (error) {
    console.error("[xp] Error awarding XP:", error)
    return { success: false, xp: 0, level: 1, leveledUp: false }
  }
}

export async function getUserXPData(userId: string) {
  if (DEMO_MODE.enabled) {
    const xp = getDemoXP()
    const level = getLevel(xp)
    const nextLevelAt = getNextLevelXP(xp)
    return { xp, level, nextLevelAt }
  }

  const { data: user, error } = await supabase.from("profiles").select("xp").eq("id", userId).single()

  if (error || !user) {
    console.error("[xp] Error fetching user XP data:", error)
    return null
  }

  const level = getLevel(user.xp)
  const nextLevelAt = getNextLevelXP(user.xp)

  return {
    xp: user.xp,
    level,
    nextLevelAt,
  }
}

export async function awardBadge(userId: string, slug: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("badges").insert({ user_id: userId, slug })

    if (error) {
      console.error("[xp] Badge table may not exist or badge already awarded:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("[xp] Error awarding badge:", error)
    return false
  }
}

export async function getUserBadges(userId: string) {
  const { data: badges, error } = await supabase
    .from("badges")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[xp] Error fetching badges:", error)
    return []
  }

  return badges || []
}
