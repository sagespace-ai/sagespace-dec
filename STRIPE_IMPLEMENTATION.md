# Stripe Payment Processing Implementation

## Overview

Stripe payment processing has been integrated into the SageSpace marketplace, allowing users to purchase marketplace items securely.

## Features Implemented

### 1. Stripe Checkout Session Creation

**Location**: `api/pages/api/checkout.ts`

**Features**:
- Creates Stripe Checkout sessions for marketplace purchases
- Handles authentication and user verification
- Returns checkout URL for redirect
- Includes metadata for webhook processing

**Usage**:
\`\`\`typescript
POST /api/checkout
{
  "itemId": "item_123",
  "itemTitle": "Sci-Fi Story Starters",
  "price": 19.99,
  "itemType": "marketplace_item"
}
\`\`\`

### 2. Stripe Webhook Handler

**Location**: `api/pages/api/webhooks/stripe.ts`

**Features**:
- Handles Stripe webhook events
- Verifies webhook signatures for security
- Records purchases in database
- Handles payment success and failure events

**Events Handled**:
- `checkout.session.completed` - Payment successful
- `payment_intent.succeeded` - Payment confirmed
- `payment_intent.payment_failed` - Payment failed

### 3. Frontend Integration

**Location**: `src/pages/Marketplace.tsx`

**Features**:
- Creates checkout session on purchase click
- Redirects to Stripe Checkout
- Handles success/cancel redirects
- Shows toast notifications

### 4. Database Schema

**Location**: `supabase/migrations/002_add_purchases.sql`

**Features**:
- `purchases` table for transaction records
- Tracks purchase status (pending, completed, failed, refunded)
- Links purchases to users and items
- Stores Stripe session IDs

## Setup Instructions

### 1. Install Stripe SDK

\`\`\`bash
cd api
npm install stripe
\`\`\`

### 2. Configure Environment Variables

Add to your `.env` files:

**API (`api/.env.local`)**:
\`\`\`env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Frontend (`src/.env.local`)**:
\`\`\`env
VITE_API_URL=http://localhost:3001
\`\`\`

### 3. Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Run Database Migration

Run the migration in Supabase SQL Editor:
\`\`\`sql
-- See supabase/migrations/002_add_purchases.sql
\`\`\`

### 5. Configure Next.js for Webhooks

The webhook endpoint uses raw body parsing. Ensure your Next.js config supports this (already configured in `api/next.config.js`).

## API Endpoints

### POST /api/checkout

Creates a Stripe Checkout session.

**Request**:
\`\`\`json
{
  "itemId": "item_123",
  "itemTitle": "Sci-Fi Story Starters",
  "price": 19.99,
  "itemType": "marketplace_item"
}
\`\`\`

**Response**:
\`\`\`json
{
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/..."
  }
}
\`\`\`

### POST /api/webhooks/stripe

Handles Stripe webhook events (configured in Stripe Dashboard).

## Frontend Flow

1. User clicks "Purchase" on marketplace item
2. Frontend calls `/api/checkout` to create session
3. User is redirected to Stripe Checkout
4. User completes payment on Stripe
5. Stripe redirects back to `/marketplace?success=true&session_id=...`
6. Frontend shows success notification
7. Webhook processes payment and records purchase

## Security Considerations

1. **Webhook Signature Verification**: All webhooks are verified using Stripe's signature
2. **Authentication**: Checkout endpoint requires user authentication
3. **RLS Policies**: Database purchases are protected by Row Level Security
4. **HTTPS Required**: Stripe requires HTTPS in production

## Testing

### Test Mode

Use Stripe test mode for development:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any CVC
- Any ZIP code

### Webhook Testing

Use Stripe CLI for local webhook testing:
\`\`\`bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
\`\`\`

## Future Enhancements

1. **Purchase History**: Display user's purchase history
2. **Refunds**: Handle refund requests
3. **Subscriptions**: Support recurring payments
4. **Multiple Payment Methods**: Add more payment options
5. **Purchase Notifications**: Email confirmations
6. **Access Control**: Grant access to purchased items

## Troubleshooting

### Checkout Not Working

1. Verify `STRIPE_SECRET_KEY` is set
2. Check API URL is correct
3. Ensure user is authenticated
4. Check browser console for errors

### Webhook Not Receiving Events

1. Verify webhook URL is correct in Stripe Dashboard
2. Check `STRIPE_WEBHOOK_SECRET` matches
3. Ensure endpoint is accessible (not behind firewall)
4. Check webhook logs in Stripe Dashboard

### Purchases Not Recorded

1. Check webhook is receiving events
2. Verify database migration ran successfully
3. Check RLS policies allow inserts
4. Review webhook logs for errors
