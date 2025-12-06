import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import type { ChatSession, ChatParticipant, SageMode } from "@/types/sage"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const { data: session, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({
      session: {
        id: session.id,
        mode: session.mode,
        primarySageId: session.primary_sage_id,
        sageIds: session.sage_ids || [],
        createdAt: session.created_at,
      },
    })
  } catch (error) {
    console.error("[chat/sessions] GET error:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { mode, primarySageId, sageIds } = body as {
      mode: SageMode
      primarySageId: string
      sageIds: string[]
    }

    const session: ChatSession = {
      id: nanoid(),
      mode,
      primarySageId,
      sageIds,
      createdAt: new Date().toISOString(),
    }

    // Store session in Supabase
    const { error } = await supabase.from("chat_sessions").insert({
      id: session.id,
      user_id: user.id,
      mode: session.mode,
      primary_sage_id: session.primarySageId,
      sage_ids: session.sageIds,
      created_at: session.createdAt,
    })

    if (error) {
      console.error("[chat/sessions] Database error:", error)
    }

    // Get participant details (mock for now, real implementation would fetch from database)
    const participants: ChatParticipant[] = sageIds.map((id) => ({
      id,
      name: `Sage ${id}`,
      role: "sage" as const,
      emoji: "🤖",
    }))

    return NextResponse.json({
      session,
      participants,
    })
  } catch (error) {
    console.error("[chat/sessions] Error:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
