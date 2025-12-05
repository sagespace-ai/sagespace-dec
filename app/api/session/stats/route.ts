import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// In-memory store for quick access (in production, use Redis or database)
const sessionStatsStore = new Map<
  string,
  {
    messagesSent: number
    xpEarned: number
    updatedAt: Date
  }
>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const stats = sessionStatsStore.get(sessionId) || {
      messagesSent: 0,
      xpEarned: 0,
      updatedAt: new Date(),
    }

    return NextResponse.json({
      sessionId,
      ...stats,
    })
  } catch (error) {
    console.error("[session/stats] GET error:", error)
    return NextResponse.json({ error: "Failed to get session stats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, messagesSentDelta = 0, xpDelta = 0 } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    if (messagesSentDelta < 0 || xpDelta < 0) {
      return NextResponse.json({ error: "Deltas must be non-negative" }, { status: 400 })
    }

    const current = sessionStatsStore.get(sessionId) || {
      messagesSent: 0,
      xpEarned: 0,
      updatedAt: new Date(),
    }

    const updated = {
      messagesSent: current.messagesSent + messagesSentDelta,
      xpEarned: current.xpEarned + xpDelta,
      updatedAt: new Date(),
    }

    sessionStatsStore.set(sessionId, updated)

    // Also update user XP in database if authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.id && xpDelta > 0) {
      // Update user XP
      const { data: profile } = await supabase.from("profiles").select("xp").eq("id", user.id).single()

      if (profile) {
        await supabase
          .from("profiles")
          .update({ xp: (profile.xp || 0) + xpDelta })
          .eq("id", user.id)
      }
    }

    return NextResponse.json({
      sessionId,
      ...updated,
    })
  } catch (error) {
    console.error("[session/stats] POST error:", error)
    return NextResponse.json({ error: "Failed to update session stats" }, { status: 500 })
  }
}
