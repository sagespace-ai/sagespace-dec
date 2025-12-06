# Playground Architecture

## Current State (Pre-Refactor)

### State Management
- **Chat State:** Managed in `app/playground/page.tsx` via React `useState`
  - `messages`: Array of `Message` objects (role, content, timestamp, type, metadata)
  - `input`: Current input text
  - `loading`: Boolean flag for API request in progress
  - `error`: Error message string or null
  - `currentConversationId`: Tracks conversation ID from API

### Message Flow
1. **User Input** → `input` state
2. **Send Message** → `sendMessage()` function:
   - Validates input (non-empty, not loading)
   - Adds user message to `messages` array optimistically
   - Clears input, sets `loading = true`
   - Maps Sage name to template ID (`SAGE_NAME_TO_ID`)
   - POSTs to `/api/chat` with:
     - `personaId`: Sage template ID
     - `userMessage`: Text content
     - `conversationId`: Optional, for conversation continuity
3. **API Response** → `/api/chat/route.ts`:
   - Validates request (Zod schema)
   - Gets/creates conversation
   - Fetches persona system prompt
   - Calls LLM via `generateChatCompletion()`
   - Returns `{ ok: true, data: { assistantMessage, conversationId, tokens, ... } }`
4. **UI Update** → `sendMessage()` continues:
   - Extracts `assistantMessage` from response
   - Creates assistant `Message` object
   - Adds to `messages` array
   - Updates stats (XP, tokens)
   - Sets `loading = false`

### Loading State Management
- **Set to true:** When `sendMessage()` starts
- **Set to false:** 
  - On successful response
  - On error (in catch block)
  - **ISSUE:** If error occurs before catch, `loading` may never reset

### Artifacts/Quests Schema
- **Types:** Defined in `types/chat.ts`
  - `ArtifactBlock`: `{ type: "artifact", name, rarity, iconEmoji, description }`
  - `QuestBlock`: `{ type: "quest", title, description, goal, rewardXp, status }`
- **API:** `/api/artifacts/route.ts` exists but:
  - Requires `conversationId` (user-initiated only)
  - Artifacts table doesn't exist in DB schema
  - Returns stub data
- **Quests API:** Does not exist
- **Images API:** Does not exist
- **Audio API:** Does not exist

### Multimodal Buttons
- **Current State:** Decorative only, no onClick handlers
- **Location:** `app/playground/page.tsx:789-812`
- **Expected Behavior:** None implemented

### LLM Response Parsing
- **Current:** `lib/llm-parser.ts` uses regex patterns to extract:
  - Artifact mentions
  - Quest mentions
  - Code blocks
- **Used in:** `app/api/chat/messages/route.ts` (session-based chat)
- **Not used in:** `app/api/chat/route.ts` (playground chat)

### Issues Identified
1. Multimodal buttons have no handlers
2. `loading` can get stuck if error occurs before catch
3. No timeout mechanism for stuck loading
4. No structured agent output (only text parsing)
5. No agentic creation APIs
6. No file upload/image generation
7. No code editor integration
8. No audio recording

## Target Architecture (Post-Refactor)

### Phase 1: Critical UX Fixes
- Add onClick handlers to all multimodal buttons
- Add timeout mechanism for loading state
- Add error recovery UI
- Ensure loading always resets (try/finally)

### Phase 2: Minimal Multimodal Features
- Image upload with file picker
- Code editor modal (Monaco)
- Audio recording (MediaRecorder)
- Quest creation modal

### Phase 3: Agentic Creation
- Structured agent output (function calling or JSON mode)
- Agentic artifact creation API
- Agentic quest generation API
- Automatic content creation from agent responses

### Phase 4: Advanced (Future)
- Agentic workflow engine
- Content indexing
- Agent-to-agent communication

