# Fusion Orchestrator Integration Guide

## Overview

The codebase should integrate with a **Fusion Orchestrator** exposed via MCP (Model Context Protocol) as `fusion`. This orchestrator provides multi-model, multi-tool reasoning capabilities.

## Fusion MCP Tools

### 1. `fusion.query`
**Purpose:** General-purpose, multi-model, multi-tool reasoning.

**Input:**
- `task`: natural-language description of what the user wants
- Optional `mode`: `"code" | "design" | "analysis" | "creative"`
- Optional `models`: explicit model list to query
- Optional `needComparisons`: boolean to request per-model answers

**Output:**
- `best`: { model, reasoning, answer }
- `alternatives?`: [{ model, answer }]
- `metadata?`: anything useful (timings, used tools, etc.)

### 2. `fusion.compare`
**Purpose:** Explicit model comparison (e.g., "ask multiple models and show differences").

**Input:**
- `task`: question or instruction to compare

### 3. `fusion.workflow`
**Purpose:** Run a named workflow/graph (LangGraph/LangChain) that may:
- call tools
- query vector stores
- orchestrate multi-step agentic flows

**Input:**
- `workflowName`: string
- `input`: arbitrary JSON payload

## Integration Points

### Current LLM Integration
- **File:** `lib/llm.ts` - Direct OpenAI/OpenRouter calls
- **File:** `lib/llm-structured.ts` - Function calling for agentic creation
- **File:** `app/api/chat/route.ts` - Chat API using direct LLM calls

### Where Fusion Should Be Used

1. **Complex Reasoning Tasks**
   - Multi-step problem solving
   - Architecture decisions
   - Code reviews
   - Design audits

2. **Multi-Model Comparison**
   - When user explicitly asks for "multiple perspectives"
   - When comparing different approaches
   - When quality/consensus is critical

3. **Agentic Workflows**
   - Named workflows (e.g., `"code_review_pipeline"`, `"rag_qa"`, `"design_audit"`)
   - Multi-step agentic flows
   - Tool orchestration

## Implementation Guidelines

### When to Use Fusion

**Use `fusion.query` when:**
- Task is non-trivial or involves multiple steps
- Could benefit from multi-model judgment
- User asks for "multiple perspectives" or "compare models"
- Set `mode` appropriately:
  - `code` for implementation/debugging/architecture
  - `design` for UX/UI, product thinking, visual systems
  - `analysis` for deep reasoning, tradeoffs, or audits
  - `creative` for content, storytelling, brand voice

**Use `fusion.workflow` when:**
- Task maps to a named graph/pipeline
- References exist in repo to specific workflow names
- Multi-step agentic flow is needed

**Do NOT:**
- Manually re-implement model fan-out logic
- Create one-off integrations when Fusion exposes the capability
- Duplicate orchestration logic in UI/backend

### Output Handling

When receiving `FusionQueryOutput`:
- Respect `best` field as primary answer
- Show `alternatives` in concise, well-organized way (comparison table, bullet-list by model)
- Use `metadata` to enrich explanations when relevant (timings, tools used)

## Integration Pattern

### Example: Replace Direct LLM Call with Fusion

**Before (Current):**
```typescript
// lib/llm.ts
const response = await client.chat.completions.create({
  model: options.model || getLLMModel(),
  messages,
  // ...
})
```

**After (With Fusion):**
```typescript
// lib/llm-fusion.ts
import { mcp_cursor_fusion_query } from "@/mcp/fusion"

export async function generateChatCompletionWithFusion(
  messages: ChatMessage[],
  options: {
    mode?: "code" | "design" | "analysis" | "creative"
    needComparisons?: boolean
  } = {}
) {
  const task = messages
    .filter(m => m.role === "user")
    .map(m => m.content)
    .join("\n")
  
  const result = await mcp_cursor_fusion_query({
    task,
    mode: options.mode,
    needComparisons: options.needComparisons,
  })
  
  return {
    best: result.best,
    alternatives: result.alternatives,
    metadata: result.metadata,
  }
}
```

## Behavioral Priorities

1. **Single channel, many tools**: Treat Fusion MCP as primary interface to multiple providers
2. **Multiple results in one place**: Return clear recommendation (`best`) + alternatives
3. **Tool-centric mindset**: Before heavy reasoning, ask "Can Fusion help?"

## Code Quality

- Keep Fusion integration thin and well-typed
- Avoid duplicating orchestration logic
- Prefer small functions that call Fusion tools with clear input/output typings

## Status

**Current:** Not yet integrated. System uses direct OpenAI/OpenRouter calls.

**Future:** When Fusion MCP is available, migrate complex reasoning tasks to use `fusion.query` and `fusion.workflow` instead of direct LLM calls.

