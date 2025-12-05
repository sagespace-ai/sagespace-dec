# API Routes Migration Guide

All API routes have been updated to use **Supabase authentication** instead of NextAuth.

## Migration Pattern

### Old Pattern (NextAuth)
\`\`\`typescript
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const userId = session.user.id
  // ... rest of code
}
\`\`\`

### New Pattern (Supabase)
\`\`\`typescript
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const userId = user.id
  // ... rest of code
}
\`\`\`

## Updated API Routes

The following routes have been updated with the new auth pattern:
- ✅ `/api/chat`
- ✅ `/api/conversations`
- ✅ `/api/personas`
- ✅ `/api/credits`
- ✅ `/api/xp`

## Routes Still Needing Updates

These routes still need to be migrated from NextAuth to Supabase:
- ⚠️ `/api/artifacts`
- ⚠️ `/api/conversations/[id]`
- ⚠️ `/api/council`
- ⚠️ `/api/credits/debit`
- ⚠️ `/api/observability/events`
- ⚠️ `/api/personas/[id]`
- ⚠️ `/api/xp/award`

## Migration Steps

For each remaining API route:

1. **Remove NextAuth imports:**
   \`\`\`typescript
   // Remove these
   import { authOptions } from "@/lib/auth"
   import { getServerSession } from "next-auth"
   \`\`\`

2. **Add Supabase import:**
   \`\`\`typescript
   import { createClient } from "@/lib/supabase/server"
   \`\`\`

3. **Replace session check:**
   \`\`\`typescript
   // Old
   const session = await getServerSession(authOptions)
   if (!session?.user) return unauthorized
   const userId = session.user.id
   
   // New
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) return unauthorized
   const userId = user.id
   \`\`\`

4. **Use Supabase for queries:**
   \`\`\`typescript
   // Queries automatically filtered by RLS
   const { data } = await supabase
     .from('table_name')
     .select('*')
     .eq('user_id', user.id)
   \`\`\`

## Benefits

- ✅ Automatic RLS filtering
- ✅ No separate session management
- ✅ Single source of truth (Supabase)
- ✅ Better security with httpOnly cookies
- ✅ Simpler code with less boilerplate
\`\`\`
