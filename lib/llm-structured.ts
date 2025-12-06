/**
 * Structured LLM output utilities
 * Handles function calling and JSON mode for agentic content creation
 */

import OpenAI from "openai"
import type { ChatMessage } from "@/types"
import type { AgentOutput, ArtifactDraft, QuestDraft, ImageGenerationRequest } from "@/lib/types/agent"
import { generateChatCompletion } from "./llm"

/**
 * Function definitions for agentic content creation
 */
const AGENT_FUNCTIONS = [
  {
    name: "create_artifact",
    description: "Create a knowledge artifact (code, document, note, etc.) for the user",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the artifact",
        },
        type: {
          type: "string",
          enum: ["code", "document", "image", "data", "note", "link", "file"],
          description: "Type of artifact",
        },
        content: {
          type: "string",
          description: "Content of the artifact (code, text, etc.)",
        },
        description: {
          type: "string",
          description: "Description of what the artifact is",
        },
      },
      required: ["name", "type", "description"],
    },
  },
  {
    name: "create_quest",
    description: "Create a learning quest or challenge for the user",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title of the quest",
        },
        description: {
          type: "string",
          description: "Description of what the quest involves",
        },
        goal: {
          type: "string",
          description: "The specific goal or objective",
        },
        rewardXp: {
          type: "number",
          description: "XP reward for completing the quest (default: 100)",
        },
        duration: {
          type: "number",
          description: "Duration in days (default: 7)",
        },
      },
      required: ["title", "description", "goal"],
    },
  },
  {
    name: "generate_image",
    description: "Generate an image to help visualize or explain something",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Detailed image generation prompt",
        },
        style: {
          type: "string",
          description: "Style of the image (e.g., 'realistic', 'cartoon', 'diagram')",
        },
      },
      required: ["prompt"],
    },
  },
] as const

/**
 * Parse function calls from LLM completion
 */
function parseFunctionCalls(completion: OpenAI.ChatCompletion): AgentOutput {
  const message = completion.choices[0]?.message
  const text = message?.content || ""
  const functionCalls = message?.tool_calls || []

  const artifacts: ArtifactDraft[] = []
  const quests: QuestDraft[] = []
  const images: ImageGenerationRequest[] = []

  for (const call of functionCalls) {
    if (call.type === "function") {
      try {
        const args = JSON.parse(call.function.arguments)

        switch (call.function.name) {
          case "create_artifact":
            artifacts.push({
              name: args.name,
              type: args.type,
              content: args.content,
              description: args.description,
              metadata: args.metadata,
            })
            break

          case "create_quest":
            quests.push({
              title: args.title,
              description: args.description,
              goal: args.goal,
              rewardXp: args.rewardXp || 100,
              duration: args.duration || 7,
            })
            break

          case "generate_image":
            images.push({
              prompt: args.prompt,
              style: args.style,
              size: args.size || "512x512",
            })
            break
        }
      } catch (error) {
        console.error(`[llm-structured] Failed to parse function call ${call.function.name}:`, error)
      }
    }
  }

  return {
    text,
    artifacts: artifacts.length > 0 ? artifacts : undefined,
    quests: quests.length > 0 ? quests : undefined,
    images: images.length > 0 ? images : undefined,
  }
}

/**
 * Generate chat completion with structured output (function calling)
 */
export async function generateStructuredChatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
  } = {},
): Promise<AgentOutput> {
  try {
    const { getLLMClient, getLLMModel } = await import("./llm")
    const client = getLLMClient()

    const response = await client.chat.completions.create({
      model: options.model || getLLMModel(),
      messages: messages.map((m) => {
        const base: { role: string; content: string } = {
          role: m.role,
          content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
        }
        // Add name if present (for function messages)
        if ("name" in m && m.name) {
          return { ...base, name: m.name } as OpenAI.ChatCompletionMessageParam
        }
        return base as OpenAI.ChatCompletionMessageParam
      }),
      tools: AGENT_FUNCTIONS.map((func) => ({
        type: "function",
        function: func,
      })),
      tool_choice: "auto", // Let the model decide when to use functions
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
    })

    return parseFunctionCalls(response)
  } catch (error) {
    console.error("[llm-structured] Error generating structured completion:", error)
    // Fallback to regular completion
    const completion = await generateChatCompletion(messages, {
      stream: false,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    })

    if ("choices" in completion && Array.isArray(completion.choices)) {
      return {
        text: completion.choices[0]?.message?.content || "",
      }
    }

    return { text: "I encountered an error. Please try again." }
  }
}

