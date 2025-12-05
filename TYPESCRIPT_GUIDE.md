# TypeScript Best Practices for SageSpace

This guide ensures type safety and prevents build errors.

## Type Definitions

All shared types are defined in `types/index.ts`. Import types from here rather than defining inline.

### Common Patterns

#### 1. Prisma JSON Fields
\`\`\`typescript
import type { CreditMeta } from "@/types"

function logCredit(meta?: CreditMeta) {
  // meta is properly typed
}
\`\`\`

#### 2. Error Handling
\`\`\`typescript
try {
  // ... code
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error"
  console.error("[context]", errorMessage)
}
\`\`\`

#### 3. API Parameters
\`\`\`typescript
import type { ChatMessage } from "@/types"

function processMessages(messages: ChatMessage[]) {
  // messages have proper OpenAI types
}
\`\`\`

## Avoiding `any`

### Before
\`\`\`typescript
const where: any = {}
\`\`\`

### After
\`\`\`typescript
import type { MarketplaceWhereInput } from "@/types"
const where: MarketplaceWhereInput = {}
\`\`\`

## Build Checks

Run type checking before committing:
\`\`\`bash
npm run type-check
\`\`\`

The build process runs `type-check` automatically via the `prebuild` script.
