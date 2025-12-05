import type { Prisma } from "@prisma/client"
import type OpenAI from "openai"

// Prisma JSON field types
export type JsonValue = Prisma.JsonValue
export type CreditMeta = {
  conversationId?: string
  artifactId?: string
  tokensUsed?: number
  model?: string
  feature?: string
  [key: string]: JsonValue | undefined
}

export type MarketplaceWhereInput = {
  category?: string
  featured?: boolean
  trending?: boolean
}

// OpenAI types
export type ChatMessage = OpenAI.ChatCompletionMessageParam

// Error types
export type ApiError = {
  message: string
  code?: string
  statusCode?: number
}

// Supabase Auth types
export type AuthEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED" | "PASSWORD_RECOVERY"

export type AuthUser = {
  id: string
  email?: string
  role?: string
  user_metadata?: Record<string, unknown>
}

export type AuthSession = {
  user: AuthUser | null
  access_token?: string
  refresh_token?: string
}

export type LegendPayloadItem = {
  value: string | number
  dataKey: string
  color: string
  payload?: Record<string, unknown>
  type?: string
}
