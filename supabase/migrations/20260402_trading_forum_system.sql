-- ============================================================
-- Migration: Trading forum, deck sharing, chat with expiry,
--            trade ratings (reputation score /100)
-- ============================================================

-- ─── 1. Add deck_id link to forum_threads (for auto-published decks) ──────────
ALTER TABLE public.forum_threads
  ADD COLUMN IF NOT EXISTS thread_type TEXT NOT NULL DEFAULT 'general'
    CHECK (thread_type IN ('general', 'deck', 'trading')),
  ADD COLUMN IF NOT EXISTS deck_id     UUID REFERENCES public.decks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS listing_id  UUID REFERENCES public.card_listings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS meta        JSONB;

-- ─── 2. Add card photos to card_listings ─────────────────────────────────────
ALTER TABLE public.card_listings
  ADD COLUMN IF NOT EXISTS photo_front_url  TEXT,
  ADD COLUMN IF NOT EXISTS photo_back_url   TEXT;

-- ─── 3. Add expiry + close tracking to private_chats ────────────────────────
ALTER TABLE public.private_chats
  ADD COLUMN IF NOT EXISTS closed_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  ADD COLUMN IF NOT EXISTS trade_type       TEXT NOT NULL DEFAULT 'trade'
    CHECK (trade_type IN ('trade', 'sale'));

-- ─── 4. Trade ratings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trade_ratings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id       UUID NOT NULL REFERENCES public.private_chats(id) ON DELETE CASCADE,
  rater_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rated_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score         SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_rating_per_chat UNIQUE (chat_id, rater_id)
);

ALTER TABLE public.trade_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trade_ratings_select_all"
  ON public.trade_ratings FOR SELECT USING (true);

CREATE POLICY "trade_ratings_insert_own"
  ON public.trade_ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

-- ─── 5. Computed reputation on profiles (0-100 scale) ────────────────────────
-- reputation = avg(score) / 5 * 100, kept updated by trigger

CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET
    reputation    = COALESCE((
      SELECT ROUND(AVG(score) / 5.0 * 100, 1)
      FROM public.trade_ratings
      WHERE rated_id = NEW.rated_id
    ), 0),
    total_trades  = (
      SELECT COUNT(DISTINCT chat_id)
      FROM public.trade_ratings
      WHERE rated_id = NEW.rated_id
    ),
    updated_at    = now()
  WHERE id = NEW.rated_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_reputation ON public.trade_ratings;
CREATE TRIGGER trg_update_reputation
  AFTER INSERT OR UPDATE ON public.trade_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_user_reputation();

-- ─── 6. Auto-close expired chats (run via cron) ──────────────────────────────
CREATE OR REPLACE FUNCTION public.close_expired_chats()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.private_chats
  SET closed_at = now()
  WHERE expires_at <= now() AND closed_at IS NULL;
END;
$$;

-- ─── 7. Pending rating notification flag on profiles ─────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pending_rating_chat_id UUID REFERENCES public.private_chats(id) ON DELETE SET NULL;

-- ─── 8. RLS for trade_ratings already added above ────────────────────────────

-- ─── 9. Storage bucket for card photos ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-photos', 'card-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "card_photos_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-photos');

CREATE POLICY "card_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'card-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "card_photos_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'card-photos' AND owner = auth.uid()::text);
