/**
 * Parse LLM responses to extract multimodal content suggestions
 * This helps identify when the LLM mentions artifacts, quests, or other multimodal elements
 */

import type { ContentBlock } from "@/types/chat"
import { nanoid } from "nanoid"

export interface ParsedLLMResponse {
  text: string
  suggestedBlocks: ContentBlock[]
}

/**
 * Parse LLM response text to identify multimodal content suggestions
 */
export function parseLLMResponseForMultimodal(response: string): ParsedLLMResponse {
  const suggestedBlocks: ContentBlock[] = []
  let cleanedText = response

  // Look for artifact mentions
  const artifactPatterns = [
    /(?:create|suggest|recommend|here's|here is) (?:an?|the) (?:artifact|tool|resource|card|guide|cheat sheet|reference)/gi,
    /(?:artifact|tool|resource|card|guide):\s*([^\n]+)/gi,
  ]

  artifactPatterns.forEach((pattern) => {
    const matches = response.matchAll(pattern)
    for (const match of matches) {
      const artifactName = match[1] || "Knowledge Artifact"
      suggestedBlocks.push({
        id: nanoid(),
        type: "artifact",
        name: artifactName.slice(0, 50),
        rarity: "common",
        iconEmoji: "💎",
        description: "A helpful resource mentioned in the conversation",
      })
    }
  })

  // Look for quest/challenge mentions
  const questPatterns = [
    /(?:challenge|quest|goal|mission):\s*([^\n]+)/gi,
    /(?:try|attempt|complete) (?:this|the following) (?:challenge|quest|goal)/gi,
    /(?:7|14|21|30) (?:day|week) (?:challenge|quest|goal)/gi,
  ]

  questPatterns.forEach((pattern) => {
    const matches = response.matchAll(pattern)
    for (const match of matches) {
      const questTitle = match[1] || "Learning Quest"
      suggestedBlocks.push({
        id: nanoid(),
        type: "quest",
        title: questTitle.slice(0, 60),
        description: "A goal or challenge to work towards",
        goal: "Complete the challenge",
        rewardXp: 100,
        status: "new",
      })
    }
  })

  // Look for image/visualization mentions
  const imagePatterns = [
    /(?:visualize|diagram|chart|graph|image|picture|illustration)/gi,
    /(?:here's|here is) (?:an?|the) (?:visual|diagram|chart|graph)/gi,
  ]

  const hasImageMention = imagePatterns.some((pattern) => pattern.test(response))
  if (hasImageMention && !suggestedBlocks.some((b) => b.type === "image")) {
    // Don't auto-create images, but flag for potential generation
    // The API can decide whether to generate based on hints
  }

  // Clean up any markdown artifacts or special markers
  cleanedText = cleanedText
    .replace(/\[ARTIFACT:.*?\]/gi, "")
    .replace(/\[QUEST:.*?\]/gi, "")
    .replace(/\[IMAGE:.*?\]/gi, "")
    .trim()

  return {
    text: cleanedText,
    suggestedBlocks,
  }
}

/**
 * Extract code blocks from LLM response
 */
export function extractCodeBlocks(response: string): Array<{ language?: string; code: string }> {
  const codeBlocks: Array<{ language?: string; code: string }> = []
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g

  let match
  while ((match = codeBlockRegex.exec(response)) !== null) {
    codeBlocks.push({
      language: match[1] || undefined,
      code: match[2].trim(),
    })
  }

  return codeBlocks
}

