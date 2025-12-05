import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import type { ChatMessage, ContentBlock, ChatStats } from "@/types/chat"
import type { SageMode } from "@/types/sage"

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
    const { sessionId, content, mode, generationHints } = body

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

    const sageBlocks = generateContentBlocks(content, generationHints || {}, mode)

    const sageMessage: ChatMessage = {
      id: nanoid(),
      sessionId,
      authorType: "sage",
      authorId: "sage-1",
      createdAt: new Date().toISOString(),
      modeAtTime: mode,
      blocks: sageBlocks,
    }

    // Store sage message
    await supabase.from("chat_messages").insert({
      id: sageMessage.id,
      session_id: sessionId,
      author_type: "sage",
      author_id: "sage-1",
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
