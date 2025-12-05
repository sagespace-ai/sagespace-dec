# SageSpace Demo Mode Guide

## Overview

SageSpace can run in "demo mode" without any external API keys or database connections. This allows you to explore the application's UI and functionality using mock data.

## How Demo Mode Works

When environment variables for external services are missing, SageSpace automatically falls back to demo mode:

- **No DATABASE_URL**: Uses in-memory data stores for conversations, personas, and user data
- **No AI API Keys**: Returns mock AI responses that simulate real chat interactions
- **No Redis**: Rate limiting is bypassed (unlimited requests in demo)
- **No Stripe**: Monetization features are hidden
- **No Storage**: Artifacts use inline data URIs instead of cloud storage

## Running in Demo Mode

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/sagespace-ai/sagespace.git
   cd sagespace
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

**That's it!** No environment variables needed.

## Demo Mode Limitations

- **Data not persisted**: All conversations and user data reset when the server restarts
- **Mock AI responses**: AI replies are canned responses, not real AI generations
- **No authentication**: You're automatically logged in as a demo user
- **No file uploads**: Artifact generation is simulated with placeholder content
- **No real-time features**: Websocket-based features are disabled

## Enabling Full Features

To enable production features, create a `.env` file with the required variables. See `.env.example` for details.

## Support

For questions about demo mode or setup, see:
- `SETUP.md` - Full setup guide
- `BACKEND_SETUP.md` - Service configuration details
- `ARCHITECTURE.md` - System design overview
