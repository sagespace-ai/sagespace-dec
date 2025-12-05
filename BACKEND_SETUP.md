# SageSpace Backend Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database (Neon recommended)
3. OAuth credentials (GitHub/Google)
4. Optional: Redis (Upstash), R2 storage (Cloudflare)

## Setup Steps

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
- `GITHUB_ID` & `GITHUB_SECRET`: From GitHub OAuth app
- `GOOGLE_ID` & `GOOGLE_SECRET`: From Google Cloud Console
- `OPENAI_API_KEY` or `OPENROUTER_API_KEY`: For AI features

Optional variables:
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: For rate limiting
- R2 credentials: For file storage

### 3. Setup Database

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
\`\`\`

### 4. Setup OAuth

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth app
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

#### Google OAuth
1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Credits & XP
- `GET /api/credits` - Get user credit balance
- `POST /api/credits/debit` - Debit credits
- `GET /api/xp` - Get user XP and level
- `POST /api/xp/award` - Award XP

### Chat & Council
- `POST /api/chat` - Single sage conversation
- `POST /api/council` - Multi-sage deliberation
- `GET /api/conversations` - List all conversations
- `GET /api/conversations/[id]` - Get conversation details
- `DELETE /api/conversations/[id]` - Delete conversation

### Personas & Artifacts
- `GET /api/personas` - List all personas
- `POST /api/personas` - Create custom persona
- `PATCH /api/personas/[id]` - Update persona
- `DELETE /api/personas/[id]` - Delete persona
- `GET /api/artifacts` - List artifacts for conversation
- `POST /api/artifacts` - Create artifact

### Observability
- `POST /api/observability/events` - Log telemetry events

## Rate Limits

Without Redis:
- No rate limiting (all requests allowed)

With Redis:
- Global: 60 requests/minute per IP
- Chat: 15 requests/minute per user
- Council: 3 requests/minute per user

## Credit System

- New users start with 200 credits
- ~750 tokens = 1 credit
- Chat turn costs based on token usage
- Council costs vary by number of sages and rounds

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Database will automatically work with Neon or any PostgreSQL provider.

### Other Platforms

Ensure environment variables are set and build with:

\`\`\`bash
npm run build
npm start
\`\`\`

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database is accessible from your network
- Run `npx prisma db push` to sync schema

### OAuth Not Working
- Verify callback URLs match exactly
- Check OAuth credentials are correct
- Ensure `NEXTAUTH_URL` matches your domain

### Rate Limiting Errors
- Check Redis connection
- Verify Upstash credentials
- Rate limiting gracefully degrades if Redis is unavailable

## Next Steps

1. Customize sage templates in `lib/sage-templates.ts`
2. Add custom branding
3. Configure feature flags
4. Set up Sentry and PostHog for observability
5. Configure R2 storage for file uploads
