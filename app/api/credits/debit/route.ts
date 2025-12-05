import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { debitCredits } from "@/lib/credits"
import { z } from "zod"

const debitSchema = z.object({
  units: z.number().positive(),
  reason: z.string(),
  meta: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = debitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const result = await debitCredits(session.user.id, parsed.data.units, parsed.data.reason, parsed.data.meta)

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.error === "Insufficient credits" ? 402 : 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      data: {
        balance: result.balance,
      },
    })
  } catch (error) {
    console.error("[credits] POST debit error:", error)
    return NextResponse.json({ ok: false, error: "Failed to debit credits" }, { status: 500 })
  }
}
