import { NextResponse } from "next/server"
import { purchaseAgent } from "@/lib/monetization"
import { trackEvent } from "@/lib/events"

export async function POST(request: Request) {
  try {
    const { userId, agentId } = await request.json()

    if (!userId || !agentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await purchaseAgent(userId, agentId)

    await trackEvent("agent_purchased", { userId, agentId })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[marketplace] Error purchasing agent:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
