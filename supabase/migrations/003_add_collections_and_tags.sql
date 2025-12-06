-- ============================================
-- COLLECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for UI
  icon TEXT, -- Icon identifier
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, name) -- Prevent duplicate collection names per user
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections
CREATE POLICY "Users can view their own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- Index for user collections
CREATE INDEX IF NOT EXISTS idx_collections_user_created ON public.collections(user_id, created_at DESC);

-- ============================================
-- COLLECTION_ITEMS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(collection_id, feed_item_id) -- Prevent duplicate items in same collection
);

-- Enable RLS
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collection_items
CREATE POLICY "Users can view items in their collections"
  ON public.collection_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.collections 
    WHERE id = collection_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can add items to their collections"
  ON public.collection_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.collections 
    WHERE id = collection_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can remove items from their collections"
  ON public.collection_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.collections 
    WHERE id = collection_id AND user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_feed_item ON public.collection_items(feed_item_id);

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT, -- Hex color for UI
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, name) -- Prevent duplicate tag names per user
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tags
CREATE POLICY "Users can view their own tags"
  ON public.tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON public.tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON public.tags FOR DELETE
  USING (auth.uid() = user_id);

-- Index for user tags
CREATE INDEX IF NOT EXISTS idx_tags_user_name ON public.tags(user_id, name);

-- ============================================
-- FEED_ITEM_TAGS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS public.feed_item_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(feed_item_id, tag_id) -- Prevent duplicate tags on same item
);

-- Enable RLS
ALTER TABLE public.feed_item_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feed_item_tags
CREATE POLICY "Users can view tags on their feed items"
  ON public.feed_item_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.feed_items 
    WHERE id = feed_item_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can add tags to their feed items"
  ON public.feed_item_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.feed_items 
    WHERE id = feed_item_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can remove tags from their feed items"
  ON public.feed_item_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.feed_items 
    WHERE id = feed_item_id AND user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feed_item_tags_feed_item ON public.feed_item_tags(feed_item_id);
CREATE INDEX IF NOT EXISTS idx_feed_item_tags_tag ON public.feed_item_tags(tag_id);

-- ============================================
-- ARCHIVED_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.archived_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, feed_item_id) -- Prevent duplicate archives
);

-- Enable RLS
ALTER TABLE public.archived_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for archived_items
CREATE POLICY "Users can view their archived items"
  ON public.archived_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can archive their items"
  ON public.archived_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unarchive their items"
  ON public.archived_items FOR DELETE
  USING (auth.uid() = user_id);

-- Index for user archives
CREATE INDEX IF NOT EXISTS idx_archived_items_user_archived ON public.archived_items(user_id, archived_at DESC);

-- Trigger to update updated_at column for collections
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
