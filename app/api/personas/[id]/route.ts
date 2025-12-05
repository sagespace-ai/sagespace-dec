import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updatePersona, deletePersona } from "@/lib/personas"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  systemPrompt: z.string().min(10).max(2000).optional(),
  config: z.any().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    await updatePersona(params.id, session.user.id, parsed.data)

    return NextResponse.json({
      ok: true,
      data: { updated: true },
    })
  } catch (error) {
    console.error("[personas] PATCH error:", error)
    return NextResponse.json({ ok: false, error: "Failed to update persona" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    await deletePersona(params.id, session.user.id)

    return NextResponse.json({
      ok: true,
      data: { deleted: true },
    })
  } catch (error) {
    console.error("[personas] DELETE error:", error)
    return NextResponse.json({ ok: false, error: "Failed to delete persona" }, { status: 500 })
  }
}
