/**
 * POST /api/chat - Chat with a Sage
 *
 * Handles chat messages with AI Sages using Gemini API.
 * Supports conversation history and Sage personality.
 */

import type { NextApiRequest, NextApiResponse } from "next"
// @ts-ignore - @google/genai may not have types
import { GoogleGenAI } from "@google/genai"
import { createSupabaseAdmin, getAuthenticatedUser } from "../../lib/supabase"
import { rateLimit } from "../../lib/rateLimit"
import { validatePrompt, sanitizeHtml } from "../../lib/validation"

interface ChatRequest {
  message: string
  sageId: string
  conversationId?: string
  history?: Array<{ role: "user" | "assistant"; content: string }>
}

interface ChatResponse {
  reply: string
  conversationId: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatResponse | { error: string }>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Apply rate limiting
  const rateLimitResult = await rateLimit(req, "chat")
  if (!rateLimitResult.success) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
    })
  }

  // Get auth token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace("Bearer ", "") || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { message, sageId, conversationId, history = [] }: ChatRequest = req.body

  if (!message || !sageId) {
    return res.status(400).json({ error: "Missing message or sageId" })
  }

  // Validate and sanitize message
  const messageValidation = validatePrompt(message)
  if (!messageValidation.valid) {
    return res.status(400).json({ error: messageValidation.error })
  }

  const sanitizedMessage = sanitizeHtml(message)

  try {
    // Get Sage details from database
    const supabase = createSupabaseAdmin()
    const { data: sage, error: sageError } = await supabase
      .from("sages")
      .select("*")
      .eq("id", sageId)
      .eq("user_id", user.id)
      .single()

    if (sageError || !sage) {
      return res.status(404).json({ error: "Sage not found" })
    }

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" })
    }

    const ai = new GoogleGenAI({ apiKey })

    // Build system prompt based on Sage personality
    const systemPrompt = `You are ${sage.name}, a ${sage.role}. ${sage.description}

Your personality traits:
- Memory scope: ${sage.memory}
- Autonomy level: ${sage.autonomy}
- Data access: ${sage.data_access}

Respond in character, be helpful, and maintain the personality described above. Keep responses concise but informative.`

    // Build conversation history for Gemini
    // Gemini uses a different format than OpenAI
    const parts: any[] = []
    let fullPrompt = `${systemPrompt}\n\n`

    // Add conversation history
    history.forEach((msg) => {
      if (msg.role === "user") {
        fullPrompt += `User: ${msg.content}\n`
      } else {
        fullPrompt += `Assistant: ${msg.content}\n`
      }
    })

    // Add current message
    fullPrompt += `User: ${message}\nAssistant:`

    parts.push({ text: fullPrompt })

    // Call Gemini API
    // Using the same pattern as remix.ts
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: parts,
    })

    const response = result.response
    const reply = response.text() || "I apologize, but I could not generate a response."

    // Get or create conversation
    let finalConversationId = conversationId
    let conversation

    if (finalConversationId) {
      // Get existing conversation
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", finalConversationId)
        .eq("user_id", user.id)
        .single()

      if (!existingConv) {
        // Invalid conversation ID, create new one
        finalConversationId = undefined
      }
    }

    if (!finalConversationId) {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          sage_id: sageId,
          title: message.substring(0, 50), // Use first message as title
        })
        .select()
        .single()

      if (convError) {
        console.error("Failed to create conversation:", convError)
        // Continue without persistence
      } else {
        conversation = newConv
        finalConversationId = newConv.id
      }
    } else {
      conversation = { id: finalConversationId }
    }

    // Save messages to database
    if (conversation) {
      // Save user message
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content: message,
      })

      // Save assistant reply
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: reply,
      })
    }

    return res.status(200).json({
      reply,
      conversationId: finalConversationId,
    })
  } catch (error: any) {
    console.error("[Chat API] Error:", error)
    return res.status(500).json({
      error: error.message || "Failed to process chat message",
    })
  }
}
