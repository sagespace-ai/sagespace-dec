# SageSpace Platform

A comprehensive content creation and social platform with AI-powered features, marketplace, and enterprise capabilities.

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and configure:
cp .env.example .env
# Required: VITE_XAI_API_KEY (for AI chat with Sages)
# Optional: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (for data persistence)

# Run development server
npm run dev
\`\`\`

## 🤖 AI Chat Configuration

The Sage chat feature uses **Grok (xAI)** for real-time AI conversations.

**Required Environment Variable:**
- `VITE_XAI_API_KEY` - Get your API key from [console.x.ai](https://console.x.ai)

Add this to your `.env` file or set it in the Vercel project settings under the **Vars** tab.

**Without this key, the Sage chat will show an error message.**

## 📋 Production Readiness

**Status**: 95% Production Ready ✅

See [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) for:
- Testing strategy and commands
- Monitoring configuration
- CI/CD pipeline
- Backup & disaster recovery
- Load testing

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# API tests
npm run test:api

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
\`\`\`

## 📊 Monitoring

Error tracking via Sentry (configured in `src/lib/monitoring.ts` and `api/lib/monitoring.ts`).

Set environment variables:
- `VITE_SENTRY_DSN` (frontend)
- `SENTRY_DSN` (backend)

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Next.js API Routes (in `/api` directory) - *Optional for data persistence*
- **AI**: Grok (xAI) for Sage chat conversations
- **Database**: Supabase (PostgreSQL) - *Optional for persistence*
- **Auth**: Supabase Auth - *Optional*
- **Payments**: Stripe - *Optional*
- **Realtime**: Supabase Realtime - *Optional*

**Demo Mode**: The app works without backend configuration for exploring features. AI chat requires `VITE_XAI_API_KEY`.

## 🚀 Deployment

This application is configured to deploy as a **Vite application** on Vercel.

**Important**: The `next` dependency in package.json is for v0 preview compatibility only and is in devDependencies. The actual application framework is Vite, as specified in `vercel.json`.

### Vercel Configuration

The `vercel.json` specifies:
- Framework: `vite`
- Build command: `npm run build`
- Output directory: `dist`

**Do not change the framework setting** - this ensures proper deployment.

### Environment Variables for Production

Set these in your Vercel project settings (Vars tab):
1. **Required for AI Chat**: `VITE_XAI_API_KEY`
2. **Optional for Persistence**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. **Optional for Monitoring**: `VITE_SENTRY_DSN`

## 📚 Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Production Readiness](./PRODUCTION_READINESS.md)
- [Disaster Recovery](./DISASTER_RECOVERY.md)
- [Product Assessment](./PRODUCT_ASSESSMENT.md)
- [Complete Project Summary](./COMPLETE_PROJECT_SUMMARY.md)

## 🎯 Features

- ✅ Content creation & management
- ✅ Social networking (follow, comments, mentions)
- ✅ AI-powered Sages
- ✅ Marketplace with Stripe
- ✅ Enterprise teams & organizations
- ✅ Analytics & insights
- ✅ Search & discovery
- ✅ Real-time notifications
- ✅ Public API
- ✅ Webhooks
- ✅ GDPR compliance

## 🔒 Security

- Row Level Security (RLS) on all tables
- Rate limiting on all endpoints
- Input validation & sanitization
- XSS protection
- Webhook signature verification
- Audit logging

## 🌍 Internationalization

Supports 6 languages: English, Spanish, French, German, Japanese, Chinese

## ♿ Accessibility

WCAG 2.1 AA compliant with:
- Keyboard navigation
- Screen reader support
- High contrast mode
- Skip links
- Focus management

---

**Repository**: https://github.com/sagespace-ai/SageSpace-stitch.git
