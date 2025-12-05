// TypeScript types for SageSpace database schema

export type Plan = "free" | "pro" | "team" | "enterprise"
export type Visibility = "public" | "followers" | "private"
export type ArtifactType = "text" | "audio" | "image" | "video"
export type SenderType = "user" | "sage"
export type ThreadType = "chat" | "circle" | "debate" | "duet"
export type EventType = "like" | "remix" | "comment" | "save" | "share" | "validate" | "follow" | "view"
export type TargetType = "artifact" | "sage" | "user" | "thread"
export type QuestTaskType = "remix" | "validate" | "teach" | "debate" | "create" | "share" | "streak"
export type PurchaseType = "plan" | "credits" | "marketplace"
export type PurchaseStatus = "pending" | "completed" | "failed" | "refunded"

export interface User {
  id: string
  username?: string
  display_name?: string
  avatar_url?: string
  bio?: string
  plan: Plan
  credits: number
  xp: number
  level: number
  streak_days: number
  last_active_date: string
  referral_code: string
  referred_by?: string
  trust_score: number
  created_at: string
  updated_at: string
}

export interface Sage {
  id: string
  owner_id?: string
  name: string
  role: string
  domain: string
  avatar_emoji: string
  persona_json: PersonaJSON
  capabilities: string[]
  artifact_types: ArtifactType[]
  visibility: Visibility
  trust_score: number
  total_interactions: number
  total_xp_given: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface PersonaJSON {
  goals: string[]
  tone: string
  sources?: string[]
  tools?: string[]
  modalities: ArtifactType[]
  safety_config?: {
    pii_filtering: boolean
    citation_required: boolean
    content_provenance: boolean
  }
}

export interface Artifact {
  id: string
  sage_id: string
  creator_id?: string
  type: ArtifactType
  title?: string
  content?: string
  content_url?: string
  transcript?: string
  thumbnail_url?: string
  duration_seconds?: number

  // Provenance
  trace_id: string
  model_used?: string
  prompt_hash?: string
  generation_timestamp: string
  watermarked: boolean
  citations: Citation[]
  pii_filtered: boolean
  content_warnings: string[]

  // Lineage
  parent_artifact_id?: string
  remix_chain: string[]

  // Engagement
  views: number
  likes: number
  remixes: number
  shares: number
  saves: number

  visibility: Visibility
  created_at: string
  updated_at: string
}

export interface Citation {
  url: string
  title: string
  accessed_at: string
}

export interface Thread {
  id: string
  user_id: string
  title?: string
  type: ThreadType
  sage_ids: string[]
  visibility: Visibility
  total_messages: number
  xp_earned: number
  mood?: string
  tags: string[]
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  thread_id: string
  sender_type: SenderType
  sender_id: string
  content: string
  artifacts: string[]
  trace_id?: string
  created_at: string
}

export interface Event {
  id: string
  event_type: EventType
  actor_id: string
  target_type: TargetType
  target_id: string
  metadata: Record<string, any>
  created_at: string
}

export interface Quest {
  id: string
  season: number
  task_type: QuestTaskType
  title: string
  description: string
  reward_xp: number
  reward_credits: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  sage_id?: string
  artifact_id?: string
  trace_id?: string
  action: string
  prompt_hash?: string
  model_used?: string
  input_tokens?: number
  output_tokens?: number
  cost_cents?: number
  redactions: Redaction[]
  citations: Citation[]
  metadata: Record<string, any>
  created_at: string
}

export interface Redaction {
  type: string
  count: number
}
