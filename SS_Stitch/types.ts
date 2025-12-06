export interface InputData {
  id: string;
  text: string;
  image: File | null;
  imageUrl: string | null;
}

export interface StitchResult {
  id: string;
  timestamp: number;
  title: string;
  synthesis: string;
  visualPrompt: string;
  generatedImageUrl?: string;
  inputs: {
    a: InputData;
    b: InputData;
  };
}

export enum StitchState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

// Internal Gemini Response Schema
export interface StitchAnalysisResponse {
  title: string;
  synthesis: string;
  visualPrompt: string;
}
