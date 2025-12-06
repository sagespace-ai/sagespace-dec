# Supabase Setup Guide

## Quick Fix for "Supabase not configured" Error

The authentication error occurs because Supabase environment variables are not configured. Follow these steps:

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon/public key** → This is your `VITE_SUPABASE_ANON_KEY`

## Step 2: Configure Environment Variables

### Option A: Local Development (Recommended)

1. Open the `.env.local` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:

\`\`\`env
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
VITE_API_URL=http://localhost:3001/api
\`\`\`

3. **Restart your development server** after making changes:
   \`\`\`bash
   # Stop the server (Ctrl+C)
   npm run dev
   \`\`\`

### Option B: Production/Deployment (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `VITE_API_URL` = Your API URL (e.g., `https://your-api.vercel.app/api`)

4. **Redeploy** your application

## Step 3: Verify Configuration

After setting up the environment variables:

1. Check the browser console - you should NOT see the warning:
   \`\`\`
   Supabase environment variables not set. Some features may not work.
   \`\`\`

2. Try signing in - the "Supabase not configured" error should be gone

## Troubleshooting

### Still seeing the error?

1. **Verify file location**: `.env.local` should be in the project root (same level as `package.json`), NOT in `src/`

2. **Check variable names**: They must start with `VITE_` for Vite to expose them to the frontend

3. **Restart dev server**: Environment variables are only loaded when the server starts

4. **Check for typos**: Make sure there are no extra spaces or quotes around the values

### Need to create a Supabase project?

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Sign in
3. Click "New Project"
4. Fill in project details
5. Wait for project to be created (~2 minutes)
6. Go to Settings → API to get your credentials

## Database Setup

After configuring authentication, you'll also need to set up the database:

1. Go to your Supabase project → SQL Editor
2. Run the migrations in order:
   - `supabase/migrations/001_add_conversations.sql`
   - `supabase/migrations/002_add_purchases.sql`
   - `supabase/migrations/003_add_collections_and_tags.sql`
   - `supabase/migrations/004_add_social_graph.sql`
   - `supabase/migrations/005_add_notifications.sql`
   - `supabase/migrations/006_add_teams_and_organizations.sql`
   - `supabase/migrations/007_add_admin_and_audit.sql`
   - `supabase/migrations/008_add_webhooks.sql`

See `DEVELOPMENT.md` for more details.
