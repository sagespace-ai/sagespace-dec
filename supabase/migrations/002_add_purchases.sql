-- Add Purchases table for marketplace transactions
-- Run this in your Supabase SQL Editor

-- ============================================
-- PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL, -- Marketplace item ID
  stripe_session_id TEXT UNIQUE, -- Stripe Checkout Session ID
  amount DECIMAL(10, 2) NOT NULL, -- Purchase amount in USD
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchases
CREATE POLICY "Users can view their own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (true); -- Webhook will insert, so we allow all (webhook is authenticated via Stripe signature)

CREATE POLICY "Users can update their own purchases"
  ON public.purchases FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for user purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session ON public.purchases(stripe_session_id);

-- Trigger to update updated_at
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for purchases (optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
