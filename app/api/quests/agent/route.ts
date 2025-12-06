import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import { z } from "zod"
import type { QuestDraft } from "@/lib/types/agent"

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

    // Create quest
    const questId = `quest-${nanoid()}`
    const questData = {
      id: questId,
      userId: user.id,
      sageId,
      conversationId: conversationId || null,
      title: quest.title,
      description: quest.description,
      goal: quest.goal,
      rewardXp: quest.rewardXp || 100,
      duration: quest.duration || 7,
      status: "new" as const,
      createdAt: new Date().toISOString(),
    }

    // TODO: Store in database when schema is ready
    console.log("[quests/agent] Created quest:", questData)

    return NextResponse.json({
      ok: true,
      data: questData,
    })
  } catch (error) {
    console.error("[quests/agent] Error:", error)
    return NextResponse.json({ ok: false, error: "Failed to create quest" }, { status: 500 })
  }
}

