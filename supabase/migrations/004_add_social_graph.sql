-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id), -- Prevent duplicate follows
  CHECK (follower_id != following_id) -- Prevent self-follows
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Users can view all follows"
  ON public.follows FOR SELECT
  USING (true); -- Public read access for follower counts

CREATE POLICY "Users can insert their own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created ON public.follows(created_at DESC);

-- ============================================
-- ENHANCED COMMENTS TABLE
-- ============================================
-- Note: This extends the existing feed_interactions table
-- We'll add a comments table for threaded comments

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For threaded replies
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Users can view all comments"
  ON public.comments FOR SELECT
  USING (true); -- Public read access

CREATE POLICY "Users can insert their own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_feed_item ON public.comments(feed_item_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);

-- Trigger to update updated_at column
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MENTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id UUID REFERENCES public.feed_items(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (
    (feed_item_id IS NOT NULL AND comment_id IS NULL) OR
    (feed_item_id IS NULL AND comment_id IS NOT NULL)
  ) -- Must mention in either feed item or comment, not both
);

-- Enable RLS
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentions
CREATE POLICY "Users can view mentions of themselves"
  ON public.mentions FOR SELECT
  USING (auth.uid() = mentioned_user_id);

CREATE POLICY "Users can view mentions they created"
  ON public.mentions FOR SELECT
  USING (auth.uid() = mentioned_by_user_id);

CREATE POLICY "Users can insert their own mentions"
  ON public.mentions FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by_user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mentions_user ON public.mentions(mentioned_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_feed_item ON public.mentions(feed_item_id);
CREATE INDEX IF NOT EXISTS idx_mentions_comment ON public.comments(comment_id);

-- ============================================
-- USER STATS VIEW (for follower/following counts)
-- ============================================
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  u.id,
  u.name,
  u.email,
  u.avatar,
  COUNT(DISTINCT f1.follower_id) AS followers_count,
  COUNT(DISTINCT f2.following_id) AS following_count,
  COUNT(DISTINCT fi.id) AS posts_count
FROM public.users u
LEFT JOIN public.follows f1 ON f1.following_id = u.id
LEFT JOIN public.follows f2 ON f2.follower_id = u.id
LEFT JOIN public.feed_items fi ON fi.user_id = u.id
GROUP BY u.id, u.name, u.email, u.avatar;

-- Grant access to authenticated users
GRANT SELECT ON public.user_stats TO authenticated;
