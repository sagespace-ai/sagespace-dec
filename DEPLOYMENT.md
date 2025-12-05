# SageSpace Deployment Guide

## Quick Deploy to Vercel

1. **Fork the repo** and connect to Vercel
2. **Add environment variables** from `.env.example`
3. **Configure integrations**:
   - Supabase (database)
   - Groq (AI inference)
   - Stripe (payments)
4. **Run migrations**: Execute SQL scripts in `/scripts` directory
5. **Deploy!**

## Environment Setup

### Required
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` - Database
- `API_KEY_GROQ_API_KEY` - AI generation
- `TEXT_MODEL` - Default to `openai/gpt-4`

### Optional (Feature Gated)
- `ENABLE_IMAGE_GEN=true` + `IMAGE_MODEL` - Image artifacts
- `ENABLE_AUDIO_GEN=true` + `AUDIO_MODEL` - Audio artifacts
- `ENABLE_VIDEO_GEN=true` + `VIDEO_MODEL` - Video artifacts
- `STRIPE_SECRET_KEY` - Monetization

## Pre-Launch Checklist

- [ ] Database schema deployed (`/scripts/001-create-core-schema.sql`)
- [ ] Seed data loaded (50 demo sages)
- [ ] Environment variables configured
- [ ] Feature flags set appropriately
- [ ] Rate limits configured
- [ ] Sentry error tracking enabled
- [ ] Analytics tracking configured
- [ ] All marketplace slugs tested for 404s
- [ ] /demo pre-seeded session working
- [ ] Mobile responsiveness verified

## Performance Optimizations

- **Edge runtime** for `/marketplace` and `/multiverse` (ISR)
- **Route prefetching** for sage cards
- **Card virtualization** for large lists
- **Image optimization** via Next.js Image component
- **Lazy loading** for modals and heavy components

## Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Core Web Vitals and user metrics
- **Custom events**: Track create, share, purchase, validate actions

## Cost Management

- Text generation: Free tier (100 credits/day)
- Image/Audio/Video: Gated behind feature flags and premium tiers
- Rate limiting per user tier prevents abuse
- Queue system for expensive operations (video)

## Security

- RLS policies on all Supabase tables
- Content moderation enabled by default
- PII filtering for user safety
- Watermarking for artifact provenance
- CORS configured for API routes
