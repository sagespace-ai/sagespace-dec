import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserPersonas, createPersona } from "@/lib/personas"
import { awardXP } from "@/lib/xp"
import { z } from "zod"

const personaSchema = z.object({
  name: z.string().min(1).max(50),
  systemPrompt: z.string().min(10).max(2000),
  config: z.any().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const personas = await getUserPersonas(user.id)

    return NextResponse.json({
      ok: true,
      data: personas,
    })
  } catch (error) {
    console.error("[personas] GET error:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch personas" }, { status: 500 })
  }
}

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
    const parsed = personaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const persona = await createPersona(user.id, parsed.data)

    // Award XP for creating a persona
    await awardXP(user.id, "persona_created")

    return NextResponse.json({
      ok: true,
      data: persona,
    })
  } catch (error) {
    console.error("[personas] POST error:", error)
    return NextResponse.json({ ok: false, error: "Failed to create persona" }, { status: 500 })
  }
}
