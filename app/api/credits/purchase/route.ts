import { NextResponse } from "next/server"
import { purchaseCredits, CREDIT_PACKS } from "@/lib/monetization"
import { trackEvent } from "@/lib/events"

export async function POST(request: Request) {
  try {
    const { userId, packIndex } = await request.json()

    if (!userId || packIndex === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const pack = CREDIT_PACKS[packIndex]
    if (!pack) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 })
    }

    const result = await purchaseCredits(userId, pack)

    await trackEvent("credits_purchased", {
      userId,
      pack: pack.price,
      credits: result.credits,
    })

    return NextResponse.json({ success: true, credits: result.credits })
  } catch (error) {
    console.error("[credits] Error purchasing credits:", error)
    return NextResponse.json({ error: "Failed to purchase credits" }, { status: 500 })
  }
}
