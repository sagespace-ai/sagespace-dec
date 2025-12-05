# SageSpace Architecture

## System Overview

SageSpace is a Next.js 16 application using the App Router with server-side rendering (SSR) and edge functions. The architecture prioritizes **low cost**, **compliance**, and **delightful UX**.

## Data Flow

\`\`\`
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│          Next.js App Router (SSR)           │
│  ┌───────────┐  ┌──────────┐  ┌─────────┐  │
│  │   Pages   │  │   API    │  │  Edge   │  │
│  │ Components│  │  Routes  │  │Functions│  │
│  └───────────┘  └──────────┘  └─────────┘  │
└──────┬─────────────────┬────────────────────┘
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│  Supabase   │   │ AI Providers │
│  Database   │   │  (Groq, etc) │
│  + Storage  │   └──────────────┘
│  + Auth     │
└─────────────┘
\`\`\`

## Key Architectural Decisions

### 1. Next.js 16 App Router
- **Server Components** for initial page loads (faster TTI)
- **Client Components** for interactivity (animations, real-time)
- **Server Actions** for mutations (create sage, post artifact)
- **Edge Middleware** for auth and access gates

### 2. Supabase as Backend
- **Postgres**: All structured data (users, sages, artifacts, threads)
- **Row Level Security**: Permissions enforced at DB level
- **Storage**: Artifact media files (audio, images, videos)
- **Auth**: Email/password, OAuth (Google, GitHub)
- **Realtime**: Live updates for feeds and chat (optional)

### 3. AI Provider Abstraction
- Pluggable model providers via config
- Fallback chain: Groq → OpenAI → Claude
- Request/response logging for audit trails
- Token counting and cost tracking per request

### 4. Cost Guardrails

#### Rate Limiting
\`\`\`typescript
// lib/rate-limit.ts
export async function checkRateLimit(
  userId: string,
  action: 'artifact' | 'thread' | 'message',
  plan: Plan
): Promise<{ allowed: boolean; remaining: number }>
\`\`\`

Implemented via:
- Redis cache (Vercel KV) for counters
- Sliding window algorithm
- Per-plan limits from `lib/config/features.ts`

#### Budget Enforcement
\`\`\`typescript
// lib/budget.ts
export async function checkBudget(
  userId: string,
  costCredits: number
): Promise<{ allowed: boolean; balance: number }>
\`\`\`

- Deduct credits before generation
- Refund on failure
- Hard stop when balance = 0

#### Caching Strategy
\`\`\`typescript
// Cache key: sage_id + prompt_hash + modality
const cacheKey = `${sageId}:${hashPrompt(prompt)}:${type}`
const cached = await kv.get(cacheKey)
if (cached) return cached

// Generate new
const result = await generateArtifact(...)
await kv.set(cacheKey, result, { ex: 3600 }) // 1 hour
\`\`\`

### 5. Safety Pipeline

Every artifact goes through:

1. **PII Filtering** (pre-generation)
   \`\`\`typescript
   const filtered = redactPII(userPrompt)
   \`\`\`

2. **Generation** with provenance
   \`\`\`typescript
   const artifact = await generate({
     prompt: filtered,
     traceId: uuid(),
     model: config.model,
   })
   \`\`\`

3. **Watermarking** (post-generation)
   \`\`\`typescript
   if (type === 'image' || type === 'video') {
     await addWatermark(artifact.contentUrl)
   }
   \`\`\`

4. **Citation Extraction** (for text)
   \`\`\`typescript
   const citations = extractCitations(artifact.content)
   if (citations.length === 0 && containsFactualClaims(artifact.content)) {
     artifact.contentWarnings.push('Missing citations')
   }
   \`\`\`

5. **Audit Logging**
   \`\`\`typescript
   await logAudit({
     userId,
     sageId,
     artifactId,
     traceId,
     promptHash,
     model,
     inputTokens,
     outputTokens,
     costCents,
     redactions,
     citations,
   })
   \`\`\`

### 6. Database Schema

See `scripts/001-create-core-schema.sql` for full schema.

**Core Tables:**
- `users`: Profiles, plans, credits, XP, streaks
- `sages`: AI personas with capabilities and config
- `artifacts`: Generated content with provenance
- `threads`: Conversations (chat, circle, debate)
- `messages`: Individual messages in threads
- `events`: Engagement tracking (likes, shares, remixes)
- `audit_logs`: Compliance trail for every generation

**Indexes:**
- `idx_artifacts_sage_id`: Fast sage → artifacts lookup
- `idx_artifacts_created_at`: Recent artifacts feed
- `idx_events_actor_id`: User activity timeline
- `idx_audit_logs_created_at`: Compliance queries

### 7. API Routes

#### POST /api/chat
Handles 1:1 sage conversations
\`\`\`typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { threadId, sageId, message } = await req.json()
  
  // 1. Check rate limit
  // 2. Check budget
  // 3. Save user message
  // 4. Generate sage response (Groq/OpenAI)
  // 5. Save sage message
  // 6. Award XP
  // 7. Log audit trail
  
  return Response.json({ message, xpEarned })
}
\`\`\`

#### POST /api/artifacts/create
Generates artifacts (text, audio, image, video)
\`\`\`typescript
// app/api/artifacts/create/route.ts
export async function POST(req: Request) {
  const { sageId, type, prompt } = await req.json()
  
  // 1. Validate user + plan
  // 2. Check rate limit + budget
  // 3. Deduct credits
  // 4. Run safety pipeline
  // 5. Generate artifact
  // 6. Upload to storage (if media)
  // 7. Save to DB with provenance
  // 8. Award XP
  
  return Response.json({ artifact })
}
\`\`\`

#### GET /api/feed
Returns public artifacts feed with pagination
\`\`\`typescript
// app/api/feed/route.ts
export async function GET(req: Request) {
  const { page, filter, mood } = getSearchParams(req.url)
  
  const artifacts = await supabase
    .from('artifacts')
    .select('*, sage:sages(*), creator:users(*)')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .range(page * 20, (page + 1) * 20 - 1)
  
  return Response.json({ artifacts })
}
\`\`\`

### 8. Background Jobs

For expensive operations (video generation, aggregations):

\`\`\`typescript
// supabase/functions/process-video/index.ts
Deno.serve(async (req) => {
  const { artifactId } = await req.json()
  
  // 1. Fetch artifact from DB
  // 2. Generate video (queue to Runway/Pika)
  // 3. Poll for completion
  // 4. Download and watermark
  // 5. Upload to Supabase Storage
  // 6. Update artifact record
  // 7. Notify user
  
  return new Response('OK')
})
\`\`\`

Triggered via:
- Supabase cron jobs
- Webhook from generation provider
- User polling (if urgent)

### 9. Observability

#### Event Stream
\`\`\`typescript
// lib/analytics.ts
export function trackEvent(
  userId: string,
  eventType: string,
  metadata: Record<string, any>
) {
  // Log to Vercel Analytics
  // Save to events table
  // Optionally push to external analytics (Mixpanel, Amplitude)
}
\`\`\`

#### Feature Flags
\`\`\`typescript
// lib/config/features.ts
export const FEATURE_FLAGS = {
  TEXT_GENERATION: true,
  AUDIO_GENERATION: process.env.ENABLE_AUDIO_GEN === 'true',
  // ...
}

// Usage:
if (FEATURE_FLAGS.AUDIO_GENERATION) {
  // Show audio artifact UI
}
\`\`\`

#### Kill Switch
Admin dashboard to disable features instantly:
\`\`\`typescript
// Admin only: POST /api/admin/feature-flags
export async function POST(req: Request) {
  const { flag, enabled } = await req.json()
  await supabase.from('feature_flags').upsert({ flag, enabled })
  revalidatePath('/') // Clear cache
}
\`\`\`

### 10. Deployment

#### Vercel Configuration
\`\`\`json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/chat",
      "destination": "/api/chat"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
\`\`\`

#### Environment Variables
Managed in Vercel dashboard:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `STRIPE_SECRET_KEY` (if monetization enabled)
- `ENABLE_*` feature flags

## Performance Targets

- **TTI**: < 3.5s on 4G mobile
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **FID**: < 100ms

Optimizations:
- Server Components for static content
- Image optimization via Next.js `<Image>`
- Code splitting per page
- Lazy load modals and heavy components
- CDN caching for public artifacts

## Security

- **RLS**: Every table has RLS policies
- **HTTPS**: Enforced via Vercel
- **CORS**: Restricted to app domain
- **Rate Limiting**: Per-user and per-IP
- **Input Validation**: Zod schemas on API routes
- **SQL Injection**: Prevented by Supabase client (parameterized queries)

## Disaster Recovery

- **Database Backups**: Supabase daily automated backups
- **Point-in-Time Recovery**: Available in Supabase Pro
- **Artifact Storage**: Replicated across regions
- **Rollback**: Git + Vercel deployment history

---

For questions, see README.md or contact the team.
