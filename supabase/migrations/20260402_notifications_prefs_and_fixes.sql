-- =============================================================================
-- Notifications: fix column names + add notification_preferences + profile visibility columns
-- =============================================================================

-- ─── 1. Fix notifications table columns ──────────────────────────────────────
-- The code inserts with user_id / message / link  but the table has profile_id / body.
-- We rename to match the code, and add the missing `link` column.

ALTER TABLE notifications
  RENAME COLUMN profile_id TO user_id;

ALTER TABLE notifications
  RENAME COLUMN body TO message;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS link TEXT;

-- Rebuild indexes on the renamed column
DROP INDEX IF EXISTS idx_notifications_profile;
DROP INDEX IF EXISTS idx_notifications_unread;
CREATE INDEX idx_notifications_user    ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread  ON notifications(user_id, is_read) WHERE is_read = false;

-- ─── 2. Fix notification_type enum ───────────────────────────────────────────
-- Add any values the code writes but that aren't in the enum yet.

DO $$
BEGIN
  -- trades
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'trade_proposed'  AND enumtypid = 'notification_type'::regtype) THEN
    ALTER TYPE notification_type ADD VALUE 'trade_proposed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'trade_updated'   AND enumtypid = 'notification_type'::regtype) THEN
    ALTER TYPE notification_type ADD VALUE 'trade_updated';
  END IF;
  -- singles / offers
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'offer_made'      AND enumtypid = 'notification_type'::regtype) THEN
    ALTER TYPE notification_type ADD VALUE 'offer_made';
  END IF;
  -- forum
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'forum_comment'   AND enumtypid = 'notification_type'::regtype) THEN
    ALTER TYPE notification_type ADD VALUE 'forum_comment';
  END IF;
END$$;

-- ─── 3. Fix RLS policies for notifications (use new column name) ─────────────

DROP POLICY IF EXISTS "notifications_select_own"  ON notifications;
DROP POLICY IF EXISTS "notifications_update_own"  ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own"  ON notifications;
DROP POLICY IF EXISTS "notifications_insert_auth" ON notifications;

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- Allow any authenticated user to insert (so server actions can notify others)
CREATE POLICY "notifications_insert_auth" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 4. Add missing profile visibility columns ───────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS digital_collection_visibility  TEXT NOT NULL DEFAULT 'public'
    CHECK (digital_collection_visibility  IN ('public', 'friends', 'private')),
  ADD COLUMN IF NOT EXISTS physical_collection_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (physical_collection_visibility IN ('public', 'friends', 'private')),
  ADD COLUMN IF NOT EXISTS decks_visibility               TEXT NOT NULL DEFAULT 'public'
    CHECK (decks_visibility               IN ('public', 'friends', 'private')),
  ADD COLUMN IF NOT EXISTS website                        TEXT;

-- ─── 5. Notification preferences table ──────────────────────────────────────
-- One row per user. Defaults all true (opt-out model).

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id      UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  trades       BOOLEAN NOT NULL DEFAULT true,
  singles      BOOLEAN NOT NULL DEFAULT true,
  friends      BOOLEAN NOT NULL DEFAULT true,
  forum        BOOLEAN NOT NULL DEFAULT true,
  system       BOOLEAN NOT NULL DEFAULT true,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_prefs_select_own" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notif_prefs_upsert_own" ON notification_preferences
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Helper function: check if user wants a given notification category
CREATE OR REPLACE FUNCTION user_wants_notification(p_user_id UUID, p_category TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  pref BOOLEAN;
BEGIN
  EXECUTE format(
    'SELECT COALESCE(%I, true) FROM notification_preferences WHERE user_id = $1',
    p_category
  ) INTO pref USING p_user_id;
  RETURN COALESCE(pref, true); -- default true if no row
END;
$$;
