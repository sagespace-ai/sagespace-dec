import { NextResponse } from "next/server"
import { generateReferralCode, trackReferralClick } from "@/lib/monetization"
import { supabase } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, action, code } = await request.json()

    if (action === "generate") {
      const referralCode = await generateReferralCode(userId)
      return NextResponse.json({ success: true, code: referralCode })
    }

    if (action === "track_click" && code) {
      await trackReferralClick(code)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[referrals] Error:", error)
    return NextResponse.json({ error: "Failed to process referral" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId)

    if (error) throw error

    return NextResponse.json({ referrals: referrals || [] })
  } catch (error) {
    console.error("[referrals] Error fetching referrals:", error)
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
  }
}
