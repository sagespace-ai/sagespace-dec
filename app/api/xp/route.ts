import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserXPData, getUserBadges } from "@/lib/xp"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const xpData = await getUserXPData(user.id)
    const badges = await getUserBadges(user.id)

    if (!xpData) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: {
        xp: xpData.xp,
        level: xpData.level,
        nextLevelAt: xpData.nextLevelAt,
        badges: badges.map((b) => b.slug),
      },
    })
  } catch (error) {
    console.error("[xp] GET error:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch XP data" }, { status: 500 })
  }
}
