import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserCredits, getCreditHistory } from "@/lib/credits"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const balance = await getUserCredits(user.id)
    const history = await getCreditHistory(user.id, 20)

    return NextResponse.json({
      ok: true,
      data: {
        balance,
        history,
        plan: balance >= 200 ? "active" : "low",
      },
    })
  } catch (error) {
    console.error("[credits] GET error:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch credits" }, { status: 500 })
  }
}
