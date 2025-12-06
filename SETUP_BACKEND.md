# Quick Backend Setup Guide

## ✅ What's Been Created

### Database (Supabase)
- ✅ Complete schema with RLS policies
- ✅ Tables: users, sages, feed_items, feed_interactions, sessions
- ✅ Indexes for performance
- ✅ Triggers for updated_at timestamps

### API (Next.js)
- ✅ GET /api/me - Get user profile
- ✅ PATCH /api/me - Update user profile
- ✅ GET /api/sages - Get user's sages
- ✅ POST /api/sages - Create sage
- ✅ GET /api/feed - Get feed with pagination
- ✅ POST /api/feed/interactions - Create interaction
- ✅ POST /api/create - Create feed item

### Frontend Integration
- ✅ Updated API service with auth token support
- ✅ Updated type definitions
- ✅ Ready to consume API endpoints

## 🚀 Quick Start (5 Minutes)

### Step 1: Set Up Supabase (2 min)

1. **Create Project**: https://supabase.com
2. **Run Schema**:
   - Open SQL Editor in Supabase Dashboard
   - Copy `supabase/schema.sql`
   - Paste and click "Run"
3. **Get Keys**:
   - Settings > API
   - Copy: URL, anon key, service_role key

### Step 2: Set Up API (2 min)

\`\`\`bash
# Navigate to API directory
cd api

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
# SUPABASE_SERVICE_ROLE_KEY=xxx

# Start API server
npm run dev
\`\`\`

API will run on `http://localhost:3000`

### Step 3: Update Frontend (1 min)

\`\`\`bash
# In root directory, create .env
echo "VITE_API_URL=http://localhost:3000/api" > .env
\`\`\`

## 🧪 Test It

### Test Database
\`\`\`sql
-- In Supabase SQL Editor
SELECT * FROM public.users;
SELECT * FROM public.sages;
\`\`\`

### Test API
\`\`\`bash
# Get user (requires auth token)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/me

# Get sages
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/sages
\`\`\`

### Test Frontend
\`\`\`typescript
import { apiService } from '@/services/api'

// Set auth token (from Supabase Auth)
localStorage.setItem('auth_token', 'your-token')

// Use API
const { data } = await apiService.getMe()
const { data: sages } = await apiService.getSages()
const { data: feed } = await apiService.getFeed()
\`\`\`

## 📁 File Structure

\`\`\`
.
├── supabase/
│   ├── schema.sql          # Database schema
│   └── README.md           # Supabase setup guide
├── api/
│   ├── pages/api/          # API routes
│   │   ├── me.ts
│   │   ├── sages.ts
│   │   ├── feed.ts
│   │   ├── feed/interactions.ts
│   │   └── create.ts
│   ├── lib/
│   │   ├── supabase.ts     # Supabase clients
│   │   └── types.ts        # API types
│   ├── package.json
│   └── .env.example
└── src/
    ├── services/
    │   └── api.ts          # Updated API service
    └── types/
        └── index.ts         # Updated types
\`\`\`

## 🔐 Authentication

The API uses Bearer token authentication:

1. User logs in via Supabase Auth
2. Get access token from Supabase
3. Store in localStorage: `localStorage.setItem('auth_token', token)`
4. API service automatically includes it in requests

## 🎯 Next Steps

1. **Integrate Supabase Auth** in frontend
2. **Add real-time subscriptions** for live updates
3. **Add file uploads** using Supabase Storage
4. **Add search and filtering** capabilities

## 📚 Documentation

- `BACKEND_INTEGRATION.md` - Complete integration guide
- `supabase/README.md` - Database setup
- `api/README.md` - API documentation

## ⚠️ Important Notes

- **Service Role Key**: Keep secret! Only use server-side
- **RLS**: All tables have Row Level Security enabled
- **CORS**: Configured in `api/next.config.js`
- **Types**: Shared between frontend and backend

## 🆘 Troubleshooting

**401 Unauthorized**: Check auth token is set and valid
**500 Error**: Check Supabase credentials in `.env.local`
**CORS Error**: Verify API URL matches frontend config

---

**Ready to go!** 🚀
