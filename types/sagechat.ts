export type ArtifactType =
  | "image"
  | "audio"
  | "video"
  | "article"
  | "knowledge-sheet"
  | "interactive"
  | "memory-summary"

export type Quest = {
  id: string
  title: string
  description: string
  type: "reflection" | "generation" | "activity" | "social"
  progress: number
  target: number
  reward: {
    xp: number
    credits?: number
    artifacts?: string[]
  }
  expiresAt?: Date
}

export type Artifact = {
  id: string
  name: string
  type: ArtifactType
  emoji: string
  rarity: "common" | "rare" | "epic" | "legendary"
  description: string
  effects: string[]
  collectedAt: Date
}

export type SageLevel = {
  level: number
  xp: number
  nextLevelXp: number
  unlockedAbilities: string[]
  customizations: {
    tones?: string[]
    voices?: string[]
    visualEffects?: string[]
  }
}

export type ConversationPost = {
  id: string
  title: string
  messageIds: string[]
  visibility: "public" | "followers" | "private"
  tags: string[]
  likes: number
  shares: number
  remixes: number
  createdAt: Date
  userId: string
  sageIds: string[]
}
