# Supabase Database Setup

## Quick Start

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **Run the Schema**
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `schema.sql`
   - Click "Run"

3. **Get Your Service Role Key**
   - Go to Settings > API
   - Copy the `service_role` key (keep this secret!)
   - This is needed for the Next.js API routes

## Environment Variables

Add these to your `.env.local` file:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

## Database Tables

### `users`
- Profile extension of `auth.users`
- RLS enabled: Users can only see/update their own profile

### `sages`
- AI companions for each user
- RLS enabled: Users can only manage their own sages

### `feed_items`
- Content items in the feed
- RLS enabled: Users can only see their own items
- Indexed for cursor-based pagination

### `feed_interactions`
- Likes, comments, shares, remixes
- RLS enabled: Users can only see their own interactions

### `sessions` (Optional)
- User session tracking
- RLS enabled: Users can only see their own sessions

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only SELECT their own rows
- Users can only INSERT rows with their own `user_id`
- Users can only UPDATE their own rows
- Users can only DELETE their own rows

## Testing RLS

You can test RLS policies in the Supabase SQL Editor:

\`\`\`sql
-- This should only return the current user's data
SELECT * FROM public.users;
SELECT * FROM public.sages;
SELECT * FROM public.feed_items;
\`\`\`
