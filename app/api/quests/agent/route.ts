import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { createAgentQuest } from "@/lib/quests-agent"

const agentQuestSchema = z.object({
  conversationId: z.string().optional(),
  sageId: z.string(),
  quest: z.object({
    title: z.string(),
    description: z.string(),
    goal: z.string(),
    rewardXp: z.number().int().min(10).max(1000).optional(),
    duration: z.number().int().min(1).max(30).optional(),
  }),
})

/**
 * Agent-initiated quest creation endpoint
 * Allows agents to create quests programmatically for users
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = agentQuestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const { conversationId, sageId, quest } = parsed.data

    // Create quest using server-side function
    const result = await createAgentQuest({
      userId: user.id,
      conversationId,
      sageId,
      quest,
    })

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
    })
  } catch (error) {
    console.error("[quests/agent] Error:", error)
    return NextResponse.json({ ok: false, error: "Failed to create quest" }, { status: 500 })
  }
}

