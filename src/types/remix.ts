/**
 * Remix Feature Types
 * 
 * Types for the Remix feature that combines two inputs into a single output.
 * Based on SS_Stitch functionality, integrated into SageSpace.
 */

export interface RemixInput {
  text?: string
  imageUrl?: string
  metadata?: Record<string, any>
}

export interface RemixRequest {
  inputA: RemixInput
  inputB: RemixInput
  mode?: 'concept_blend' | 'image_blend' | 'idea_generation'
  extraContext?: Record<string, any>
}

export interface RemixResponse {
  resultText?: string
  resultImageUrl?: string
  title?: string
  synthesis?: string
  visualPrompt?: string
  debugInfo?: Record<string, any>
}

export type RemixMode = 'concept_blend' | 'image_blend' | 'idea_generation'

export interface RemixState {
  isLoading: boolean
  error: string | null
  result: RemixResponse | null
}
