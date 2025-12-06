/**
 * POST /api/create - Create a new feed item with AI generation
 *
 * Generates content using Gemini API based on user prompt and type.
 * Supports: image, text generation. Video/audio/simulation are placeholders.
 */

import type { NextApiRequest, NextApiResponse } from "next"
import { GoogleGenAI } from "@google/genai"
import { createSupabaseAdmin, getAuthenticatedUser } from "../../lib/supabase"
import type { ApiResponse, FeedItem } from "../../lib/types"

interface CreateRequest {
  prompt: string
  type: "image" | "video" | "audio" | "text" | "simulation"
  creativity?: number // 0-100
  fidelity?: number // 0-100
  title?: string
  description?: string
  mediaUrls?: string[]
  scheduledAt?: string
}

interface CreateResponse {
  feedItem: FeedItem
  generatedContent?: {
    contentUrl?: string
    thumbnail?: string
    text?: string
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<CreateResponse>>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Get auth token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace("Bearer ", "") || null
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const {
    prompt,
    type,
    creativity = 75,
    fidelity = 50,
    title,
    description,
    mediaUrls,
    scheduledAt,
  }: CreateRequest = req.body

  if (!prompt || !type) {
    return res.status(400).json({ error: "Missing required fields: prompt, type" })
  }

  const validTypes = ["image", "video", "audio", "text", "simulation"]
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid type" })
  }

  try {
    const supabase = createSupabaseAdmin()
    const generatedContent: { contentUrl?: string; thumbnail?: string; text?: string } = {}
    let finalTitle = title || prompt.substring(0, 50)

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" })
    }

    const ai = new GoogleGenAI({ apiKey })

    // Generate content based on type
    if (type === "image") {
      // Generate image using Gemini
      const temperature = creativity / 100 // Map creativity to temperature
      const imagePrompt = `Generate a high-quality image: ${prompt}. 
Style: ${fidelity > 70 ? "photorealistic" : fidelity > 40 ? "detailed illustration" : "artistic interpretation"}.
Creativity level: ${creativity}%.`

      try {
        const imageResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: {
            parts: [{ text: imagePrompt }],
          },
        })

        // Extract image from response
        const candidates = imageResponse.candidates
        if (candidates && candidates.length > 0) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const imageData = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`
              generatedContent.contentUrl = imageData
              generatedContent.thumbnail = imageData
              break
            }
          }
        }

        // If no image in response, try image generation model
        if (!generatedContent.contentUrl) {
          const imageModelResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
              parts: [{ text: prompt }],
            },
          })

          const imgCandidates = imageModelResponse.candidates
          if (imgCandidates && imgCandidates.length > 0) {
            for (const part of imgCandidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const imageData = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`
                generatedContent.contentUrl = imageData
                generatedContent.thumbnail = imageData
                break
              }
            }
          }
        }
      } catch (imgError) {
        console.warn("Image generation failed:", imgError)
        // Continue without image - will create feed item with placeholder
      }
    } else if (type === "text") {
      // Generate text content
      const temperature = creativity / 100
      const textPrompt = `Create ${prompt}. 
Style: ${fidelity > 70 ? "detailed and precise" : fidelity > 40 ? "balanced" : "creative and imaginative"}.
Creativity level: ${creativity}%.`

      try {
        const textResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: {
            parts: [{ text: textPrompt }],
          },
        })

        const text = textResponse.text() || prompt
        generatedContent.text = text
        finalTitle = title || text.substring(0, 50)
      } catch (textError) {
        console.warn("Text generation failed:", textError)
        generatedContent.text = prompt // Fallback to original prompt
      }
    } else {
      // Video, audio, simulation - not yet supported, use placeholder
      generatedContent.contentUrl = null
    }

    // Create feed item in database
    const { data: feedItem, error: dbError } = await supabase
      .from("feed_items")
      .insert({
        user_id: user.id,
        title: finalTitle,
        type,
        description: type === "text" ? generatedContent.text : prompt,
        thumbnail: generatedContent.thumbnail || null,
        content_url: generatedContent.contentUrl || null,
        remixes: 0,
        views: 0,
      })
      .select()
      .single()

    if (dbError) {
      return res.status(500).json({ error: dbError.message })
    }

    return res.status(201).json({
      data: {
        feedItem: feedItem as FeedItem,
        generatedContent,
      },
      message: `${type} generated successfully`,
    })
  } catch (error: any) {
    console.error("[Create API] Error:", error)
    return res.status(500).json({
      error: error.message || "Failed to generate content",
    })
  }
}
