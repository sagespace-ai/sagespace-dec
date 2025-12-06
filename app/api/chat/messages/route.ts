import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import type { ChatMessage, ContentBlock, ChatStats } from "@/types/chat"
import type { SageMode } from "@/types/sage"
import { generateChatCompletion } from "@/lib/llm"
import { SAGE_TEMPLATES } from "@/lib/sage-templates"
import type { ChatMessage as LLMChatMessage } from "@/types"
import { parseLLMResponseForMultimodal } from "@/lib/llm-parser"

function generateContentBlocks(
  userMessage: string,
  hints: { preferredBlocks?: string[]; mood?: string },
  mode: SageMode,
): ContentBlock[] {
  const blocks: ContentBlock[] = []

  // Always include text response
  blocks.push({
    id: nanoid(),
    type: "text",
    text: `I understand you're asking about: "${userMessage}". Let me help you with that!`,
  })

  // Add other blocks based on hints
  if (hints.preferredBlocks?.includes("image")) {
    blocks.push({
      id: nanoid(),
      type: "image",
      url: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(userMessage)}`,
      alt: "Generated visualization",
    })
  }

  if (hints.preferredBlocks?.includes("post")) {
    blocks.push({
      id: nanoid(),
      type: "post",
      title: `Deep Dive: ${userMessage.slice(0, 50)}`,
      summary: "An in-depth exploration of your question...",
      bodyPreview: "This comprehensive guide covers all aspects...",
      permalink: `/posts/${nanoid()}`,
    })
  }

  // Randomly add artifacts (10% chance)
  if (Math.random() < 0.1) {
    const rarities = ["common", "rare", "epic", "legendary"] as const
    blocks.push({
      id: nanoid(),
      type: "artifact",
      name: "Focus Rune",
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      iconEmoji: "💎",
      description: "A mystical artifact that enhances your abilities",
    })
  }

  // Add quest for habit-related queries
  if (userMessage.toLowerCase().includes("habit") || userMessage.toLowerCase().includes("routine")) {
    blocks.push({
      id: nanoid(),
      type: "quest",
      title: "Build a Sustainable Routine",
      description: "Complete daily actions for 7 days",
      goal: "Develop lasting habits",
      rewardXp: 500,
      status: "new",
    })
  }

  return blocks
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, content, mode, generationHints, sageId } = body

    // Get session to find primarySageId if not provided
    let primarySageId = sageId
    if (!primarySageId) {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("primary_sage_id")
        .eq("id", sessionId)
        .single()
      primarySageId = session?.primary_sage_id || "health-1" // Default to Wellness Coach
    }

    // Get Sage template for system prompt
    const sageTemplate = SAGE_TEMPLATES.find((s) => s.id === primarySageId)
    const systemPrompt = sageTemplate
      ? `You are ${sageTemplate.name}, a ${sageTemplate.role}. ${sageTemplate.synopsis || sageTemplate.description}. Your capabilities include: ${sageTemplate.capabilities.join(", ")}. 

Be helpful, conversational, and true to your character. When appropriate, you can:
- Suggest artifacts (knowledge cards, tools, resources) by mentioning them naturally in conversation
- Create quests for actionable goals by using natural language about challenges or goals
- Recommend visualizations or images when they would help explain concepts

Respond naturally and conversationally, staying true to your role as ${sageTemplate.name}.`
      : "You are a helpful AI assistant. Be conversational and helpful."

    // Get previous messages for context
    const { data: previousMessages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(20)

    // Build messages array for LLM
    const llmMessages: LLMChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...(previousMessages || [])
        .filter((m) => m.author_type === "user" || m.author_type === "sage")
        .map((m) => {
          const textContent = m.blocks?.find((b: ContentBlock) => b.type === "text")?.text || ""
          return {
            role: m.author_type === "user" ? "user" : "assistant",
            content: textContent,
          } as LLMChatMessage
        }),
      { role: "user", content },
    ]

    const userMessage: ChatMessage = {
      id: nanoid(),
      sessionId,
      authorType: "user",
      authorId: user.id,
      createdAt: new Date().toISOString(),
      modeAtTime: mode,
      blocks: [
        {
          id: nanoid(),
          type: "text",
          text: content,
        },
      ],
    }

    // Store user message
    await supabase.from("chat_messages").insert({
      id: userMessage.id,
      session_id: sessionId,
      author_type: "user",
      author_id: user.id,
      created_at: userMessage.createdAt,
      mode_at_time: mode,
      blocks: userMessage.blocks,
    })

    // Call LLM to generate response
    let assistantResponse = ""
    try {
      const completion = await generateChatCompletion(llmMessages, {
        stream: false,
      })

      if ("choices" in completion && Array.isArray(completion.choices)) {
        assistantResponse = completion.choices[0]?.message?.content || ""
      } else {
        assistantResponse = "I apologize, but I'm having trouble generating a response right now."
      }
    } catch (error) {
      console.error("[chat/messages] LLM error:", error)
      assistantResponse = "I encountered an error. Please try again."
    }

    // Parse LLM response for multimodal content
    const parsed = parseLLMResponseForMultimodal(assistantResponse)

    // Create sage message with LLM response
    const sageBlocks: ContentBlock[] = [
      {
        id: nanoid(),
        type: "text",
        text: parsed.text,
      },
    ]

    // Add suggested blocks from LLM response (limit to avoid overwhelming)
    const suggestedBlocks = parsed.suggestedBlocks.slice(0, 2) // Max 2 additional blocks
    sageBlocks.push(...suggestedBlocks)

    // Optionally add other blocks based on hints (keep existing logic for artifacts, etc.)
    if (generationHints?.preferredBlocks?.includes("image")) {
      sageBlocks.push({
        id: nanoid(),
        type: "image",
        url: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(content)}`,
        alt: "Generated visualization",
      })
    }

    // Add quest for habit-related queries (if not already suggested by LLM)
    if (
      (content.toLowerCase().includes("habit") || content.toLowerCase().includes("routine")) &&
      !sageBlocks.some((b) => b.type === "quest")
    ) {
      sageBlocks.push({
        id: nanoid(),
        type: "quest",
        title: "Build a Sustainable Routine",
        description: "Complete daily actions for 7 days",
        goal: "Develop lasting habits",
        rewardXp: 500,
        status: "new",
      })
    }

    const sageMessage: ChatMessage = {
      id: nanoid(),
      sessionId,
      authorType: "sage",
      authorId: primarySageId,
      createdAt: new Date().toISOString(),
      modeAtTime: mode,
      blocks: sageBlocks,
    }

    // Store sage message
    await supabase.from("chat_messages").insert({
      id: sageMessage.id,
      session_id: sessionId,
      author_type: "sage",
      author_id: primarySageId,
      created_at: sageMessage.createdAt,
      mode_at_time: mode,
      blocks: sageMessage.blocks,
    })

    const artifactsCollected = sageBlocks.filter((b) => b.type === "artifact").length
    const stats: ChatStats = {
      sessionId,
      messagesSent: 1,
      xpEarned: 10 + artifactsCollected * 50,
      artifactsCollected,
    }

    return NextResponse.json({
      userMessage,
      sageMessages: [sageMessage],
      stats,
    })
  } catch (error) {
    console.error("[chat/messages] Error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[chat/messages] Fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    // Calculate stats
    const userMessages = messages?.filter((m) => m.author_type === "user") || []
    const allBlocks = messages?.flatMap((m) => m.blocks || []) || []
    const artifacts = allBlocks.filter((b): b is ContentBlock => b && typeof b === 'object' && 'type' in b && b.type === "artifact")

    const stats: ChatStats = {
      sessionId,
      messagesSent: userMessages.length,
      xpEarned: userMessages.length * 10 + artifacts.length * 50,
      artifactsCollected: artifacts.length,
    }

    return NextResponse.json({
      sessionId,
      messages: messages || [],
      stats,
    })
  } catch (error) {
    console.error("[chat/messages] GET error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
