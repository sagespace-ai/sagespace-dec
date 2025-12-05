import { supabase } from "./db"

export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    credits: 200,
    features: ["1 Universe", "5 Sages", "Basic Analytics", "200 Credits/month"],
  },
  pro: {
    name: "Pro",
    price: 19,
    credits: 1000,
    features: [
      "Unlimited Universes",
      "20 Sages",
      "Advanced Analytics",
      "1,000 Credits/month",
      "Priority Support",
      "Custom Personas",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    credits: 5000,
    features: [
      "Everything in Pro",
      "Unlimited Sages",
      "Governance Dashboard",
      "5,000 Credits/month",
      "Compliance Tools (GDPR, HIPAA, SOC2)",
      "Dedicated Support",
      "Custom Integrations",
    ],
  },
} as const

export const CREDIT_PACKS = [
  { credits: 100, price: 5, bonus: 0 },
  { credits: 250, price: 10, bonus: 50 },
  { credits: 600, price: 25, bonus: 150 },
] as const

export async function getUserSubscription(userId: string) {
  const { data } = await supabase.from("profiles").select("tier").eq("id", userId).single()

  return data?.tier ? { tier: data.tier, status: "active" } : null
}

export async function createSubscription(userId: string, tier: string, stripeSubscriptionId?: string) {
  const periodStart = new Date()
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const { data, error } = await supabase.from("profiles").update({ tier }).eq("id", userId).select().single()

  if (error) throw error

  return {
    userId,
    tier,
    status: "active",
    stripeSubscriptionId,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
  }
}

export async function purchaseCredits(
  userId: string,
  pack: (typeof CREDIT_PACKS)[number],
  stripePaymentIntentId?: string,
) {
  const totalCredits = pack.credits + pack.bonus

  const { data: user } = await supabase.from("profiles").select("credits").eq("id", userId).single()

  if (!user) throw new Error("User not found")

  await supabase
    .from("profiles")
    .update({ credits: user.credits + totalCredits })
    .eq("id", userId)

  return { success: true, credits: totalCredits }
}

export async function purchaseAgent(userId: string, agentId: string) {
  const { data: agent, error: agentError } = await supabase.from("agents").select("*").eq("id", agentId).single()

  if (agentError || !agent) {
    throw new Error("Agent not found")
  }

  const price = 100

  const { data: user, error: userError } = await supabase.from("profiles").select("credits").eq("id", userId).single()

  if (userError || !user || user.credits < price) {
    throw new Error("Insufficient credits")
  }

  await supabase
    .from("profiles")
    .update({ credits: user.credits - price })
    .eq("id", userId)

  return { success: true }
}

export async function generateReferralCode(userId: string) {
  const code = `SAGE${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  try {
    await supabase.from("profiles").update({ referral_code: code }).eq("id", userId)

    return code
  } catch (error) {
    console.error("Error generating referral code:", error)
    return code
  }
}

export async function trackReferralClick(code: string) {
  console.log("Referral click tracked:", code)
}

export async function trackReferralSignup(code: string, newUserId: string) {
  try {
    const { data: referrer } = await supabase.from("profiles").select("id, credits").eq("referral_code", code).single()

    if (!referrer) return

    await supabase
      .from("profiles")
      .update({ credits: (referrer.credits || 0) + 50 })
      .eq("id", referrer.id)

    await supabase.from("profiles").update({ referred_by: code }).eq("id", newUserId)
  } catch (error) {
    console.error("Error tracking referral signup:", error)
  }
}
