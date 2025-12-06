# Sages and Chat System

## Overview

SageSpace uses a Sage-first, chat-centric approach where users interact with AI assistants (Sages) that have distinct personalities, domains, and capabilities.

## Sage Schema

### SageTemplate Interface

```typescript
interface SageTemplate {
  id: string
  name: string
  domain: string
  role: string
  avatar: string
  description: string
  capabilities: string[]
  synopsis?: string // 1-2 sentence warm description
  starterConversations?: StarterConversation[] // turn-key conversation starters
}
```

### StarterConversation Interface

```typescript
interface StarterConversation {
  id: string
  title: string // short label shown in UI
  prompt: string // actual text sent as the user's first message
  description?: string // optional subtext
  tags?: string[] // e.g. ['wellness', 'work', 'fun']
}
```

## User Profile

### UserProfile Interface

```typescript
interface UserProfile {
  id: string
  name?: string
  profession?: string // e.g., 'microbiologist', 'student', 'gamer'
  interests?: string[] // e.g., ['wellness', 'career', 'fun', 'gaming']
  goals?: string[] // optional goals
  email?: string
  avatarUrl?: string
}
```

## Personalization

Starter conversations are personalized based on:
1. **User profession** - e.g., scientists get work/lab-related starters
2. **User interests** - matches tags in starter conversations
3. **Recent conversation history** - avoids repeating recently discussed topics

The `getPersonalizedStarterConversations()` function in `lib/personalization.ts` handles this logic.

## Chat Flow

### Session-based Chat (`/api/chat/messages`)

1. Client sends: `{ sessionId, content, mode, generationHints, sageId? }`
2. Server:
   - Gets session to find primarySageId if not provided
   - Fetches Sage template for system prompt
   - Gets previous messages for context
   - Calls LLM with proper Sage context
   - Returns: `{ userMessage, sageMessages, stats }`

### Conversation-based Chat (`/api/chat`)

1. Client sends: `{ conversationId?, personaId, userMessage, stream? }`
2. Server:
   - Creates/gets conversation
   - Fetches persona system prompt
   - Builds messages array with history
   - Calls LLM
   - Returns: `{ ok, data: { conversationId, messageId, assistantMessage, tokens, creditsCharged } }`

## UI Components

### SageCard Component

Located at `components/sage/SageCard.tsx`, displays:
- Sage avatar, name, role
- Synopsis (1-2 sentence description)
- Capabilities (tags)
- Personalized starter conversations (3-5 suggestions)

### Chat Session Page

Located at `app/chat/[sessionId]/page.tsx`:
- Shows starter conversations when chat is empty
- Displays Sage synopsis
- Allows clicking starters to begin conversation

## Legacy Code

**Orbit-based concepts (Work/Play/Live/Harmony) are deprecated.**
- Do not use orbit-related code for new features
- Focus on Sage-first, chat-centric approach

