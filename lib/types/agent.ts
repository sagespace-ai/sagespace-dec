/**
 * Types for agentic content creation
 * Defines structured output format for agents to create artifacts, quests, and images
 */

import type { ContentBlock } from "@/types/chat"

/**
 * Draft artifact that an agent wants to create
 */
export interface ArtifactDraft {
  name: string
  type: "code" | "document" | "image" | "data" | "note" | "link" | "file"
  content?: string
  description: string
  metadata?: Record<string, unknown>
}

/**
 * Draft quest that an agent wants to create
 */
export interface QuestDraft {
  title: string
  description: string
  goal: string
  rewardXp?: number
  duration?: number // in days
}

/**
 * Image generation request from agent
 */
export interface ImageGenerationRequest {
  prompt: string
  style?: string
  size?: "256x256" | "512x512" | "1024x1024"
}

/**
 * Structured output from an agent
 * This is what agents produce when they want to create content
 */
export interface AgentOutput {
  text: string // The conversational text response
  contentBlocks?: ContentBlock[] // Additional content blocks to render
  artifacts?: ArtifactDraft[] // Artifacts the agent wants to create
  quests?: QuestDraft[] // Quests the agent wants to create
  images?: ImageGenerationRequest[] // Images the agent wants to generate
}

/**
 * Result of processing agent output
 */
export interface AgentOutputResult {
  text: string
  createdArtifacts: Array<{ id: string; name: string }>
  createdQuests: Array<{ id: string; title: string }>
  generatedImages: Array<{ id: string; url: string }>
}

