/**
 * Server-side functions for agentic quest creation
 * These can be called directly from API routes without HTTP overhead
 */

import { nanoid } from "nanoid"
import type { QuestDraft } from "@/lib/types/agent"

export interface CreateAgentQuestParams {
  userId: string
  conversationId?: string
  sageId: string
  quest: QuestDraft
}

export interface CreateAgentQuestResult {
  ok: boolean
  data?: {
    id: string
    userId: string
    sageId: string
    conversationId: string | null
    title: string
    description: string
    goal: string
    rewardXp: number
    duration: number
    status: "new"
    createdAt: string
  }
  error?: string
}

/**
 * Create a quest on behalf of an agent
 * This is the server-side function that the API route uses
 */
export async function createAgentQuest(params: CreateAgentQuestParams): Promise<CreateAgentQuestResult> {
  try {
    const { userId, conversationId, sageId, quest } = params

    // Create quest
    const questId = `quest-${nanoid()}`
    const questData = {
      id: questId,
      userId,
      sageId,
      conversationId: conversationId || null,
      title: quest.title,
      description: quest.description,
      goal: quest.goal,
      rewardXp: quest.rewardXp || 100,
      duration: quest.duration || 7,
      status: "new" as const,
      createdAt: new Date().toISOString(),
    }

    // TODO: Store in database when schema is ready
    console.log("[quests-agent] Created quest:", questData)

    return {
      ok: true,
      data: questData,
    }
  } catch (error) {
    console.error("[quests-agent] Error:", error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create quest",
    }
  }
}

