import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateChatCompletion } from "@/lib/llm"
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
      conversation = await getConversation(conversationId, userId)
      if (!conversation) {
        return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 })
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

Be helpful, conversational, and true to your character. When appropriate, you can:
- Suggest artifacts (knowledge cards, tools, resources) by mentioning them naturally
- Create quests for actionable goals using natural language about challenges
- Recommend visualizations when they would help explain concepts

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

    // Generate AI response
    const completion = await generateChatCompletion(messages, {
      stream: false,
    })

    // Type guard: since stream is false, this should be ChatCompletion, not Stream
    if ('choices' in completion && Array.isArray(completion.choices)) {
      const chatCompletion = completion as OpenAI.ChatCompletion
      const assistantMessage = chatCompletion.choices[0]?.message?.content || ""
      const tokensIn = chatCompletion.usage?.prompt_tokens || 0
      const tokensOut = chatCompletion.usage?.completion_tokens || 0
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
        props: { personaId, tokens: totalTokens },
      })

      return NextResponse.json({
        ok: true,
        data: {
          conversationId: conversation.id,
          messageId: messageRecord.id,
          assistantMessage,
          tokens: { input: tokensIn, output: tokensOut },
          creditsCharged: creditsRequired,
          artifacts: [],
        },
      })
    } else {
      return NextResponse.json({ ok: false, error: "Unexpected response format" }, { status: 500 })
    }
  } catch (error) {
    console.error("[chat] POST error:", error)
    return NextResponse.json({ ok: false, error: "Failed to process chat" }, { status: 500 })
  }
}
