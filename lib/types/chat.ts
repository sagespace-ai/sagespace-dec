export type SageMode = "single" | "circle" | "duel" | "council"
export type MessageAuthorType = "user" | "sage"
export type Mood = "calm" | "stressed" | "curious" | "focused" | "overwhelmed" | null

// Content Block Types
export type ContentBlockType = "text" | "image" | "audio" | "video" | "post" | "knowledge_card" | "artifact" | "quest"

export interface TextBlock {
  type: "text"
  content: string
}

export interface ImageBlock {
  type: "image"
  url: string
  alt: string
  caption?: string
}

export interface AudioBlock {
  type: "audio"
  url: string
  duration?: number
  title?: string
}

export interface VideoBlock {
  type: "video"
  url: string
  thumbnail?: string
  duration?: number
  title?: string
}

export interface PostBlock {
  type: "post"
  title: string
  summary: string
  bullets?: string[]
}

export interface KnowledgeCardBlock {
  type: "knowledge_card"
  title: string
  bullets: string[]
  category?: string
}

export interface ArtifactBlock {
  type: "artifact"
  name: string
  description: string
  rarity: "common" | "rare" | "epic" | "legendary"
  category?: string
}

export interface QuestBlock {
  type: "quest"
  title: string
  description: string
  rewardXp: number
  status: "new" | "in_progress" | "completed"
  difficulty?: "easy" | "medium" | "hard"
}

export type ContentBlock =
  | TextBlock
  | ImageBlock
  | AudioBlock
  | VideoBlock
  | PostBlock
  | KnowledgeCardBlock
  | ArtifactBlock
  | QuestBlock

export interface ChatMessage {
  id: string
  sessionId: string
  authorType: MessageAuthorType
  authorId: string
  authorName?: string
  authorEmoji?: string
  createdAt: string
  modeAtTime: SageMode
  blocks: ContentBlock[]
}

export interface ChatSession {
  id: string
  userId: string
  mode: SageMode
  primarySageId: string
  sageIds: string[]
  createdAt: string
  updatedAt: string
}

export interface ChatParticipant {
  id: string
  name: string
  emoji: string
  specialty: string
  status: "online" | "offline" | "thinking"
}

export interface ChatStats {
  messagesSent: number
  xpEarned: number
  artifactsCollected: number
  questsCompleted: number
}

export interface GenerationHints {
  preferredBlocks?: ContentBlockType[]
  mood?: Mood
}
