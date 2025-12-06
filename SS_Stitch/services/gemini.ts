import { GoogleGenAI, Type } from "@google/genai";
import { InputData, StitchAnalysisResponse } from "../types";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeAndStitch(inputA: InputData, inputB: InputData): Promise<StitchAnalysisResponse> {
    const parts: any[] = [];

    let prompt = "You are a creative synthesizer engine known as 'Stitch'. Your goal is to fuse two inputs (Concept A and Concept B) into a single, cohesive, novel concept. \n\n";

    // Process Input A
    prompt += `[Input A]: ${inputA.text ? `Text: "${inputA.text}"` : "No text provided."}\n`;
    if (inputA.image) {
      const b64 = await fileToGenerativePart(inputA.image);
      parts.push({
        inlineData: {
          mimeType: inputA.image.type,
          data: b64
        }
      });
      prompt += "(Input A includes the attached image)\n";
    }

    // Process Input B
    prompt += `\n[Input B]: ${inputB.text ? `Text: "${inputB.text}"` : "No text provided."}\n`;
    if (inputB.image) {
      const b64 = await fileToGenerativePart(inputB.image);
      parts.push({
        inlineData: {
          mimeType: inputB.image.type,
          data: b64
        }
      });
      prompt += "(Input B includes the attached image)\n";
    }

    prompt += `\nTASK:
    1. Analyze the latent connections between Input A and Input B.
    2. Create a "Stitch" - a new concept that bridges them.
    3. Provide a catchy Title.
    4. Write a Synthesis paragraph (approx 100 words) describing this new merged reality, narrative, or object.
    5. Write a detailed "Visual Prompt" that could be used to generate an image of this synthesis.

    Return the result in JSON format.
    `;

    parts.push({ text: prompt });

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              synthesis: { type: Type.STRING },
              visualPrompt: { type: Type.STRING }
            },
            required: ["title", "synthesis", "visualPrompt"]
          }
        }
      });

      if (!response.text) {
        throw new Error("No response from Gemini");
      }

      return JSON.parse(response.text) as StitchAnalysisResponse;

    } catch (error) {
      console.error("Stitch Analysis Error:", error);
      throw error;
    }
  }

  async generateStitchedImage(visualPrompt: string): Promise<string> {
    try {
      // Use gemini-2.5-flash-image for generation as per instructions for general image generation tasks
      // that don't require high-res (which would be pro-image-preview).
      // We will assume 'gemini-2.5-flash-image' can handle text-to-image requests via generateContent
      // where the output contains the image data.
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: visualPrompt }]
        },
        config: {
           // No responseMimeType for image models usually
        }
      });

      // Iterate to find image part
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
             return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }
      
      throw new Error("No image generated.");

    } catch (error) {
      console.error("Image Generation Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
