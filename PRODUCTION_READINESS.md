# Production Readiness Guide

## Overview

This document serves as the source of truth for SageSpace production readiness, testing, monitoring, deployment, and operational procedures.

**Current Status**: 92% → 100% (in progress)

---

## Testing Strategy

### Test Structure

\`\`\`
tests/
├── unit/              # Unit tests for business logic
│   ├── payments/      # Stripe checkout, webhooks, transactions
│   ├── rbac/          # Role-based access control
│   ├── remix/         # Content evolution algorithms
│   └── notifications/ # Notification creation and delivery
├── api/               # API route tests
│   ├── content.test.ts
│   ├── social.test.ts
│   ├── sages.test.ts
│   └── marketplace.test.ts
└── e2e/               # End-to-end tests
    └── user-journey.test.ts
\`\`\`

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run API tests only
npm run test:api

# Run E2E tests only
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
\`\`\`

### Test Framework

- **Unit Tests**: Vitest (fast, Vite-native)
- **API Tests**: Vitest + Supertest
- **E2E Tests**: Playwright

---

## Monitoring & Error Tracking

### Configuration

**Location**: `src/lib/monitoring.ts` and `api/lib/monitoring.ts`

**Tool**: Sentry (with fallback to console logging)

**Environment Variables**:
- `NEXT_PUBLIC_SENTRY_DSN` - Frontend Sentry DSN
- `SENTRY_DSN` - Backend Sentry DSN
- `NODE_ENV` - Environment (development, staging, production)

### Error Tagging

Errors are tagged by:
- **Environment**: development, staging, production
- **Feature Area**: auth, payments, remix, ai, notifications, content, social
- **Severity**: info, warning, error, critical

### Key Monitoring Points

- API route errors
- Frontend unhandled exceptions
- Payment failures and webhook signature errors
- Authorization failures (RBAC/RLS mismatches)
- Rate limit hits
- Background job failures

---

## CI/CD Pipeline

### Configuration

**Location**: `.github/workflows/ci.yml`

### Pipeline Stages

1. **Lint** - ESLint checks
2. **Typecheck** - TypeScript compilation
3. **Test** - Unit, API, and E2E tests
4. **Build** - Production build verification

### Deployment

- **Staging**: Auto-deploy on `develop` branch
- **Production**: Manual approval required for `main` branch

### Commands

\`\`\`bash
# Trigger staging deploy
git push origin develop

# Promote to production (requires approval)
# Merge PR to main branch
\`\`\`

---

## Backup & Disaster Recovery

### Database Backups

**Location**: Supabase Dashboard → Database → Backups

**Strategy**:
- Automated daily backups (Supabase managed)
- Point-in-time recovery available
- Manual backup before major migrations

### Restore Procedure

1. Access Supabase Dashboard
2. Navigate to Database → Backups
3. Select restore point
4. Restore to staging environment first
5. Verify data integrity
6. Promote to production if verified

### Migration Recovery

If a migration fails:
1. Identify failed migration
2. Rollback in Supabase SQL Editor
3. Fix migration script
4. Test in staging
5. Re-apply to production

### Documentation

See `DISASTER_RECOVERY.md` for detailed procedures.

---

## Load Testing

### Setup

**Location**: `tests/load/`

**Tool**: k6 (recommended) or Artillery

### Test Scenarios

- Feed read endpoints (high volume)
- Content creation endpoints
- AI conversation endpoints
- Marketplace endpoints

### Running Load Tests

\`\`\`bash
# Install k6
# https://k6.io/docs/getting-started/installation/

# Run load test
k6 run tests/load/feed-read.js
\`\`\`

See `tests/load/README.md` for detailed scenarios.

---

## Accessibility & i18n

### Accessibility

**Status**: 85% → 100% (in progress)

**Automated Checks**: 
- Playwright accessibility tests
- axe-core integration

**Key Areas**:
- Onboarding flows
- Key modals
- Creation/remix experiences
- Keyboard navigation

### Internationalization

**Status**: 80% → 100% (in progress)

**Languages**: EN (100%), ES (targeting 100%), FR, DE, JA, ZH

**Coverage**: Targeting 100% UI coverage for Spanish

**Location**: `src/utils/i18n.ts`

---

## Environment Variables

### Frontend

\`\`\`env
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SENTRY_DSN=
\`\`\`

### Backend

\`\`\`env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENTRY_DSN=
NEXT_PUBLIC_APP_URL=
PUBLIC_API_KEY=
WEBHOOK_SECRET=
\`\`\`

---

## Quick Reference

### Test Commands
- `npm test` - Run all tests
- `npm run test:unit` - Unit tests
- `npm run test:api` - API tests
- `npm run test:e2e` - E2E tests

### Monitoring
- Sentry Dashboard: https://sentry.io/
- Error tagging: See `src/lib/monitoring.ts`

### Deployment
- Staging: Auto on `develop`
- Production: Manual on `main`

### Backup
- Supabase Dashboard → Database → Backups
- Daily automated backups

---

**Last Updated**: Current  
**Maintainer**: Platform Team
