import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import { z } from "zod"
import type { ArtifactDraft } from "@/lib/types/agent"

const agentArtifactSchema = z.object({
  conversationId: z.string().optional(),
  sageId: z.string(),
  artifact: z.object({
    name: z.string(),
    type: z.enum(["code", "document", "image", "data", "note", "link", "file"]),
    content: z.string().optional(),
    description: z.string(),
    metadata: z.record(z.unknown()).optional(),
  }),
})

/**
 * Agent-initiated artifact creation endpoint
 * Allows agents to create artifacts programmatically for users
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
    const parsed = agentArtifactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const { conversationId, sageId, artifact } = parsed.data

    // Create artifact
    const artifactId = `artifact-${nanoid()}`
    const artifactData = {
      id: artifactId,
      userId: user.id,
      sageId,
      conversationId: conversationId || null,
      name: artifact.name,
      type: artifact.type,
      content: artifact.content || null,
      description: artifact.description,
      metadata: artifact.metadata || {},
      createdAt: new Date().toISOString(),
    }

    // TODO: Store in database when schema is ready
    console.log("[artifacts/agent] Created artifact:", artifactData)

    return NextResponse.json({
      ok: true,
      data: artifactData,
    })
  } catch (error) {
    console.error("[artifacts/agent] Error:", error)
    return NextResponse.json({ ok: false, error: "Failed to create artifact" }, { status: 500 })
  }
}

