import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserConversations } from "@/lib/conversations"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const conversations = await getUserConversations(user.id)

    return NextResponse.json({
      ok: true,
      data: conversations,
    })
  } catch (error) {
    console.error("[conversations] GET error:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch conversations" }, { status: 500 })
  }
}
