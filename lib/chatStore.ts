import type { ChatSession, ChatMessage, ChatStats, ChatParticipant } from "@/lib/types/chat"

// In-memory stores (replace with database in production)
const sessions = new Map<string, ChatSession>()
const messages = new Map<string, ChatMessage[]>()
const stats = new Map<string, ChatStats>()
const participants = new Map<string, ChatParticipant[]>()

export function getSession(sessionId: string): ChatSession | undefined {
  return sessions.get(sessionId)
}

export function createSession(session: ChatSession): void {
  sessions.set(session.id, session)
  messages.set(session.id, [])
}

export function getMessages(sessionId: string): ChatMessage[] {
  return messages.get(sessionId) || []
}

export function addMessage(sessionId: string, message: ChatMessage): void {
  const sessionMessages = messages.get(sessionId) || []
  sessionMessages.push(message)
  messages.set(sessionId, sessionMessages)
}

export function getStats(sessionId: string): ChatStats {
  return (
    stats.get(sessionId) || {
      messagesSent: 0,
      xpEarned: 0,
      artifactsCollected: 0,
      questsCompleted: 0,
    }
  )
}

export function updateStats(sessionId: string, updates: Partial<ChatStats>): void {
  const currentStats = getStats(sessionId)
  stats.set(sessionId, { ...currentStats, ...updates })
}

export function getParticipants(sessionId: string): ChatParticipant[] {
  return participants.get(sessionId) || []
}

export function setParticipants(sessionId: string, newParticipants: ChatParticipant[]): void {
  participants.set(sessionId, newParticipants)
}
