import { supabase } from "./db"
import type { CreditMeta } from "@/types"
import { DEMO_MODE, getDemoCredits, debitDemoCredits } from "@/lib/demo"

const TOKENS_PER_CREDIT = 750

export function tokensToCredits(tokens: number): number {
  return Math.ceil(tokens / TOKENS_PER_CREDIT)
}

export async function getUserCredits(userId: string): Promise<number> {
  if (DEMO_MODE.enabled) {
    return getDemoCredits()
  }

  const { data, error } = await supabase.from("profiles").select("credits").eq("id", userId).single()

  if (error) return 0
  return data?.credits || 0
}

export async function debitCredits(
  userId: string,
  units: number,
  reason: string,
  meta?: CreditMeta,
): Promise<{ success: boolean; balance: number; error?: string }> {
  try {
    if (DEMO_MODE.enabled) {
      const success = debitDemoCredits(units)
      return {
        success,
        balance: getDemoCredits(),
        error: success ? undefined : "Insufficient demo credits",
      }
    }

    // Get current credits
    const { data: user, error: fetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single()

    if (fetchError || !user) {
      return { success: false, balance: 0, error: "User not found" }
    }

    const newBalance = user.credits - units

    if (newBalance < 0) {
      return { success: false, balance: user.credits, error: "Insufficient credits" }
    }

    // Update user credits
    const { error: updateError } = await supabase.from("profiles").update({ credits: newBalance }).eq("id", userId)

    if (updateError) {
      return { success: false, balance: user.credits, error: "Failed to debit credits" }
    }

    return { success: true, balance: newBalance }
  } catch (error) {
    console.error("[credits] Error debiting credits:", error)
    return { success: false, balance: 0, error: "Failed to debit credits" }
  }
}

export async function creditCredits(
  userId: string,
  units: number,
  reason: string,
  meta?: CreditMeta,
): Promise<{ success: boolean; balance: number }> {
  try {
    // Get current credits and increment
    const { data: user, error: fetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single()

    if (fetchError || !user) {
      return { success: false, balance: 0 }
    }

    const newBalance = user.credits + units

    const { error: updateError } = await supabase.from("profiles").update({ credits: newBalance }).eq("id", userId)

    if (updateError) {
      return { success: false, balance: user.credits }
    }

    return { success: true, balance: newBalance }
  } catch (error) {
    console.error("[credits] Error crediting credits:", error)
    return { success: false, balance: 0 }
  }
}

export async function getCreditHistory(userId: string, limit = 50) {
  // Note: credit_ledger table doesn't exist in schema, return empty array
  return []
}
