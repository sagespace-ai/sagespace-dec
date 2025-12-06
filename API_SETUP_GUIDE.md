# API Setup Guide - Fix "Unable to connect to API" Error

## Problem

You're seeing: **"Unable to connect to API. Please check your network connection and API configuration."**

This happens because the **API server is not running**. The frontend needs a separate API server to handle AI features (chat, remix, etc.).

## Quick Fix (5 Minutes)

### Step 1: Navigate to API Directory

\`\`\`bash
cd api
\`\`\`

### Step 2: Install Dependencies (if not done)

\`\`\`bash
npm install
\`\`\`

### Step 3: Configure Environment Variables

Create `api/.env.local` file:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI API Keys (Required for chat/remix features - SERVER SIDE ONLY)
GEMINI_API_KEY=your-gemini-api-key

# Optional: Stripe (for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
\`\`\`

**Get these values from:**
- **Supabase**: https://app.supabase.com → Your Project → Settings → API
- **Gemini API Key**: https://makersuite.google.com/app/apikey (for AI features)

### Step 4: Start the API Server

\`\`\`bash
npm run dev
\`\`\`

The API will start on **http://localhost:3000**

You should see:
\`\`\`
✓ Ready in Xms
○ Local:        http://localhost:3000
\`\`\`

### Step 5: Configure Frontend (if needed)

Make sure your root `.env.local` has:

\`\`\`env
VITE_API_URL=http://localhost:3000/api
\`\`\`

**Important**: Restart the frontend dev server after changing `.env.local`!

## Running Both Servers

You need **TWO terminals** running:

### Terminal 1: Frontend
\`\`\`bash
# In project root
npm run dev
# Runs on http://localhost:5173
\`\`\`

### Terminal 2: API Server
\`\`\`bash
# In api/ directory
cd api
npm run dev
# Runs on http://localhost:3000
\`\`\`

## Verify It's Working

1. **Check API is running**:
   - Open http://localhost:3000/api/me in browser
   - Should see JSON response (may require auth)

2. **Test AI Chat**:
   - Go to `/sages` page
   - Try sending a message
   - Should work without "Unable to connect" error

## Common Issues

### Issue: "API server not running"

**Solution**: Start the API server in a separate terminal:
\`\`\`bash
cd api
npm run dev
\`\`\`

### Issue: "Port 3000 already in use"

**Solution**: Either:
1. Stop whatever is using port 3000
2. Or change API port in `api/package.json`:
   \`\`\`json
   "dev": "next dev -p 3001"
   \`\`\`
   Then update `.env.local`:
   \`\`\`env
   VITE_API_URL=http://localhost:3001/api
   \`\`\`

### Issue: "GEMINI_API_KEY not configured"

**Solution**: 
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `api/.env.local`:
   \`\`\`env
   GEMINI_API_KEY=your-key-here
   \`\`\`
3. Restart API server

### Issue: "CORS error" or "Network error"

**Solution**:
1. Make sure API server is running on port 3000
2. Check `VITE_API_URL` in frontend `.env.local` matches API port
3. Verify no firewall is blocking localhost connections

### Issue: "401 Unauthorized" or "Invalid token"

**Solution**:
1. Make sure you're signed in
2. Check that `auth_token` is in localStorage (browser DevTools → Application → Local Storage)
3. Verify Supabase credentials are correct in both frontend and API `.env.local` files

## Production Setup

For production (Vercel deployment):

1. **Deploy API separately**:
   - Deploy `api/` directory to Vercel
   - Get the deployment URL (e.g., `https://your-api.vercel.app`)

2. **Update Frontend Environment**:
   - In Vercel project settings → Environment Variables
   - Add: `VITE_API_URL=https://your-api.vercel.app/api`

3. **API Environment Variables** (in API Vercel project):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (server-side only, never NEXT_PUBLIC_)
   - `NEXT_PUBLIC_APP_URL` (your frontend URL)

## API Endpoints

The API provides these endpoints:

- `POST /api/chat` - Chat with AI Sage
- `POST /api/remix` - Remix content with AI
- `GET /api/me` - Get current user
- `GET /api/sages` - Get user's sages
- `POST /api/sages` - Create new sage
- `GET /api/feed` - Get feed items
- `POST /api/create` - Create feed item
- And more...

See `api/README.md` for full API documentation.

## Troubleshooting Checklist

- [ ] API server is running (`cd api && npm run dev`)
- [ ] API server shows "Ready" message
- [ ] `api/.env.local` exists with Supabase credentials
- [ ] `GEMINI_API_KEY` is set in `api/.env.local`
- [ ] Frontend `.env.local` has `VITE_API_URL=http://localhost:3000/api`
- [ ] Both servers restarted after changing `.env.local`
- [ ] No port conflicts (check `netstat -ano | findstr :3000` on Windows)
- [ ] Browser console shows API calls (check Network tab)

## Still Having Issues?

1. **Check API server logs** - Look for errors in the terminal where API is running
2. **Check browser console** - Look for network errors or CORS issues
3. **Test API directly**:
   \`\`\`bash
   curl http://localhost:3000/api/me
   \`\`\`
4. **Verify environment variables**:
   \`\`\`bash
   # In api/ directory
   node -e "console.log(process.env.GEMINI_API_KEY ? 'Set' : 'Missing')"
   \`\`\`

---

**Last Updated**: Current  
**Status**: Ready for setup
