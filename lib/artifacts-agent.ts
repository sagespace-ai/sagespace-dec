/**
 * Server-side functions for agentic artifact creation
 * These can be called directly from API routes without HTTP overhead
 */

import { nanoid } from "nanoid"
import type { ArtifactDraft } from "@/lib/types/agent"

export interface CreateAgentArtifactParams {
  userId: string
  conversationId?: string
  sageId: string
  artifact: ArtifactDraft
}

export interface CreateAgentArtifactResult {
  ok: boolean
  data?: {
    id: string
    userId: string
    sageId: string
    conversationId: string | null
    name: string
    type: string
    content: string | null
    description: string
    metadata: Record<string, unknown>
    createdAt: string
  }
  error?: string
}

/**
 * Create an artifact on behalf of an agent
 * This is the server-side function that the API route uses
 */
export async function createAgentArtifact(
  params: CreateAgentArtifactParams,
): Promise<CreateAgentArtifactResult> {
  try {
    const { userId, conversationId, sageId, artifact } = params

    // Create artifact
    const artifactId = `artifact-${nanoid()}`
    const artifactData = {
      id: artifactId,
      userId,
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
    console.log("[artifacts-agent] Created artifact:", artifactData)

    return {
      ok: true,
      data: artifactData,
    }
  } catch (error) {
    console.error("[artifacts-agent] Error:", error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create artifact",
    }
  }
}

