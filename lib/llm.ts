import OpenAI from "openai"
import type { ChatMessage } from "@/types"
import { DEMO_MODE, generateMockResponse } from "@/lib/demo"

const provider = process.env.LLM_PROVIDER || "openai"
const model = process.env.LLM_MODEL || "gpt-4o-mini"

export function getLLMClient() {
  if (provider === "openai") {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  } else if (provider === "openrouter") {
    return new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })
  }
  throw new Error(`Unsupported LLM provider: ${provider}`)
}

export function getLLMModel() {
  return model
}

function extractTextContent(content: string | Array<{ type?: string; text?: string }> | null | undefined): string {
  if (!content) return ""
  if (typeof content === "string") {
    return content
  }
  if (Array.isArray(content)) {
    // Extract text from any content parts that have a text property
    return content
      .filter(
        (part): part is { type: string; text: string } =>
          typeof part === "object" && part !== null && "text" in part && typeof part.text === "string",
      )
      .map((part) => part.text)
      .join(" ")
  }
  return ""
}

export async function generateChatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
  } = {},
) {
  if (DEMO_MODE.enabled) {
    console.log("[LLM] Running in demo mode - generating mock response")

    const userMessage = extractTextContent(messages.find((m) => m.role === "user")?.content || "")
    const systemMessage = extractTextContent(messages.find((m) => m.role === "system")?.content || "")
    const personaName = systemMessage.includes("Dr. Wellness")
      ? "Dr. Wellness"
      : systemMessage.includes("Prof. Einstein")
        ? "Prof. Einstein"
        : undefined

    const mockContent = generateMockResponse(userMessage, personaName)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      choices: [
        {
          message: {
            role: "assistant" as const,
            content: mockContent,
          },
          finish_reason: "stop" as const,
          index: 0,
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: mockContent.split(" ").length,
        total_tokens: 50 + mockContent.split(" ").length,
      },
    }
  }

  try {
    const client = getLLMClient()
    const response = await client.chat.completions.create({
      model: options.model || getLLMModel(),
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      stream: options.stream || false,
    })
    return response
  } catch (error) {
    console.error("[LLM] Error generating completion:", error)

    const userMessage = extractTextContent(messages.find((m) => m.role === "user")?.content || "")
    const mockContent = `[Error Recovery] I encountered an issue connecting to the AI service. Please check your API configuration or run in demo mode.`

    return {
      choices: [
        {
          message: {
            role: "assistant" as const,
            content: mockContent,
          },
          finish_reason: "stop" as const,
          index: 0,
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: mockContent.split(" ").length,
        total_tokens: 50 + mockContent.split(" ").length,
      },
    }
  }
}
