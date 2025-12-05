import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import type { ChatSession, ChatParticipant, SageMode } from "@/types/sage"

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
