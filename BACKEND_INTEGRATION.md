# Backend Integration Guide

## Overview

This document describes the backend integration for SageSpace, including Supabase database setup and Next.js API routes.

## Architecture

\`\`\`
Frontend (Vite + React)
    ↓
API Service (src/services/api.ts)
    ↓
Next.js API Routes (api/pages/api/*)
    ↓
Supabase (Database + Auth)
\`\`\`

## Phase 1: Database Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and API keys

### 2. Run Database Schema

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste contents of `supabase/schema.sql`
4. Click "Run"

This creates:
- `users` table (profile extension)
- `sages` table
- `feed_items` table
- `feed_interactions` table
- `sessions` table (optional)
- RLS policies for all tables
- Indexes for performance

### 3. Get Service Role Key

1. Go to Settings > API
2. Copy the `service_role` key
3. Keep this secret! (Only for server-side use)

## Phase 2: API Setup

### 1. Install API Dependencies

\`\`\`bash
cd api
npm install
\`\`\`

### 2. Configure Environment

Create `api/.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

### 3. Start API Server

\`\`\`bash
npm run dev
\`\`\`

API will be available at `http://localhost:3000/api`

## Phase 3: Frontend Integration

### 1. Update Frontend Environment

Create `.env` in the root directory:

\`\`\`env
VITE_API_URL=http://localhost:3000/api
\`\`\`

### 2. Authentication Setup

The API service expects an auth token in localStorage:

\`\`\`typescript
// When user logs in
localStorage.setItem('auth_token', token)

// API service automatically includes it in requests
\`\`\`

### 3. Use API Service

The frontend `src/services/api.ts` is already configured to use the new endpoints:

\`\`\`typescript
import { apiService } from '@/services/api'

// Get current user
const { data, error } = await apiService.getMe()

// Get sages
const { data: sages } = await apiService.getSages()

// Get feed with pagination
const { data: feed } = await apiService.getFeed(cursor, 20)

// Create feed item
await apiService.createCreation({
  title: 'My Creation',
  type: 'image',
  description: '...'
})
\`\`\`

## API Endpoints

### User Endpoints

- `GET /api/me` - Get current user
- `PATCH /api/me` - Update current user

### Sage Endpoints

- `GET /api/sages` - Get user's sages
- `POST /api/sages` - Create new sage

### Feed Endpoints

- `GET /api/feed?cursor=&limit=20` - Get feed items (paginated)
- `POST /api/feed/interactions` - Create interaction
- `POST /api/create` - Create feed item

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only see their own data
- Users can only modify their own data
- All queries are scoped to `auth.uid()`

## Testing

### Test Database

\`\`\`sql
-- In Supabase SQL Editor
SELECT * FROM public.users;
SELECT * FROM public.sages;
SELECT * FROM public.feed_items;
\`\`\`

### Test API

\`\`\`bash
# Get user profile
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/me

# Get sages
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/sages

# Get feed
curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/feed?limit=10"
\`\`\`

## Troubleshooting

### API Returns 401 Unauthorized

- Check that auth token is set in localStorage
- Verify token is included in Authorization header
- Check token is valid in Supabase

### Database Queries Fail

- Verify RLS policies are enabled
- Check user_id matches auth.uid()
- Verify service role key is correct

### CORS Errors

- Check Next.js CORS configuration in `next.config.js`
- Verify API URL matches frontend configuration

## Next Steps

1. **Authentication**: Integrate Supabase Auth in frontend
2. **Real-time**: Add Supabase Realtime subscriptions
3. **Storage**: Add Supabase Storage for file uploads
4. **Advanced Features**: Add search, filtering, etc.

## Files Created

- `supabase/schema.sql` - Database schema
- `api/` - Next.js API routes
- `api/lib/supabase.ts` - Supabase client configuration
- `api/lib/types.ts` - API type definitions
- Updated `src/services/api.ts` - Frontend API service
- Updated `src/types/index.ts` - Type definitions
