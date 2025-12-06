# SageSpace Development Guide

## Overview

SageSpace is a creative AI platform built with React, TypeScript, Vite, and Supabase. This guide covers setup, development practices, and deployment.

## Testing Strategy

**Location**: `tests/` directory

- **Unit Tests**: `tests/unit/` - Business logic, utilities, RBAC, payments
- **API Tests**: `tests/api/` - API route testing
- **E2E Tests**: `tests/e2e/` - End-to-end user journeys
- **Load Tests**: `tests/load/` - Performance and load testing

**Run Tests**:
\`\`\`bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:api      # API tests only
npm run test:e2e      # E2E tests
npm run test:coverage # With coverage
\`\`\`

## Monitoring

**Location**: `src/lib/monitoring.ts` and `api/lib/monitoring.ts`

**Tool**: Sentry (with console fallback)

**Environment Variables**:
- `VITE_SENTRY_DSN` - Frontend Sentry DSN
- `SENTRY_DSN` - Backend Sentry DSN

Errors are automatically tagged by:
- Feature area (auth, payments, remix, ai, etc.)
- Environment (development, staging, production)
- User ID (when available)

## CI/CD

**Location**: `.github/workflows/ci.yml`

**Pipeline Stages**:
1. Lint - ESLint checks
2. Typecheck - TypeScript compilation
3. Test - Unit, API, and E2E tests
4. Build - Production build verification

**Deployment**:
- Staging: Auto-deploy on `develop` branch
- Production: Manual approval on `main` branch

## Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Supabase account (for database and auth)
- Stripe account (for payments)
- Google Gemini API key (for AI features)

## Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd "Stitch - SageSpace"
npm install
cd api
npm install
\`\`\`

### 2. Environment Variables

Create `.env.local` files:

**Frontend (`src/.env.local`)**:
\`\`\`env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

**API (`api/.env.local`)**:
\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Database Setup

Run migrations in Supabase SQL Editor:

1. `supabase/migrations/001_add_conversations.sql`
2. `supabase/migrations/002_add_purchases.sql`

Enable Realtime for tables:
\`\`\`sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
\`\`\`

### 4. Run Development Servers

**Terminal 1 - Frontend**:
\`\`\`bash
npm run dev
\`\`\`

**Terminal 2 - API**:
\`\`\`bash
cd api
npm run dev
\`\`\`

Visit `http://localhost:5173`

## Project Structure

\`\`\`
Stitch - SageSpace/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/            # API service layer
│   ├── contexts/            # React contexts
│   ├── store/              # Zustand state management
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript types
├── api/                    # Next.js API server
│   ├── pages/api/          # API routes
│   └── lib/                # Shared utilities
├── supabase/               # Database migrations
└── docs/                   # Documentation
\`\`\`

## Development Practices

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use functional components with hooks
- Prefer composition over inheritance

### State Management

- **Client/UI State**: Zustand (`src/store/`)
- **Server State**: React Query (`@tanstack/react-query`)
- **Form State**: Local component state
- **Auth State**: AuthContext

### API Integration

- Use `apiService` from `src/services/api.ts`
- All API calls go through the service layer
- Handle errors gracefully
- Show loading and error states

### Component Patterns

- Use `Card2035`, `Button2035`, `Input2035` for UI consistency
- Use `FadeIn` for animations
- Use `EmptyState` for empty states
- Use `Skeleton` components for loading states

### Error Handling

- Use ErrorBoundary for component errors
- Use try/catch for async operations
- Show user-friendly error messages
- Log errors for debugging

## Features

### Authentication

- Supabase Auth for user management
- Protected routes with `AuthGuard`
- Session management with token sync

### Feed

- Real-time updates via Supabase Realtime
- Infinite scroll pagination
- Filter by content type
- Persona-based filtering

### Sages (AI Assistants)

- Chat interface with conversation history
- Real-time message updates
- Multiple Sage personalities
- Message persistence

### Content Creation

- AI-powered generation (Gemini)
- Multiple content types (image, text, etc.)
- Direct feed publishing
- Remix functionality

### Marketplace

- Stripe payment integration
- Purchase history
- Real-time inventory updates

## Testing

### Running Tests

\`\`\`bash
# Unit tests (when set up)
npm run test

# E2E tests (when set up)
npm run test:e2e
\`\`\`

### Test Coverage

Target: 70%+ coverage for critical paths

## Performance

### Optimization Strategies

- Code splitting (configured in `vite.config.ts`)
- Image lazy loading
- React Query caching
- Skeleton screens for loading states
- Retry logic for network errors

### Monitoring

- Error tracking (via ErrorBoundary)
- Performance metrics (to be added)
- User analytics (to be added)

## Deployment

### Frontend (Vercel)

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### API (Vercel/Netlify)

1. Deploy `api/` folder as separate service
2. Set environment variables
3. Configure webhook endpoints

### Database

- Supabase handles database hosting
- Run migrations before deployment
- Enable RLS policies

## Troubleshooting

### Common Issues

**"Unable to load feed"**
- Check `VITE_API_URL` is correct
- Ensure API server is running
- Check CORS configuration

**"API returned HTML instead of JSON"**
- API endpoint doesn't exist
- API URL misconfigured
- Server error (check API logs)

**Real-time not working**
- Check Realtime is enabled in Supabase
- Verify tables are in realtime publication
- Check WebSocket connections

**Stripe webhook not working**
- Verify webhook secret matches
- Check webhook URL is accessible
- Review webhook logs in Stripe dashboard

## Contributing

1. Create feature branch
2. Make changes following code style
3. Test thoroughly
4. Submit pull request

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## Support

For issues or questions, check:
- `DEVELOPMENT.md` (this file)
- `PHASED_DEVELOPMENT_PLAN.md` for roadmap
- Component documentation in code comments
