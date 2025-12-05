# SageSpace Setup Guide

## Quick Start

### 1. Initialize the Database

Run the SQL initialization script in your Supabase project:

**From v0:**
1. Open the Scripts panel (bottom of the screen)
2. Find `scripts/000-initialize-database.sql`
3. Click "Run Script"
4. Wait for confirmation

**From Supabase Dashboard:**
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `scripts/000-initialize-database.sql`
4. Run the script

This will:
- Create all necessary tables (agents, conversations, messages)
- Enable Row Level Security with anonymous access for demo mode
- Insert 5 demo agents

### 2. Configure AI Provider (Optional)

Add at least ONE of these environment variables in Vercel:

- `API_KEY_GROQ_API_KEY` - Groq (recommended, free tier available)
- `OPENAI_API_KEY` - OpenAI
- `ANTHROPIC_API_KEY` - Anthropic

**In Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add your chosen API key
4. Redeploy

### 3. Password Protection (Optional)

To lock the site from public view:

1. Add these environment variables in Vercel:
   - `ENABLE_ACCESS_GATE=true`
   - `SITE_ACCESS_PASSWORD=your-secure-password`
2. Redeploy
3. Site will now require password at `/access-gate`

### 4. Deploy

Push to GitHub and Vercel will automatically deploy!

## Features Ready to Use

- **Marketing Landing Page** - `/`
- **Demo Hub** - `/demo`
- **Playground** - `/playground`
- **Sage Watch** - `/observatory`
- **Council Voting** - `/council`
- **Memory Dashboard** - `/memory`
- **Auth System** - `/auth/login` and `/auth/signup`

## Next Steps

1. Customize the Five Laws in your agent prompts
2. Add more agents through the Observatory
3. Create custom agent templates
4. Build out the Multiverse conversations
5. Implement advanced features (agent collaboration, learning, etc.)

## Support

Questions? Check the README.md or open an issue on GitHub.
