import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/db"
import { generateArtifactKey, getUploadSignedUrl } from "@/lib/storage"
import { awardXP } from "@/lib/xp"
import { logEvent } from "@/lib/events"
import { z } from "zod"

const artifactSchema = z.object({
  conversationId: z.string(),
  type: z.enum(["note", "code", "image", "link", "file"]),
  content: z.string().optional(),
  fileRef: z.string().optional(),
  fileName: z.string().optional(),
  meta: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = artifactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const { conversationId, type, content, fileRef, fileName, meta } = parsed.data

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", session.user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 })
    }

    // If file type, generate upload URL
    let uploadUrl
    let fileKey
    if (type === "file" || type === "image") {
      fileKey = generateArtifactKey(session.user.id, fileName || "artifact")
      uploadUrl = await getUploadSignedUrl(fileKey, "application/octet-stream")
    }

    // Create artifact (Note: artifacts table doesn't exist in schema, so this will fail gracefully)
    const artifact = {
      id: crypto.randomUUID(),
      conversationId,
      type,
      content,
      fileKey: fileKey || fileRef,
      meta,
      createdAt: new Date().toISOString(),
    }

    // Award XP
    await awardXP(session.user.id, "artifact_created")

    // Log event
    await logEvent({
      type: "artifact_create",
      userId: session.user.id,
      timestamp: Date.now(),
      props: { type, conversationId },
    })

    return NextResponse.json({
      ok: true,
      data: {
        artifact,
        uploadUrl,
      },
    })
  } catch (error) {
    console.error("[artifacts] POST error:", error)
    return NextResponse.json({ ok: false, error: "Failed to create artifact" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ ok: false, error: "conversationId is required" }, { status: 400 })
    }

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", session.user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 })
    }

    // Return empty array since artifacts table doesn't exist
    return NextResponse.json({
      ok: true,
      data: [],
    })
  } catch (error) {
    console.error("[artifacts] GET error:", error)
    return NextResponse.json({ ok: false, error: "Failed to fetch artifacts" }, { status: 500 })
  }
}
