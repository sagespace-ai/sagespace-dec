-- SageSpace Core Database Schema
-- Run this first to set up the foundational tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  credits INTEGER DEFAULT 100,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by UUID REFERENCES public.users(id),
  trust_score DECIMAL(3,2) DEFAULT 0.50 CHECK (trust_score >= 0 AND trust_score <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sages table
CREATE TABLE IF NOT EXISTS public.sages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  domain TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🤖',
  persona_json JSONB NOT NULL, -- Full personality config
  capabilities TEXT[] DEFAULT '{}',
  artifact_types TEXT[] DEFAULT ARRAY['text'], -- text, audio, image, video
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  trust_score DECIMAL(3,2) DEFAULT 0.50,
  total_interactions INTEGER DEFAULT 0,
  total_xp_given INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artifacts table (content created by sages)
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sage_id UUID REFERENCES public.sages(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'audio', 'image', 'video')),
  title TEXT,
  content TEXT, -- For text, or markdown
  content_url TEXT, -- For media files (Supabase Storage)
  transcript TEXT, -- For audio/video
  thumbnail_url TEXT,
  duration_seconds INTEGER, -- For audio/video
  
  -- Provenance & Safety
  trace_id UUID DEFAULT uuid_generate_v4(),
  model_used TEXT,
  prompt_hash TEXT,
  generation_timestamp TIMESTAMPTZ DEFAULT NOW(),
  watermarked BOOLEAN DEFAULT TRUE,
  citations JSONB DEFAULT '[]', -- Array of {url, title, accessed_at}
  pii_filtered BOOLEAN DEFAULT TRUE,
  content_warnings TEXT[],
  
  -- Lineage (for remixes)
  parent_artifact_id UUID REFERENCES public.artifacts(id),
  remix_chain UUID[], -- Array of ancestor IDs
  
  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  remixes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Threads table (conversations)
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  type TEXT DEFAULT 'chat' CHECK (type IN ('chat', 'circle', 'debate', 'duet')),
  sage_ids UUID[] NOT NULL, -- Array of participating sages
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'followers', 'private')),
  total_messages INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  mood TEXT, -- For Memory Lane categorization
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'sage')),
  sender_id UUID NOT NULL, -- user_id or sage_id
  content TEXT NOT NULL,
  artifacts UUID[], -- Links to generated artifacts
  trace_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (engagement tracking)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN ('like', 'remix', 'comment', 'save', 'share', 'validate', 'follow', 'view')),
  actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('artifact', 'sage', 'user', 'thread')),
  target_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  artifact_id UUID REFERENCES public.artifacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quests table (gamification)
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season INTEGER NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('remix', 'validate', 'teach', 'debate', 'create', 'share', 'streak')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_xp INTEGER DEFAULT 50,
  reward_credits INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Quest Progress
CREATE TABLE IF NOT EXISTS public.user_quest_progress (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, quest_id)
);

-- Purchases table (monetization)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('plan', 'credits', 'marketplace')),
  plan TEXT, -- pro, team, enterprise
  credits_amount INTEGER,
  price_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table (compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  sage_id UUID REFERENCES public.sages(id),
  artifact_id UUID REFERENCES public.artifacts(id),
  trace_id UUID,
  action TEXT NOT NULL,
  prompt_hash TEXT,
  model_used TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_cents DECIMAL(10,4),
  redactions JSONB DEFAULT '[]', -- Array of {type, count}
  citations JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  followee_type TEXT NOT NULL CHECK (followee_type IN ('user', 'sage')),
  followee_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_type, followee_id)
);

-- Collections table (saved/organized content)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  artifact_ids UUID[] DEFAULT '{}',
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'followers', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artifacts_sage_id ON public.artifacts(sage_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_creator_id ON public.artifacts(creator_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON public.artifacts(type);
CREATE INDEX IF NOT EXISTS idx_artifacts_created_at ON public.artifacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON public.threads(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_events_actor_id ON public.events(actor_id);
CREATE INDEX IF NOT EXISTS idx_events_target ON public.events(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- RLS (Row Level Security) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Public sages visible to all
CREATE POLICY "Public sages are viewable by everyone" ON public.sages
  FOR SELECT USING (visibility = 'public' OR owner_id = auth.uid());

-- Users can create their own sages
CREATE POLICY "Users can create their own sages" ON public.sages
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Public artifacts visible to all
CREATE POLICY "Public artifacts are viewable by everyone" ON public.artifacts
  FOR SELECT USING (
    visibility = 'public' OR 
    creator_id = auth.uid() OR
    sage_id IN (SELECT id FROM public.sages WHERE owner_id = auth.uid())
  );

-- Users can create artifacts
CREATE POLICY "Users can create artifacts" ON public.artifacts
  FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Users can view their own threads
CREATE POLICY "Users can view their own threads" ON public.threads
  FOR SELECT USING (user_id = auth.uid() OR visibility = 'public');

-- Users can create their own threads
CREATE POLICY "Users can create their own threads" ON public.threads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sages_updated_at BEFORE UPDATE ON public.sages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artifacts_updated_at BEFORE UPDATE ON public.artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON public.threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
