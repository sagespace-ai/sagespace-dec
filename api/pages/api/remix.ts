/**
 * POST /api/remix - Remix/Stitch two inputs together
 *
 * This endpoint combines two inputs (text and/or images) into a single
 * novel output using AI synthesis. Based on SS_Stitch functionality.
 */

import type { NextApiRequest, NextApiResponse } from "next"
// @ts-ignore - @google/genai may not have types
import { GoogleGenAI } from "@google/genai"
import { getAuthenticatedUser } from "../../lib/supabase"
import type { ApiResponse } from "../../lib/types"

interface RemixRequest {
  inputA: {
    text?: string
    imageUrl?: string
    metadata?: any
  }
  inputB: {
    text?: string
    imageUrl?: string
    metadata?: any
  }
  mode?: "concept_blend" | "image_blend" | "idea_generation"
  extraContext?: Record<string, any>
}

interface RemixResponse {
  resultText?: string
  resultImageUrl?: string
  title?: string
  synthesis?: string
  visualPrompt?: string
  debugInfo?: any
}

// Helper to convert image URL to base64 for Gemini
async function imageUrlToBase64(url: string): Promise<{ mimeType: string; data: string }> {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const contentType = response.headers.get("content-type") || "image/jpeg"
    return { mimeType: contentType, data: base64 }
  } catch (error) {
    throw new Error(`Failed to process image: ${error}`)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<RemixResponse>>) {
  // Get auth token from Authorization header
  const authHeader = req.headers.authorization
  const token = authHeader?.replace("Bearer ", "") || null

  // Get authenticated user
  const user = await getAuthenticatedUser(token)
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { inputA, inputB, mode = "concept_blend", extraContext } = req.body as RemixRequest

  // Validate inputs
  if (!inputA || !inputB) {
    return res.status(400).json({ error: "Both inputA and inputB are required" })
  }

  if (!inputA.text && !inputA.imageUrl && !inputB.text && !inputB.imageUrl) {
    return res.status(400).json({ error: "At least one input must have text or imageUrl" })
  }

  try {
    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" })
    }

    const ai = new GoogleGenAI({ apiKey })
    const parts: any[] = []

    // Build prompt
    let prompt =
      "You are a creative synthesizer engine known as 'Stitch'. Your goal is to fuse two inputs (Concept A and Concept B) into a single, cohesive, novel concept.\n\n"

    // Process Input A
    prompt += `[Input A]: ${inputA.text ? `Text: "${inputA.text}"` : "No text provided."}\n`
    if (inputA.imageUrl) {
      try {
        const imageData = await imageUrlToBase64(inputA.imageUrl)
        parts.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
          },
        })
        prompt += "(Input A includes the attached image)\n"
      } catch (error) {
        console.warn("Failed to process inputA image:", error)
      }
    }

    // Process Input B
    prompt += `\n[Input B]: ${inputB.text ? `Text: "${inputB.text}"` : "No text provided."}\n`
    if (inputB.imageUrl) {
      try {
        const imageData = await imageUrlToBase64(inputB.imageUrl)
        parts.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
          },
        })
        prompt += "(Input B includes the attached image)\n"
      } catch (error) {
        console.warn("Failed to process inputB image:", error)
      }
    }

    // Add mode-specific instructions
    const modeInstructions = {
      concept_blend: "Focus on blending the core concepts and ideas from both inputs into a novel synthesis.",
      image_blend: "Focus on creating a visual synthesis that combines elements from both inputs.",
      idea_generation: "Generate new ideas and possibilities that emerge from combining these inputs.",
    }

    prompt += `\nMode: ${mode}\n${modeInstructions[mode] || modeInstructions.concept_blend}\n\n`

    // Add extra context if provided (e.g., persona, orbit context)
    if (extraContext) {
      prompt += `\nAdditional Context:\n${JSON.stringify(extraContext, null, 2)}\n\n`
    }

    prompt += `TASK:
1. Analyze the latent connections between Input A and Input B.
2. Create a "Stitch" - a new concept that bridges them.
3. Provide a catchy Title.
4. Write a Synthesis paragraph (approx 100 words) describing this new merged reality, narrative, or object.
5. Write a detailed "Visual Prompt" that could be used to generate an image of this synthesis.

Return the result in JSON format.`

    parts.push({ text: prompt })

    // Generate synthesis
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            synthesis: { type: "string" },
            visualPrompt: { type: "string" },
          },
          required: ["title", "synthesis", "visualPrompt"],
        },
      },
    })

    if (!response.text) {
      throw new Error("No response from Gemini")
    }

    const analysis = JSON.parse(response.text) as {
      title: string
      synthesis: string
      visualPrompt: string
    }

    // Optionally generate image (if mode is image_blend or if requested)
    let resultImageUrl: string | undefined
    if (mode === "image_blend" || extraContext?.generateImage) {
      try {
        const imageResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [{ text: analysis.visualPrompt }],
          },
        })

        // Extract image from response
        const candidates = imageResponse.candidates
        if (candidates && candidates.length > 0) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              resultImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`
              break
            }
          }
        }
      } catch (imgError) {
        console.warn("Image generation failed, but synthesis is complete", imgError)
        // Continue without image
      }
    }

    const result: RemixResponse = {
      title: analysis.title,
      synthesis: analysis.synthesis,
      resultText: analysis.synthesis,
      visualPrompt: analysis.visualPrompt,
      resultImageUrl,
      debugInfo: {
        mode,
        timestamp: new Date().toISOString(),
      },
    }

    return res.status(200).json({
      data: result,
      message: "Remix created successfully",
    })
  } catch (error: any) {
    console.error("Remix generation error:", error)
    return res.status(500).json({
      error: error.message || "Failed to generate remix",
    })
  }
}
