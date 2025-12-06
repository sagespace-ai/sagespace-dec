# Sentry Setup Guide

## Overview

SageSpace uses Sentry for error tracking and monitoring. This guide will help you set up Sentry for both frontend and backend.

## Prerequisites

- Sentry account (sign up at https://sentry.io)
- Access to your project's environment variables

## Step 1: Create Sentry Projects

1. **Log in to Sentry** (https://sentry.io)

2. **Create Frontend Project**:
   - Click "Create Project"
   - Select "React" as the platform
   - Name it "SageSpace Frontend"
   - Select your organization
   - Click "Create Project"
   - **Copy the DSN** (Data Source Name)

3. **Create Backend Project**:
   - Click "Create Project"
   - Select "Next.js" as the platform
   - Name it "SageSpace Backend"
   - Select your organization
   - Click "Create Project"
   - **Copy the DSN**

## Step 2: Configure Environment Variables

### Frontend (.env.local or production environment)

\`\`\`bash
VITE_SENTRY_DSN=https://your-frontend-dsn@sentry.io/your-project-id
\`\`\`

### Backend (api/.env.local or production environment)

\`\`\`bash
SENTRY_DSN=https://your-backend-dsn@sentry.io/your-project-id
\`\`\`

## Step 3: Verify Integration

### Frontend

The monitoring is already integrated in:
- `src/lib/monitoring.ts` - Main monitoring utilities
- `src/components/ErrorBoundary.tsx` - Error boundary with Sentry

To test:
1. Add a test error in development:
   \`\`\`typescript
   import { captureException } from '../lib/monitoring'
   captureException(new Error('Test error'), { feature: 'testing' })
   \`\`\`
2. Check your Sentry dashboard - you should see the error appear

### Backend

The monitoring is already integrated in:
- `api/lib/monitoring.ts` - Main monitoring utilities
- `api/pages/api/checkout.ts` - Payment error logging
- `api/pages/api/organizations.ts` - Organization error logging
- `api/pages/api/webhooks/stripe.ts` - Webhook error logging

To test:
1. Trigger an API error (e.g., invalid request)
2. Check your Sentry dashboard - you should see the error appear

## Step 4: Configure Alerts

1. **Go to Alerts** in Sentry dashboard
2. **Create Alert Rules**:

   **Critical Errors** (Payment Failures):
   - Condition: Error rate > 5% in 5 minutes
   - Action: Email/Slack notification
   - Tags: `feature:payments`

   **High Error Rate**:
   - Condition: Error rate > 10% in 5 minutes
   - Action: Email/Slack notification
   - Tags: All errors

   **Webhook Failures**:
   - Condition: Error count > 3 in 5 minutes
   - Action: Email/Slack notification
   - Tags: `feature:payments`, `endpoint:/api/webhooks/stripe`

   **Authorization Failures**:
   - Condition: Error count > 10 in 5 minutes
   - Action: Email notification
   - Tags: `feature:auth`

## Step 5: Set Up Performance Monitoring

1. **Enable Performance Monitoring** in Sentry project settings
2. **Configure Sampling**:
   - Development: 100% (all transactions)
   - Production: 10% (to reduce overhead)

The code already includes performance monitoring:
- Frontend: Browser tracing enabled
- Backend: HTTP tracing enabled

## Step 6: Configure Release Tracking

Add release tracking to your CI/CD pipeline:

\`\`\`yaml
# In .github/workflows/ci.yml (add to build step)
- name: Create Sentry Release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: sagespace-frontend
  with:
    environment: production
    version: ${{ github.sha }}
\`\`\`

## Step 7: Test in Production

1. Deploy to staging with Sentry DSNs configured
2. Trigger test errors
3. Verify errors appear in Sentry dashboard
4. Check alert notifications work
5. Deploy to production

## Monitoring Features Already Implemented

### Error Tagging

Errors are automatically tagged by:
- **Feature Area**: `auth`, `payments`, `remix`, `ai`, `notifications`, `content`, `social`
- **Environment**: `development`, `staging`, `production`
- **User ID**: When available
- **Endpoint**: For API errors

### Specialized Logging

- `logPaymentFailure()` - Payment errors with metadata
- `logWebhookError()` - Webhook signature errors
- `logAuthFailure()` - Authorization failures
- `logRateLimit()` - Rate limit hits

### Error Context

All errors include:
- User information (when available)
- Request metadata
- Stack traces
- Breadcrumbs (user actions leading to error)

## Troubleshooting

### Errors Not Appearing

1. **Check DSN is set correctly**:
   \`\`\`bash
   echo $VITE_SENTRY_DSN  # Frontend
   echo $SENTRY_DSN       # Backend
   \`\`\`

2. **Check Sentry initialization**:
   - Frontend: Check browser console for Sentry messages
   - Backend: Check server logs for Sentry initialization

3. **Verify network access**:
   - Ensure your server can reach `*.sentry.io`

### Performance Impact

- Sentry is lazy-loaded (only loads when DSN is present)
- Performance monitoring uses sampling (10% in production)
- Errors are sent asynchronously (non-blocking)

## Next Steps

1. ✅ Set up Sentry projects
2. ✅ Configure DSNs
3. ✅ Test error tracking
4. ✅ Configure alerts
5. ✅ Set up release tracking
6. ✅ Monitor production errors

## Support

- Sentry Documentation: https://docs.sentry.io
- Sentry Support: https://sentry.io/support

---

**Status**: Ready for configuration  
**Last Updated**: Current
