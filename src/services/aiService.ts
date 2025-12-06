interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatOptions {
  model?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

class AIService {
  private apiKey: string | null = null
  private baseUrl = "https://api.x.ai/v1"

  constructor() {
    this.apiKey = import.meta.env.VITE_XAI_API_KEY || null

    if (!this.apiKey) {
      console.warn("[AIService] XAI_API_KEY not configured. AI chat will not work.")
    } else {
      console.log("[AIService] Initialized with Grok (xAI)")
    }
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error("AI service not configured. Please set VITE_XAI_API_KEY environment variable.")
    }

    const { model = "grok-beta", systemPrompt, temperature = 0.7, maxTokens = 1000 } = options

    try {
      // Build messages array with system prompt if provided
      const apiMessages = [...messages]
      if (systemPrompt && apiMessages[0]?.role !== "system") {
        apiMessages.unshift({
          role: "system",
          content: systemPrompt,
        })
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error?.message || `API request failed with status ${response.status}`)
      }

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content

      if (!reply) {
        throw new Error("No response from AI")
      }

      return reply
    } catch (error: any) {
      console.error("[AIService] Chat error:", error)
      throw error
    }
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options: ChatOptions = {},
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error("AI service not configured. Please set VITE_XAI_API_KEY environment variable.")
    }

    const { model = "grok-beta", systemPrompt, temperature = 0.7, maxTokens = 1000 } = options

    try {
      // Build messages array with system prompt if provided
      const apiMessages = [...messages]
      if (systemPrompt && apiMessages[0]?.role !== "system") {
        apiMessages.unshift({
          role: "system",
          content: systemPrompt,
        })
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error?.message || `API request failed with status ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim() !== "")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error("[AIService] Chat stream error:", error)
      throw error
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }
}

export const aiService = new AIService()
export default aiService
