import { NextResponse } from "next/server"
import { createSubscription, SUBSCRIPTION_TIERS } from "@/lib/monetization"
import { trackEvent } from "@/lib/events"

export async function POST(request: Request) {
  try {
    const { userId, tier } = await request.json()

    if (!userId || !tier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["pro", "enterprise"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }

    const subscription = await createSubscription(userId, tier)

    await trackEvent("subscription_created", {
      userId,
      tier,
      subscriptionId: subscription.userId, // Use userId as subscription identifier
    })

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error("[subscriptions] Error creating subscription:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Return subscription tiers and user's current subscription
    return NextResponse.json({
      tiers: SUBSCRIPTION_TIERS,
      current: null, // TODO: Fetch user's active subscription
    })
  } catch (error) {
    console.error("[subscriptions] Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}
