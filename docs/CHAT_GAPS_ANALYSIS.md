# Chat System Gaps Analysis

## Problem
Sages are replying with generic "I'm here to help! How can I assist you today?" instead of proper multimodal conversations.

## Root Causes Identified

### 1. **Playground API Mismatch** ❌ CRITICAL
**Location:** `app/playground/page.tsx:278-284`

**Problem:**
- Playground sends: `{ messages: [...], agentId: selectedSage }`
- API expects: `{ personaId: string, userMessage: string, conversationId?: string }`
- **Mismatch:** `agentId` vs `personaId`, `messages` array vs `userMessage` string
- **Additional Issue:** Playground uses hardcoded Sage names ("Dr. Wellness", "Prof. Einstein") with IDs ("1", "2"), but API expects Sage template IDs ("health-1", "edu-1")

**Current Code:**
```typescript
// Playground has hardcoded Sages
const sages: SageData[] = [
  { name: "Dr. Wellness", id: "1", ... },  // ❌ ID "1" doesn't match "health-1"
  { name: "Prof. Einstein", id: "2", ... }, // ❌ ID "2" doesn't match any template
]

// Sends wrong format
body: JSON.stringify({
  messages: [...messages.map((m) => ({ role: m.role, content: m.content })), userMessage],
  agentId: selectedSage,  // ❌ Wrong field name, wrong ID format
})
```

**Expected by API:**
```typescript
{
  personaId: "health-1",  // ✅ Should be actual Sage template ID
  userMessage: "Hello",   // ✅ Should be just the new message string
  conversationId?: string // ✅ Optional
}
```

**Impact:** 
- API validation fails (wrong field names)
- Even if it passes, `getPersona()` can't find Sage (ID mismatch)
- Falls back to generic system prompt
- Returns generic response or error

---

### 2. **Response Format Mismatch** ❌ CRITICAL
**Location:** `app/playground/page.tsx:290`

**Problem:**
- API returns: `{ ok: true, data: { assistantMessage: "..." } }`
- Playground looks for: `data.data?.assistantMessage || data.message || data.response`
- Fallback triggers: `"I'm here to help! How can I assist you today?"`

**Current Code:**
```typescript
const assistantContent = data.data?.assistantMessage || data.message || data.response || "I'm here to help! How can I assist you today?"
```

**Issue:** The fallback message is hardcoded and always shows when response format doesn't match.

---

### 3. **No Multimodal Content Generation** ❌ MAJOR
**Location:** `app/api/chat/messages/route.ts:155-190`

**Problem:**
- LLM only returns plain text
- Multimodal blocks (artifacts, quests, images) are only added:
  - Based on `generationHints.preferredBlocks` (user must explicitly request)
  - Randomly (10% chance for artifacts)
  - Keyword matching (habits → quests)
- **No LLM-driven multimodal generation**

**Current Flow:**
1. LLM returns text: `"Here's some advice..."` 
2. System adds text block: `{ type: "text", text: "..." }`
3. Only adds other blocks if hints are provided or random chance

**Missing:**
- LLM instructions to generate structured multimodal content
- Parsing LLM response for multimodal markers
- Automatic artifact/quest generation based on conversation context
- Image generation integration

---

### 4. **Demo Mode Fallback** ⚠️ MODERATE
**Location:** `lib/llm.ts:53-86`, `lib/demo.ts:4-5`

**Problem:**
- Demo mode activates when `!process.env.DATABASE_URL || !process.env.OPENAI_API_KEY`
- Returns mock responses instead of real LLM calls
- Mock responses are generic and don't reflect Sage personality

**Current Logic:**
```typescript
if (DEMO_MODE.enabled) {
  // Returns generic mock response
  return generateMockResponse(userMessage, personaName)
}
```

**Impact:** If API keys aren't configured, users get demo responses instead of real AI.

---

### 5. **No Error Handling/Logging** ⚠️ MODERATE
**Location:** `app/api/chat/messages/route.ts:167-170`, `app/playground/page.tsx:287`

**Problem:**
- Errors are caught but not logged to user
- Frontend doesn't show error messages
- Silent failures lead to fallback message

**Current Code:**
```typescript
} catch (error) {
  console.error("[chat/messages] LLM error:", error)
  assistantResponse = "I encountered an error. Please try again."
}
```

**Missing:**
- User-visible error messages
- Error state in UI
- Retry mechanisms
- API error response handling in frontend

---

### 6. **System Prompt Too Generic** ⚠️ MODERATE
**Location:** `app/api/chat/messages/route.ts:101-103`

**Problem:**
- System prompt doesn't instruct LLM to generate multimodal content
- No instructions for artifacts, quests, or structured responses
- Doesn't leverage Sage's `synopsis` or `starterConversations`

**Current Prompt:**
```typescript
`You are ${sageTemplate.name}, a ${sageTemplate.role}. ${sageTemplate.description}. Your capabilities include: ${sageTemplate.capabilities.join(", ")}. Be helpful, conversational, and true to your character.`
```

**Missing:**
- Instructions to suggest artifacts when appropriate
- Instructions to create quests for actionable advice
- Instructions to use structured formats
- Integration with Sage's synopsis for richer context

---

### 7. **No LLM Response Parsing** ❌ MAJOR
**Location:** `app/api/chat/messages/route.ts:172-189`

**Problem:**
- LLM response is treated as plain text only
- No parsing for structured content (JSON, markdown, special markers)
- No extraction of multimodal content from LLM response

**Current Code:**
```typescript
const sageBlocks: ContentBlock[] = [
  {
    id: nanoid(),
    type: "text",
    text: assistantResponse, // ❌ Just plain text
  },
]
```

**Missing:**
- Parse LLM response for structured data
- Extract artifact suggestions from text
- Detect quest opportunities
- Generate images based on LLM suggestions

---

### 8. **Chat Session Page Works, Playground Doesn't** ✅/❌
**Status:**
- `/api/chat/messages` (used by chat session page) - ✅ **WORKING**
- `/api/chat` (used by playground) - ❌ **BROKEN**

**Why:**
- Chat session page sends correct format: `{ sessionId, content, mode, generationHints, sageId }`
- Playground sends wrong format: `{ messages: [...], agentId: ... }`

---

## Summary of Gaps

### Critical Issues (Must Fix)
1. ✅ **Playground API payload mismatch** - Wrong field names (`agentId` vs `personaId`, `messages` vs `userMessage`)
2. ✅ **Response format handling** - Fallback message shows when response doesn't match expected format
3. ✅ **No multimodal generation** - LLM only returns text, multimodal blocks are conditional/random

### Major Issues (Should Fix)
4. ✅ **No LLM response parsing** - Can't extract structured content from LLM responses
5. ✅ **Generic system prompts** - Don't instruct LLM to generate multimodal content
6. ✅ **No error visibility** - Users don't see what went wrong

### Moderate Issues (Nice to Have)
7. ⚠️ **Demo mode detection** - May be active when it shouldn't be
8. ⚠️ **No retry logic** - Failed requests just show error message
9. ⚠️ **No conversation context in playground** - Doesn't maintain conversation history properly

---

## Recommended Fixes

### Priority 1: Fix Playground API Call
```typescript
// app/playground/page.tsx
body: JSON.stringify({
  personaId: selectedSage,        // ✅ Fix field name
  userMessage: input,              // ✅ Send just the new message
  conversationId: currentConversationId, // ✅ Track conversation
})
```

### Priority 2: Fix Response Handling
```typescript
// app/playground/page.tsx
if (!data.ok) {
  // Show error message
  setError(data.error || "Failed to get response")
  return
}
const assistantContent = data.data?.assistantMessage || ""
```

### Priority 3: Enhance System Prompts
```typescript
// app/api/chat/messages/route.ts
const systemPrompt = sageTemplate
  ? `You are ${sageTemplate.name}, a ${sageTemplate.role}. ${sageTemplate.synopsis || sageTemplate.description}. 
  
When appropriate, you can:
- Suggest artifacts (knowledge cards, tools, resources) by mentioning them naturally
- Create quests for actionable goals by using the format: [QUEST: title|description|goal]
- Recommend images or visualizations when helpful

Your capabilities: ${sageTemplate.capabilities.join(", ")}. Be helpful, conversational, and true to your character.`
  : "You are a helpful AI assistant."
```

### Priority 4: Parse LLM Response for Multimodal Content
```typescript
// Parse LLM response for structured content
const blocks = parseLLMResponseForMultimodal(assistantResponse, generationHints)
```

### Priority 5: Add Error Handling
```typescript
// Show errors to user
if (data.error) {
  toast.error(data.error)
  setLoading(false)
  return
}
```

---

## Files That Need Changes

1. `app/playground/page.tsx` - Fix API call format
2. `app/api/chat/route.ts` - Add better error responses
3. `app/api/chat/messages/route.ts` - Enhance system prompts, add multimodal parsing
4. `lib/llm.ts` - Add response parsing utilities
5. `app/chat/[sessionId]/page.tsx` - Add error handling UI

