import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/events"
import { z } from "zod"

const eventSchema = z.object({
  type: z.enum(["chat_turn", "council_complete", "artifact_create", "credit_low", "persona_create", "level_up"]),
  ts: z.number(),
  props: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = eventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    await logEvent({
      type: parsed.data.type,
      userId: session.user.id,
      timestamp: parsed.data.ts,
      props: parsed.data.props,
    })

    return NextResponse.json({
      ok: true,
      data: { logged: true },
    })
  } catch (error) {
    console.error("[events] POST error:", error)
    return NextResponse.json({ ok: false, error: "Failed to log event" }, { status: 500 })
  }
}
