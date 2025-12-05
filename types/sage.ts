// Core Sage types
export type SageMode = "single" | "circle" | "duel" | "council"

export type Mood = "calm" | "stressed" | "curious" | "focused" | "overwhelmed" | "playful"

export interface SageSummary {
  id: string
  name: string
  domain: string
  avatarUrl?: string
  emoji?: string
  colorTheme: string
  tags: string[]
  isUserCreated: boolean
}

export interface ChatParticipant {
  id: string
  name: string
  role: "sage" | "user"
  avatarUrl?: string
  emoji?: string
  domain?: string
}

export interface ChatSession {
  id: string
  mode: SageMode
  primarySageId: string
  sageIds: string[]
  createdAt: string
}

export interface ChatStats {
  sessionId: string
  messagesSent: number
  xpEarned: number
  artifactsCollected: number
}

export interface RecommendationResult {
  primary: SageSummary | SageSummary[]
  candidates: SageSummary[]
  rationale: string
}
