import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateChatCompletion } from "@/lib/llm"
import { generateStructuredChatCompletion } from "@/lib/llm-structured"
import { debitCredits, tokensToCredits } from "@/lib/credits"
import { awardXP } from "@/lib/xp"
import { createConversation, getConversation, addMessage } from "@/lib/conversations"
import { getPersona } from "@/lib/personas"
import { logEvent } from "@/lib/events"
import { checkRateLimit, getRateLimitKey } from "@/lib/rate"
import { z } from "zod"
import { DEMO_MODE } from "@/lib/demo"
import type { ChatMessage } from "@/types"
import type OpenAI from "openai"
import type { AgentOutput } from "@/lib/types/agent"

const chatSchema = z.object({
  conversationId: z.string().optional(),
  personaId: z.string().optional(),
  userMessage: z.string().min(1).max(4000),
  stream: z.boolean().optional(),
  ctx: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const userId = user?.id || (DEMO_MODE.enabled ? DEMO_MODE.userId : null)

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = await getRateLimitKey("chat", userId)
    const rateLimit = await checkRateLimit(rateLimitKey, 15, 60)

    if (!rateLimit.allowed) {
      return NextResponse.json({ ok: false, error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const parsed = chatSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const { conversationId, personaId, userMessage, stream } = parsed.data

    // Get or create conversation
    let conversation
    if (conversationId) {
      try {
      conversation = await getConversation(conversationId, userId)
      if (!conversation) {
          // Conversation doesn't exist, create a new one instead of failing
          console.warn(`[chat] Conversation ${conversationId} not found for user ${userId}, creating new one`)
          conversation = await createConversation(userId, personaId)
        }
      } catch (error) {
        // If there's an error fetching, create a new conversation
        console.error(`[chat] Error fetching conversation ${conversationId}:`, error)
        conversation = await createConversation(userId, personaId)
      }
    } else {
      conversation = await createConversation(userId, personaId)
    }

    // Get persona (built-in or custom)
    let systemPrompt = "You are a helpful AI assistant. Be conversational and helpful."
    if (personaId) {
      const persona = await getPersona(personaId, userId)
      if (persona) {
        systemPrompt = persona.systemPrompt
        
        // Enhance system prompt for built-in Sages with synopsis
        if (persona.isBuiltIn) {
          const sageTemplate = (await import("@/lib/sage-templates")).SAGE_TEMPLATES.find((s) => s.id === personaId)
          if (sageTemplate?.synopsis) {
            systemPrompt = `You are ${sageTemplate.name}, a ${sageTemplate.role}. ${sageTemplate.synopsis}. Your capabilities include: ${sageTemplate.capabilities.join(", ")}. 

Be helpful, conversational, and true to your character. 

IMPORTANT: You have the ability to CREATE content for users, not just suggest it:
- Use the create_artifact() function when you want to create a knowledge artifact (code, document, note, etc.) for the user
- Use the create_quest() function when you want to create a learning quest or challenge for the user
- Use the generate_image() function when a visual would help explain something

When appropriate, actively CREATE artifacts and quests rather than just mentioning them. For example:
- If asked for a workout plan, CREATE an artifact with the plan
- If asked for a challenge, CREATE a quest with specific goals
- If explaining something complex, CREATE a visual diagram

Respond naturally and conversationally, staying true to your role as ${sageTemplate.name}.`
          }
        }
      }
    }

    // Build messages array
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversation.messages.map((m: { role: string; content: string; name?: string }) => ({
        role: m.role,
        content: m.content,
        ...(m.name && { name: m.name }),
      })),
      { role: "user", content: userMessage },
    ]

    // Save user message
    await addMessage(conversation.id, "user", userMessage)

    // Generate AI response with structured output (function calling)
    const agentOutput: AgentOutput = await generateStructuredChatCompletion(messages, {})

    const assistantMessage = agentOutput.text
    const createdArtifacts: Array<{ id: string; name: string }> = []
    const createdQuests: Array<{ id: string; title: string }> = []

    // Process agent-created artifacts (call directly instead of fetch)
    if (agentOutput.artifacts && agentOutput.artifacts.length > 0) {
      const { createAgentArtifact } = await import("@/lib/artifacts-agent")
      for (const artifact of agentOutput.artifacts) {
        try {
          const result = await createAgentArtifact({
            userId,
            conversationId: conversation.id,
            sageId: personaId || "unknown",
            artifact,
          })

          if (result.ok && result.data?.id) {
            createdArtifacts.push({
              id: result.data.id,
              name: artifact.name,
            })
          }
        } catch (error) {
          console.error("[chat] Failed to create artifact:", error)
        }
      }
    }

    // Process agent-created quests (call directly instead of fetch)
    if (agentOutput.quests && agentOutput.quests.length > 0) {
      const { createAgentQuest } = await import("@/lib/quests-agent")
      for (const quest of agentOutput.quests) {
        try {
          const result = await createAgentQuest({
            userId,
            conversationId: conversation.id,
            sageId: personaId || "unknown",
            quest,
          })

          if (result.ok && result.data?.id) {
            createdQuests.push({
              id: result.data.id,
              title: quest.title,
            })
          }
        } catch (error) {
          console.error("[chat] Failed to create quest:", error)
        }
      }
    }

    // Estimate tokens (function calling may have different token usage)
    // For now, use a simple estimate based on message length
    const estimatedTokens = assistantMessage.length / 4
    const tokensIn = Math.floor(estimatedTokens * 0.6)
    const tokensOut = Math.floor(estimatedTokens * 0.4)
    const totalTokens = tokensIn + tokensOut

    // Save assistant message
    const messageRecord = await addMessage(conversation.id, "assistant", assistantMessage, {
      tokensIn,
      tokensOut,
    })

    // Calculate and debit credits
    const creditsRequired = tokensToCredits(totalTokens)
    const debitResult = await debitCredits(userId, creditsRequired, "chat", {
      conversationId: conversation.id,
      tokens: totalTokens,
    })

    if (!debitResult.success) {
      // Delete the messages if we couldn't charge
      return NextResponse.json({ ok: false, error: debitResult.error }, { status: 402 })
    }

    // Award XP
    await awardXP(userId, "chat_turn")

    // Log event
    await logEvent({
      type: "chat_turn",
      userId: userId,
      timestamp: Date.now(),
      props: { personaId, tokens: totalTokens, artifactsCreated: createdArtifacts.length, questsCreated: createdQuests.length },
    })

    return NextResponse.json({
      ok: true,
      data: {
        conversationId: conversation.id,
        messageId: messageRecord.id,
        assistantMessage,
        tokens: { input: tokensIn, output: tokensOut },
        creditsCharged: creditsRequired,
        artifacts: createdArtifacts,
        quests: createdQuests,
        agentOutput: {
          hasArtifacts: (agentOutput.artifacts?.length || 0) > 0,
          hasQuests: (agentOutput.quests?.length || 0) > 0,
          hasImages: (agentOutput.images?.length || 0) > 0,
        },
      },
    })
  } catch (error) {
    console.error("[chat] POST error:", error)
    return NextResponse.json({ ok: false, error: "Failed to process chat" }, { status: 500 })
  }
}
