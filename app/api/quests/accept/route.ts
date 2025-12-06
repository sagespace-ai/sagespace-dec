import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const acceptQuestSchema = z.object({
  questId: z.string().min(1),
  conversationId: z.string().optional(),
})

/**
 * Accept quest endpoint
 * Marks a quest as accepted by the user
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
    const parsed = acceptQuestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const { questId, conversationId } = parsed.data

    // TODO: Store quest acceptance in database when schema is ready
    // For now, just log and return success
    console.log("[quests/accept] Quest accepted:", {
      questId,
      userId: user.id,
      conversationId,
      acceptedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      data: {
        questId,
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[quests/accept] Error:", error)
    return NextResponse.json({ ok: false, error: "Failed to accept quest" }, { status: 500 })
  }
}

