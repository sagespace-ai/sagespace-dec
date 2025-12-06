# API Quick Start - What I've Set Up For You

## ✅ Files Created

I've created the following configuration files:

1. **`api/.env.local`** - API server environment variables (you need to fill in 2 values)
2. **`api/.env.example`** - Template for reference
3. **Updated `.env.local`** - Fixed API URL to use port 3000

## 🔧 What You Need To Do

### Step 1: Get Your Supabase Service Role Key

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Find **"service_role" key** (NOT the anon key)
5. Copy it

### Step 2: Get Your Gemini API Key (for AI features)

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy the key

### Step 3: Update `api/.env.local`

Open `api/.env.local` and replace these two lines:

\`\`\`env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
\`\`\`

With your actual keys:
\`\`\`env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
GEMINI_API_KEY=AIzaSy... (your actual key)
\`\`\`

### Step 4: Install API Dependencies

\`\`\`bash
cd api
npm install

# Install Gemini AI package (required for chat/remix)
npm install @google/genai
\`\`\`

### Step 5: Start the API Server

\`\`\`bash
cd api
npm run dev
\`\`\`

You should see:
\`\`\`
✓ Ready in Xms
○ Local:        http://localhost:3000
\`\`\`

## 🚀 Running Everything

You need **TWO terminals**:

**Terminal 1 - Frontend:**
\`\`\`bash
npm run dev
# Runs on http://localhost:5173
\`\`\`

**Terminal 2 - API:**
\`\`\`bash
cd api
npm run dev
# Runs on http://localhost:3000
\`\`\`

## ✅ Verify It's Working

1. **Check API is running**: Open http://localhost:3000/api/me in browser
   - Should see JSON (may require auth)

2. **Test AI Chat**: 
   - Go to `/sages` page
   - Try sending a message
   - Should work without "Unable to connect" error

## 📝 What's Already Configured

✅ Supabase URL and Anon Key (from your existing config)  
✅ API URL set to `http://localhost:3000/api`  
✅ Environment file structure created  
✅ All necessary variables defined  

## ⚠️ Important Notes

- **Service Role Key**: This is sensitive! Never commit it to git (it's already in `.gitignore`)
- **Gemini API Key**: Required for AI features. Without it, chat/remix will fail
- **Port 3000**: Make sure nothing else is using port 3000, or change it in `api/package.json`

## 🐛 Troubleshooting

### "Port 3000 already in use"
Change the port in `api/package.json`:
\`\`\`json
"dev": "next dev -p 3001"
\`\`\`
Then update `.env.local`:
\`\`\`env
VITE_API_URL=http://localhost:3001/api
\`\`\`

### "GEMINI_API_KEY not configured"
Make sure you:
1. Got the key from https://makersuite.google.com/app/apikey
2. Added it to `api/.env.local`
3. Restarted the API server

### Still getting "Unable to connect"
1. Check API server is running (Terminal 2)
2. Check `VITE_API_URL` in root `.env.local` matches API port
3. Restart both frontend and API servers

---

**You're all set!** Just fill in those 2 API keys and start the servers. 🎉
