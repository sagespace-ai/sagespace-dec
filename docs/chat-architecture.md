# SageSpace Chat Architecture

## Overview
SageSpace uses a dual-chat system with two main entry points:
1. **Conversation-based chat** (`/api/chat`) - Uses `conversations` and `messages` tables
2. **Session-based chat** (`/api/chat/messages`) - Uses `chat_messages` table

## Current Chat Flow

### Entry Point 1: `/api/chat` (Conversation-based)
- **Used by:** Playground page
- **Flow:**
  1. Client sends: `{ conversationId?, personaId, userMessage, stream? }`
  2. Server creates/gets conversation
  3. Fetches persona system prompt
  4. Builds messages array: `[system, ...history, user]`
  5. Calls `generateChatCompletion()` from `lib/llm.ts`
  6. Saves messages to `messages` table
  7. Returns: `{ ok, data: { conversationId, messageId, assistantMessage, tokens, creditsCharged } }`

### Entry Point 2: `/api/chat/messages` (Session-based)
- **Used by:** Chat session page (`/chat/[sessionId]`)
- **Flow:**
  1. Client sends: `{ sessionId, content, mode, generationHints }`
  2. Server stores user message in `chat_messages` table
  3. **ISSUE:** Generates mock content blocks instead of calling LLM
  4. Returns: `{ userMessage, sageMessages, stats }`

## Issues Identified

1. **`/api/chat/messages` doesn't call LLM** - Just generates mock blocks
2. **Inconsistent response formats** - Different shapes from different endpoints
3. **No Sage context** - System prompts are generic, not Sage-specific
4. **Missing synopsis/starter conversations** - Sages are just templates
5. **No user profile personalization** - No profession/interests/goals fields

## Components

- `app/playground/page.tsx` - Uses `/api/chat`
- `app/chat/[sessionId]/page.tsx` - Uses `/api/chat/messages`
- `app/council/page.tsx` - Uses `/api/council`
- `lib/llm.ts` - LLM integration (OpenAI/OpenRouter)
- `lib/personas.ts` - Persona fetching
- `lib/sage-templates.ts` - Built-in Sage definitions
- `lib/conversations.ts` - Conversation management

## Next Steps

1. Fix `/api/chat/messages` to call LLM with proper Sage context
2. Add synopsis and starterConversations to SageTemplate
3. Extend user profile with profession/interests/goals
4. Create personalization logic for starter conversations
5. Update UI components to show synopsis and starters

