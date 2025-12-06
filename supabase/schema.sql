-- SageSpace Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (Profile extension of auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- SAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar TEXT NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  memory TEXT NOT NULL CHECK (memory IN ('local', 'cross-session', 'global')),
  autonomy TEXT NOT NULL CHECK (autonomy IN ('advisory', 'semi-autonomous', 'autonomous')),
  data_access TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.sages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sages
CREATE POLICY "Users can view their own sages"
  ON public.sages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sages"
  ON public.sages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sages"
  ON public.sages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sages"
  ON public.sages FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FEED_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'text', 'simulation')),
  thumbnail TEXT,
  content_url TEXT,
  description TEXT,
  remixes INTEGER DEFAULT 0 NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feed_items
CREATE POLICY "Users can view their own feed items"
  ON public.feed_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feed items"
  ON public.feed_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed items"
  ON public.feed_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feed items"
  ON public.feed_items FOR DELETE
  USING (auth.uid() = user_id);

-- Index for cursor-based pagination
CREATE INDEX IF NOT EXISTS idx_feed_items_user_created ON public.feed_items(user_id, created_at DESC);

-- ============================================
-- FEED_INTERACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feed_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'remix')),
  content TEXT, -- For comments
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, feed_item_id, interaction_type)
);

-- Enable RLS
ALTER TABLE public.feed_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feed_interactions
CREATE POLICY "Users can view their own interactions"
  ON public.feed_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
  ON public.feed_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
  ON public.feed_interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
  ON public.feed_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for feed item interactions
CREATE INDEX IF NOT EXISTS idx_feed_interactions_item ON public.feed_interactions(feed_item_id);

-- ============================================
-- SESSIONS TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sages_updated_at
  BEFORE UPDATE ON public.sages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_items_updated_at
  BEFORE UPDATE ON public.feed_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current user's feed items with pagination
CREATE OR REPLACE FUNCTION get_user_feed_items(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  type TEXT,
  thumbnail TEXT,
  content_url TEXT,
  description TEXT,
  remixes INTEGER,
  views INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fi.id,
    fi.user_id,
    fi.title,
    fi.type,
    fi.thumbnail,
    fi.content_url,
    fi.description,
    fi.remixes,
    fi.views,
    fi.created_at,
    fi.updated_at
  FROM public.feed_items fi
  WHERE fi.user_id = p_user_id
    AND (p_cursor IS NULL OR fi.created_at < p_cursor)
  ORDER BY fi.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
