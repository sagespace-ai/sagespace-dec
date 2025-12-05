# Prisma to Supabase Migration Guide

## Overview
The SageSpace platform has migrated from Prisma ORM to direct Supabase PostgreSQL access. This change was necessary because Prisma Client generation doesn't work reliably in the v0 preview environment.

## What Changed

### Database Client
**Before:**
\`\`\`typescript
import { prisma } from '@/lib/db'
const users = await prisma.user.findMany()
\`\`\`

**After:**
\`\`\`typescript
import { supabase } from '@/lib/db'
const { data: users } = await supabase.from('users').select('*')
\`\`\`

### Query Patterns

#### SELECT
\`\`\`typescript
// Prisma
const user = await prisma.user.findUnique({ where: { id } })

// Supabase
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', id)
  .single()
\`\`\`

#### INSERT
\`\`\`typescript
// Prisma
const user = await prisma.user.create({
  data: { email, name }
})

// Supabase
const { data: user } = await supabase
  .from('users')
  .insert({ email, name })
  .select()
  .single()
\`\`\`

#### UPDATE
\`\`\`typescript
// Prisma
const user = await prisma.user.update({
  where: { id },
  data: { credits: newCredits }
})

// Supabase
const { data: user } = await supabase
  .from('users')
  .update({ credits: newCredits })
  .eq('id', id)
  .select()
  .single()
\`\`\`

#### DELETE
\`\`\`typescript
// Prisma
await prisma.user.delete({ where: { id } })

// Supabase
await supabase.from('users').delete().eq('id', id)
\`\`\`

## Files That Need Migration

The following files still import from `@/lib/db` and need to be updated to use Supabase queries:

1. `lib/conversations.ts`
2. `lib/credits.ts`
3. `lib/monetization.ts`
4. `lib/personas.ts`
5. `lib/xp.ts`
6. `app/api/artifacts/route.ts`
7. `app/api/marketplace/agents/route.ts`
8. `app/api/referrals/route.ts`

## Table Name Conventions

Supabase uses snake_case for table names:
- `User` → `users`
- `CreditLedger` → `credit_ledger`
- `MarketplaceAgent` → `marketplace_agents`

## Benefits

1. No Prisma Client generation needed
2. Works seamlessly in v0 environment
3. Direct PostgreSQL access with type safety
4. Better integration with Supabase auth
5. Simpler deployment process

## Next Steps

Run the SQL scripts in `/scripts` to ensure the database schema matches the Supabase schema conventions.
