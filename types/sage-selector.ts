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
  role?: string
  description?: string
}

export interface RecommendationResult {
  primary: SageSummary | SageSummary[]
  candidates: SageSummary[]
  rationale: string
}

export interface SessionStats {
  sessionId: string
  messagesSent: number
  xpEarned: number
}

export interface SageProfile {
  id: string
  name: string
  avatar: string
  specialty: string
  domain: string
  trending?: boolean
}
