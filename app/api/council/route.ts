import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateChatCompletion } from "@/lib/llm"
import { debitCredits, tokensToCredits } from "@/lib/credits"
import { awardXP, awardBadge } from "@/lib/xp"
import { createConversation, addMessage } from "@/lib/conversations"
import { getPersonasBatch } from "@/lib/personas"
import { logEvent } from "@/lib/events"
import { checkRateLimit, getRateLimitKey } from "@/lib/rate"
import { z } from "zod"
import { getConversation } from "@/lib/conversations" // Declare the getConversation variable
import type { ChatMessage } from "@/types"
import type OpenAI from "openai"

const councilSchema = z.object({
  conversationId: z.string().optional(),
  question: z.string().min(1).max(4000),
  personas: z.array(z.string()).min(2).max(8),
  deliberation: z
    .object({
      rounds: z.number().min(1).max(3).optional(),
      maxTokensPerSage: z.number().optional(),
    })
    .optional(),
  stream: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const rateLimitKey = await getRateLimitKey("council", session.user.id)
    const rateLimit = await checkRateLimit(rateLimitKey, 3, 60)

    if (!rateLimit.allowed) {
      return NextResponse.json({ ok: false, error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const parsed = councilSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const { conversationId, question, personas, deliberation } = parsed.data
    const rounds = deliberation?.rounds || 1
    const maxTokensPerSage = deliberation?.maxTokensPerSage || 300

    // Get or create conversation
    const conversation = conversationId
      ? await getConversation(conversationId, session.user.id)
      : await createConversation(session.user.id, undefined, `Council: ${question.slice(0, 50)}`)

    if (!conversation && conversationId) {
      return NextResponse.json({ ok: false, error: "Conversation not found" }, { status: 404 })
    }

    const conv = conversation || (await createConversation(session.user.id))

    // Save user question
    await addMessage(conv.id, "user", question)

    const personaDetails = await getPersonasBatch(personas, session.user.id)

    // Filter out null values (personas not found)
    const validPersonas = personaDetails.filter((p): p is NonNullable<typeof p> => p !== null)

    if (validPersonas.length < personas.length) {
      return NextResponse.json({ ok: false, error: "Some personas not found" }, { status: 404 })
    }

    const transcript: Array<{ role: string; name: string; content: string }> = []
    let totalTokensIn = 0
    let totalTokensOut = 0

    for (let round = 0; round < rounds; round++) {
      // Process all personas in parallel instead of sequentially
      const responses = await Promise.all(
        validPersonas.map(async (persona) => {
          const context =
            transcript.length > 0
              ? `\n\nPrevious sage responses:\n${transcript.map((t) => `${t.name}: ${t.content}`).join("\n\n")}`
              : ""

          const messages: ChatMessage[] = [
            {
              role: "system",
              content: persona.systemPrompt,
            },
            {
              role: "user",
              content: `${question}${context}\n\nProvide your perspective on this question.`,
            },
          ]

          const completion = await generateChatCompletion(messages, {
            maxTokens: maxTokensPerSage,
            stream: false,
          })

          // Type guard: since stream is false, this should be ChatCompletion
          if ('choices' in completion && Array.isArray(completion.choices)) {
            const chatCompletion = completion as OpenAI.ChatCompletion
            const response = chatCompletion.choices[0]?.message?.content || ""
            const tokensIn = chatCompletion.usage?.prompt_tokens || 0
            const tokensOut = chatCompletion.usage?.completion_tokens || 0

            return {
              role: "sage" as const,
              name: persona.name,
              content: response,
              tokensIn,
              tokensOut,
            }
          } else {
            // Fallback for unexpected format
            return {
              role: "sage" as const,
              name: persona.name,
              content: "",
              tokensIn: 0,
              tokensOut: 0,
            }
          }

        }),
      )

      // Aggregate results
      responses.forEach(({ tokensIn, tokensOut, ...response }) => {
        totalTokensIn += tokensIn
        totalTokensOut += tokensOut
        transcript.push(response)
      })
    }

    // Final synthesis
    const synthesisMessages: ChatMessage[] = [
      {
        role: "system",
        content: "You are a master synthesizer who combines multiple perspectives into a coherent answer.",
      },
      {
        role: "user",
        content: `Question: ${question}\n\nSage responses:\n${transcript.map((t) => `${t.name}: ${t.content}`).join("\n\n")}\n\nSynthesize these perspectives into a comprehensive answer.`,
      },
    ]

    const synthesis = await generateChatCompletion(synthesisMessages, {
      maxTokens: 500,
      stream: false,
    })

    // Type guard: since stream is false, this should be ChatCompletion
    if ('choices' in synthesis && Array.isArray(synthesis.choices)) {
      const chatCompletion = synthesis as OpenAI.ChatCompletion
      const finalAnswer = chatCompletion.choices[0]?.message?.content || ""
      totalTokensIn += chatCompletion.usage?.prompt_tokens || 0
      totalTokensOut += chatCompletion.usage?.completion_tokens || 0

      // Save council response
      await addMessage(conv.id, "assistant", finalAnswer, {
        name: "Council Synthesis",
        tokensIn: totalTokensIn,
        tokensOut: totalTokensOut,
      })

      // Calculate and debit credits
      const totalTokens = totalTokensIn + totalTokensOut
      const creditsRequired = tokensToCredits(totalTokens)
      const debitResult = await debitCredits(session.user.id, creditsRequired, "council", {
        conversationId: conv.id,
        tokens: totalTokens,
        personas: personas.length,
      })

      if (!debitResult.success) {
        return NextResponse.json({ ok: false, error: debitResult.error }, { status: 402 })
      }

      // Award XP and badge
      await awardXP(session.user.id, "council_complete")
      await awardBadge(session.user.id, "council_complete")

      // Log event
      await logEvent({
        type: "council_complete",
        userId: session.user.id,
        timestamp: Date.now(),
        props: { personas: personas.length, rounds, tokens: totalTokens },
      })

      return NextResponse.json({
        ok: true,
        data: {
          conversationId: conv.id,
          transcript,
          final: finalAnswer,
          tokens: { input: totalTokensIn, output: totalTokensOut },
          creditsCharged: creditsRequired,
        },
      })
    } else {
      return NextResponse.json({ ok: false, error: "Unexpected response format" }, { status: 500 })
    }

  } catch (error) {
    console.error("[council] POST error:", error)
    return NextResponse.json({ ok: false, error: "Failed to process council" }, { status: 500 })
  }
}
