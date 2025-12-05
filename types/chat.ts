// Multimodal content block types
export type ContentBlockType = "text" | "image" | "audio" | "video" | "post" | "knowledge_card" | "artifact" | "quest"

export interface BaseBlock {
  id: string
  type: ContentBlockType
}

export interface TextBlock extends BaseBlock {
  type: "text"
  text: string
}

export interface ImageBlock extends BaseBlock {
  type: "image"
  url: string
  alt?: string
}

export interface AudioBlock extends BaseBlock {
  type: "audio"
  url: string
  title?: string
  durationSec?: number
}

export interface VideoBlock extends BaseBlock {
  type: "video"
  url: string
  title?: string
  thumbnailUrl?: string
}

export interface PostBlock extends BaseBlock {
  type: "post"
  title: string
  summary: string
  bodyPreview: string
  permalink?: string
}

export interface KnowledgeCardBlock extends BaseBlock {
  type: "knowledge_card"
  title: string
  bullets: string[]
  sourceUrl?: string
}

export interface ArtifactBlock extends BaseBlock {
  type: "artifact"
  name: string
  rarity: "common" | "rare" | "epic" | "legendary"
  iconEmoji: string
  description: string
}

export interface QuestBlock extends BaseBlock {
  type: "quest"
  title: string
  description: string
  goal: string
  rewardXp: number
  status: "new" | "in_progress" | "completed"
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

export type MessageAuthorType = "user" | "sage"

export interface ChatMessage {
  id: string
  sessionId: string
  authorType: MessageAuthorType
  authorId: string
  createdAt: string
  modeAtTime: string
  blocks: ContentBlock[]
}
