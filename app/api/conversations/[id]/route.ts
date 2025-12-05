import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getConversation, deleteConversation } from "@/lib/conversations"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const conversation = await getConversation(params.id, session.user.id)

    if (!conversation) {
      return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      data: conversation,
    })
  } catch (error) {
    console.error("[conversations] GET by ID error:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch conversation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    await deleteConversation(params.id, session.user.id)

    return NextResponse.json({
      ok: true,
      data: { deleted: true },
    })
  } catch (error) {
    console.error("[conversations] DELETE error:", error)
    return NextResponse.json({ ok: false, error: "Failed to delete conversation" }, { status: 500 })
  }
}
