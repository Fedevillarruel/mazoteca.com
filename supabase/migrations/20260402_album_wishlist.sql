-- Add is_wishlisted flag to user_album
-- Allows users to mark cards they want but don't own yet

ALTER TABLE user_album
  ADD COLUMN IF NOT EXISTS is_wishlisted BOOLEAN NOT NULL DEFAULT false;

-- Allow quantity = 0 rows for wishlisted-but-not-owned cards
-- (The existing quantity column already allows 0 via the upsert logic)

-- Index for fast wishlist queries
CREATE INDEX IF NOT EXISTS idx_user_album_wishlist
  ON user_album(profile_id)
  WHERE is_wishlisted = true;

-- Update RLS: existing policies on user_album already cover this column
-- since they use profile_id = auth.uid() which covers all columns
