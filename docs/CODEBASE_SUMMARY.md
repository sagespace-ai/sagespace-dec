# SageSpace Codebase Summary

## Overview

SageSpace is a Next.js 16 application that provides a platform for users to interact with AI assistants called "Sages". The application follows a **Sage-first, chat-centric** approach where users can have conversations with specialized AI personalities across different domains.

## Architecture

### Technology Stack
- **Framework:** Next.js 16.0.7 (App Router)
- **Language:** TypeScript 5.0.2
- **UI:** React 19.2.1, Tailwind CSS 4.1.9
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma 6.2.0 (for schema, but using Supabase client directly)
- **LLM:** OpenAI/OpenRouter integration
- **Package Manager:** pnpm 10.x
- **Deployment:** Vercel

### Project Structure

```
SageSpace-dec/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/        # Marketing/landing pages
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── chat/               # Chat interface
│   ├── council/            # Multi-sage deliberation
│   ├── marketplace/        # Sage discovery
│   ├── memory/             # Conversation history
│   ├── observatory/        # Performance monitoring
│   ├── playground/         # Main chat interface
│   ├── universe-map/       # 3D Sage exploration
│   └── ...
├── components/             # React components
│   ├── chat/               # Chat-related components
│   ├── sage/               # Sage display components
│   ├── sage-selector/      # Sage selection UI
│   └── ui/                 # shadcn/ui components
├── lib/                    # Core libraries
│   ├── supabase/          # Supabase client setup
│   ├── llm.ts             # LLM integration
│   ├── personalization.ts # Client-safe personalization
│   ├── personalization-server.ts # Server-only personalization
│   ├── sage-templates.ts  # Sage definitions
│   └── ...
├── types/                  # TypeScript type definitions
├── docs/                   # Documentation
└── prisma/                 # Prisma schema
```

## Core Features

### 1. Chat System
- **Dual chat architecture:**
  - Conversation-based (`/api/chat`) - Uses `conversations` and `messages` tables
  - Session-based (`/api/chat/messages`) - Uses `chat_messages` table
- **LLM Integration:** OpenAI/OpenRouter with proper Sage context
- **Message types:** Text, images, artifacts, quests, posts
- **Real-time updates:** Session-based chat with live message streaming

### 2. Sages (AI Assistants)
- **300+ Sage templates** across 10 domains:
  - Health & Wellness
  - Education & Learning
  - Creative & Arts
  - Business & Finance
  - Science & Research
  - Technology & Innovation
  - Legal & Justice
  - Environment & Sustainability
  - Personal Development
  - Social & Community

- **Sage properties:**
  - `id`, `name`, `role`, `domain`, `avatar` (emoji)
  - `description`, `capabilities[]`
  - `synopsis` (1-2 sentence warm description) ✨ NEW
  - `starterConversations[]` (personalized conversation starters) ✨ NEW

### 3. Personalization
- **User Profile:** profession, interests, goals
- **Starter conversation personalization:**
  - Matches user profession (e.g., scientists get work/lab starters)
  - Matches user interests with starter tags
  - Avoids recently discussed topics
  - Adds randomness for variety

### 4. Key Pages

#### `/playground` - Main Chat Interface
- Sage-o-matic (auto-suggested flows)
- 1-on-1 chat with any Sage
- Multimodal content generation

#### `/chat/[sessionId]` - Chat Session
- Session-based conversations
- Shows starter conversations when empty
- Displays Sage synopsis
- Real-time message updates

#### `/council` - Multi-Sage Deliberation
- Multiple Sages discuss a topic
- Different perspectives
- Consensus generation

#### `/observatory` - Performance Monitoring
- Real-time metrics dashboard
- Globe visualization of Sage activity
- Social graph of connections
- Heatmap of activity
- Behavioral radar alerts
- **Note:** No orbit associations found - uses view modes: "creator", "scientist", "governance", "cosmic"

#### `/universe-map` - 3D Sage Exploration
- 3D spatial visualization
- Constellation groupings
- Proximity-based discovery
- Social features (friends, trending)

#### `/memory` - Conversation History
- Browse past conversations
- Filter by Sage, date, topic
- Search functionality

#### `/marketplace` - Sage Discovery
- Browse all 300+ Sages
- Search and filter
- Individual Sage detail pages

### 5. API Routes

#### Chat APIs
- `POST /api/chat` - Conversation-based chat
- `POST /api/chat/messages` - Session-based chat
- `GET /api/chat/messages?sessionId=...` - Fetch messages
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions?sessionId=...` - Get session

#### Sage APIs
- `GET /api/sages` - List all Sages
- `GET /api/recommendations/sage` - Get Sage recommendations

#### Other APIs
- `/api/council` - Multi-sage deliberation
- `/api/conversations` - Conversation management
- `/api/artifacts` - Artifact generation
- `/api/credits` - Credit management
- `/api/xp` - XP/leveling system

## Database Schema

### Supabase Tables
- `users` / `profiles` - User data
- `sages` - Sage definitions
- `chat_sessions` - Chat session metadata
- `chat_messages` - Session-based messages
- `conversations` - Conversation-based chats
- `messages` - Conversation messages
- `artifacts` - Generated content
- `agents` - Custom personas

## Recent Changes (Latest Update)

### ✅ Fixed Chat Behavior
- `/api/chat/messages` now calls LLM with proper Sage context
- Added system prompts based on Sage templates
- Fixed message flow to include conversation history
- Improved error handling

### ✅ Enhanced Sage Model
- Added `synopsis` field (1-2 sentence descriptions)
- Added `starterConversations[]` array
- Added synopsis and starters to 5+ key Sages

### ✅ Personalization System
- Created `UserProfile` type
- Implemented `getPersonalizedStarterConversations()`
- Profession/interest matching
- History awareness

### ✅ UI Enhancements
- Created `SageCard` component
- Updated chat session page with starter conversations
- Fixed playground response handling

### ✅ Build Fixes
- Moved `getUserProfile()` to server-only file
- Fixed client component import errors
- All TypeScript checks passing

## Legacy Code

### Orbits (Deprecated)
**Orbits were NOT associated with the observatory page.** 

The observatory page uses view modes: `"creator" | "scientist" | "governance" | "cosmic"` - these are NOT orbits.

**Orbit references found in:**
- `app/playground/page.tsx` - Legacy references (not actively used)
- `app/council/page.tsx` - Legacy references
- `app/observatory/page.tsx` - No orbit references found
- `app/universe-map/page.tsx` - Legacy references
- `app/memory/page.tsx` - Legacy references
- `app/marketplace/[slug]/page.tsx` - Legacy references
- `app/governance/page.tsx` - Legacy references
- `app/(marketing)/page.tsx` - Legacy references
- `app/referrals/page.tsx` - Legacy references
- `app/persona-editor/page.tsx` - Legacy references
- `app/globals.css` - Legacy CSS classes

**Status:** All orbit-based concepts (Work/Play/Live/Harmony) are **deprecated** and should not be used for new features. The codebase is moving to a **Sage-first, chat-centric** approach.

## Key Libraries

### Core
- `lib/llm.ts` - LLM integration (OpenAI/OpenRouter)
- `lib/sage-templates.ts` - 300+ Sage definitions
- `lib/personalization.ts` - Client-safe personalization
- `lib/personalization-server.ts` - Server-only personalization
- `lib/conversations.ts` - Conversation management
- `lib/personas.ts` - Persona fetching

### Supabase
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/middleware.ts` - Middleware setup

### Utilities
- `lib/credits.ts` - Credit system
- `lib/xp.ts` - XP/leveling
- `lib/rate.ts` - Rate limiting
- `lib/events.ts` - Event logging

## Type Definitions

### Core Types
- `SageTemplate` - Sage definition
- `StarterConversation` - Conversation starter
- `UserProfile` - User profile data
- `ChatMessage` - Chat message structure
- `ChatSession` - Chat session metadata
- `ContentBlock` - Multimodal content blocks

## Documentation

- `docs/chat-architecture.md` - Chat system architecture
- `docs/sages-and-chat.md` - Sage schema and personalization
- `docs/CODEBASE_SUMMARY.md` - This file

## Build & Deployment

- **Build:** `npm run build`
- **Type Check:** `npm run type-check`
- **Dev:** `npm run dev`
- **Deployment:** Vercel (automatic on push to main)

## Current Status

✅ **Working:**
- Chat system with LLM integration
- Sage definitions with synopsis and starters
- Personalization system
- All major pages functional
- TypeScript type checking passing

⚠️ **Warnings (Non-blocking):**
- Sentry module not found (optional)
- Next.js config eslint deprecation
- Middleware deprecation warning

## Next Steps (Potential)

1. Add profession/interests/goals fields to profiles table
2. Implement LLM-based starter conversation rephrasing
3. Add more Sages with synopsis and starters
4. Enhance personalization with machine learning
5. Remove remaining orbit references (cleanup)

