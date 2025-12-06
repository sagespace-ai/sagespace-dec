import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import { z } from "zod"

const questSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  goal: z.string().min(1).max(500),
  rewardXp: z.number().int().min(10).max(1000).optional(),
  duration: z.number().int().min(1).max(30).optional(),
})

/**
 * Create quest endpoint
 * TODO: Store quests in database when schema is ready
 * For now, returns a quest ID and logs the creation
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
    const parsed = questSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const questData = parsed.data

    // TODO: Store quest in database when schema is ready
    // For now, generate an ID and return it
    const questId = `quest-${nanoid()}`

    console.log("[quests] Created quest:", {
      id: questId,
      userId: user.id,
      ...questData,
    })

    return NextResponse.json({
      ok: true,
      data: {
        id: questId,
        ...questData,
        status: "new",
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[quests] Error:", error)
    return NextResponse.json({ ok: false, error: "Failed to create quest" }, { status: 500 })
  }
}

/**
 * Get quests endpoint
 * TODO: Fetch from database when schema is ready
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Fetch quests from database
    return NextResponse.json({
      ok: true,
      data: [],
    })
  } catch (error) {
    console.error("[quests] GET error:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch quests" }, { status: 500 })
  }
}

