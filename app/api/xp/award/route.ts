import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { awardXP, type XPReason } from "@/lib/xp"
import { z } from "zod"

const awardSchema = z.object({
  reason: z.enum([
    "first_chat",
    "chat_turn",
    "council_complete",
    "artifact_created",
    "daily_streak",
    "persona_created",
  ]),
  amount: z.number().positive().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = awardSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const result = await awardXP(session.user.id, parsed.data.reason as XPReason, parsed.data.amount)

    if (!result.success) {
      return NextResponse.json({ ok: false, error: "Failed to award XP" }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: {
        xp: result.xp,
        level: result.level,
        leveledUp: result.leveledUp,
      },
    })
  } catch (error) {
    console.error("[xp] POST award error:", error)
    return NextResponse.json({ ok: false, error: "Failed to award XP" }, { status: 500 })
  }
}
