// Shared DTOs (Data Transfer Objects) for API communication

export interface User {
  id: string
  email: string
  name: string
  credits: number
  xp: number
  level: number
  createdAt: string
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  userId: string
  personaId: string
  messages: Message[]
  mood?: string // Made mood optional and accept string to allow flexibility
  createdAt: string
  updatedAt: string
}

export interface Persona {
  id: string
  name: string
  systemPrompt: string
  description: string
  emoji: string
  isPublic: boolean
  isOfficial: boolean
  userId: string | null
  createdAt: string
  updatedAt: string
}

export interface CouncilMember {
  personaId: string
  response: string
  confidence: number
  reasoning: string
}

export interface CouncilDeliberation {
  id: string
  userId: string
  question: string
  members: CouncilMember[]
  synthesis: string
  status: "pending" | "processing" | "complete" | "failed"
  createdAt: string
  completedAt?: string
}

export interface Artifact {
  id: string
  userId: string
  conversationId: string
  type: "code" | "document" | "image" | "data"
  title: string
  content: string
  url?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  tier: "bronze" | "silver" | "gold" | "platinum"
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  badge: Badge
  awardedAt: string
}

export interface AgentMetrics {
  personaId: string
  name: string
  totalConversations: number
  averageRating: number
  responseTime: number
  successRate: number
  topicDistribution: Record<string, number>
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down"
  uptime: number
  requestsPerMinute: number
  errorRate: number
  avgResponseTime: number
  activeUsers: number
}

// API Response wrappers
export interface APIResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Request DTOs
export interface CreateConversationRequest {
  personaId: string
  title?: string
  mood?: string // Made mood accept string to allow flexibility
}

export interface SendMessageRequest {
  conversationId: string
  content: string
}

export interface CreateCouncilRequest {
  question: string
  personaIds: string[]
}

export interface CreatePersonaRequest {
  name: string
  systemPrompt: string
  description: string
  emoji: string
  isPublic?: boolean
}

export interface UpdatePersonaRequest extends Partial<CreatePersonaRequest> {}

export interface CreateArtifactRequest {
  conversationId: string
  type: "code" | "document" | "image" | "data"
  title: string
  content: string
  metadata?: Record<string, any>
}
