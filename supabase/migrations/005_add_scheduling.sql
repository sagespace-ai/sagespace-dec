-- ============================================
-- ADD SCHEDULING SUPPORT TO FEED_ITEMS
-- ============================================

-- Add scheduled_at column to feed_items
ALTER TABLE public.feed_items
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Add index for scheduled posts
CREATE INDEX IF NOT EXISTS idx_feed_items_scheduled ON public.feed_items(scheduled_at)
WHERE scheduled_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.feed_items.scheduled_at IS 'Timestamp when the post should be published. If NULL, post is published immediately.';
