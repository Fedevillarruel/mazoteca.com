-- =============================================================================
-- Mazoteca — Full Database Schema
-- =============================================================================
-- Run this migration against your Supabase project:
--   supabase db push
-- Or in the Supabase SQL Editor.
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy text search

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE card_rarity AS ENUM (
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'
);

CREATE TYPE card_type AS ENUM (
  'combatant', 'strategy', 'crowned', 'artifact', 'spell', 'trap'
);

CREATE TYPE card_kingdom AS ENUM (
  'fire', 'water', 'earth', 'air', 'light', 'shadow', 'neutral'
);

CREATE TYPE deck_type AS ENUM ('strategy', 'combatants');

CREATE TYPE listing_status AS ENUM ('active', 'sold', 'paused', 'removed');

CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'expired');

CREATE TYPE trade_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed', 'expired');

CREATE TYPE tournament_format AS ENUM ('single_elimination', 'double_elimination', 'swiss', 'round_robin');

CREATE TYPE tournament_status AS ENUM ('draft', 'upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled');

CREATE TYPE card_condition AS ENUM ('mint', 'near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged');

CREATE TYPE card_finish AS ENUM ('normal', 'foil', 'full_art', 'promo', 'first_edition');

CREATE TYPE subscription_status AS ENUM ('free', 'active', 'paused', 'cancelled', 'past_due');

CREATE TYPE notification_type AS ENUM (
  'trade_proposal', 'trade_accepted', 'trade_rejected',
  'offer_received', 'offer_accepted', 'offer_rejected',
  'friend_request', 'friend_accepted',
  'tournament_start', 'tournament_result',
  'forum_reply', 'forum_mention',
  'system', 'listing_sold'
);

CREATE TYPE report_type AS ENUM ('user', 'listing', 'thread', 'post', 'deck');

CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');

-- =============================================================================
-- TABLES
-- =============================================================================

-- ─── Games ────────────────────────────────────────────────────────────────────

CREATE TABLE games (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Expansions ───────────────────────────────────────────────────────────────

CREATE TABLE expansions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id       UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  code          TEXT NOT NULL,         -- e.g. "GEN", "SOA"
  release_date  DATE,
  total_cards   INT NOT NULL DEFAULT 0,
  logo_url      TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expansions_game ON expansions(game_id);

-- ─── Cards ────────────────────────────────────────────────────────────────────

CREATE TABLE cards (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expansion_id  UUID NOT NULL REFERENCES expansions(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  number        TEXT NOT NULL,
  rarity        card_rarity NOT NULL,
  type          card_type NOT NULL,
  kingdom       card_kingdom,
  cost          INT,
  attack        INT,
  defense       INT,
  abilities     JSONB DEFAULT '[]'::jsonb,
  lore_text     TEXT,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_expansion ON cards(expansion_id);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_type ON cards(type);
CREATE INDEX idx_cards_kingdom ON cards(kingdom);
CREATE INDEX idx_cards_slug ON cards(slug);
CREATE INDEX idx_cards_name_trgm ON cards USING gin(name gin_trgm_ops);

-- ─── Card Variants ────────────────────────────────────────────────────────────

CREATE TABLE card_variants (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id    UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  finish     card_finish NOT NULL DEFAULT 'normal',
  image_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_card_variants_card ON card_variants(card_id);
CREATE UNIQUE INDEX idx_card_variants_unique ON card_variants(card_id, finish);

-- ─── Profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  location        TEXT,
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_premium      BOOLEAN NOT NULL DEFAULT false,
  reputation      NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_trades    INT NOT NULL DEFAULT 0,
  total_sales     INT NOT NULL DEFAULT 0,
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  collection_visibility TEXT NOT NULL DEFAULT 'public' CHECK (collection_visibility IN ('public', 'friends', 'private')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_username_trgm ON profiles USING gin(username gin_trgm_ops);

-- ─── Digital Inventory (Album) ────────────────────────────────────────────────

CREATE TABLE digital_inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id     UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES card_variants(id),
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_digital_inv_unique ON digital_inventory(profile_id, card_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'));
CREATE INDEX idx_digital_inv_profile ON digital_inventory(profile_id);

-- ─── Physical Inventory ───────────────────────────────────────────────────────

CREATE TABLE physical_inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id     UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES card_variants(id),
  condition   card_condition NOT NULL DEFAULT 'near_mint',
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  photo_urls  TEXT[] DEFAULT '{}',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_physical_inv_profile ON physical_inventory(profile_id);

-- ─── Wishlist ─────────────────────────────────────────────────────────────────

CREATE TABLE wishlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id     UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  priority    INT NOT NULL DEFAULT 0,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_wishlist_unique ON wishlists(profile_id, card_id);
CREATE INDEX idx_wishlist_profile ON wishlists(profile_id);

-- ─── Decks ────────────────────────────────────────────────────────────────────

CREATE TABLE decks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  description   TEXT,
  deck_type     deck_type NOT NULL,
  crowned_id    UUID REFERENCES cards(id),
  is_valid      BOOLEAN NOT NULL DEFAULT false,
  is_public     BOOLEAN NOT NULL DEFAULT true,
  likes_count   INT NOT NULL DEFAULT 0,
  copies_count  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_decks_profile ON decks(profile_id);
CREATE INDEX idx_decks_public ON decks(is_public) WHERE is_public = true;
CREATE UNIQUE INDEX idx_decks_slug ON decks(profile_id, slug);

-- ─── Deck Cards ───────────────────────────────────────────────────────────────

CREATE TABLE deck_cards (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id  UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  card_id  UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 3)
);

CREATE UNIQUE INDEX idx_deck_cards_unique ON deck_cards(deck_id, card_id);
CREATE INDEX idx_deck_cards_deck ON deck_cards(deck_id);

-- ─── Deck Likes ───────────────────────────────────────────────────────────────

CREATE TABLE deck_likes (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deck_id    UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, deck_id)
);

-- ─── Marketplace Listings ─────────────────────────────────────────────────────

CREATE TABLE marketplace_listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id       UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  variant_id    UUID REFERENCES card_variants(id),
  condition     card_condition NOT NULL DEFAULT 'near_mint',
  price         INT NOT NULL CHECK (price > 0),              -- in ARS centavos
  quantity      INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  description   TEXT,
  photo_urls    TEXT[] DEFAULT '{}',
  status        listing_status NOT NULL DEFAULT 'active',
  views_count   INT NOT NULL DEFAULT 0,
  offers_count  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_listings_card ON marketplace_listings(card_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_price ON marketplace_listings(price);
CREATE INDEX idx_listings_active ON marketplace_listings(status, created_at DESC) WHERE status = 'active';

-- ─── Marketplace Offers ───────────────────────────────────────────────────────

CREATE TABLE marketplace_offers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INT NOT NULL CHECK (amount > 0),
  message     TEXT,
  status      offer_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_offers_listing ON marketplace_offers(listing_id);
CREATE INDEX idx_offers_buyer ON marketplace_offers(buyer_id);

-- ─── Trades ───────────────────────────────────────────────────────────────────

CREATE TABLE trades (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        trade_status NOT NULL DEFAULT 'pending',
  message       TEXT,
  expires_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_trade_parties CHECK (proposer_id != receiver_id)
);

CREATE INDEX idx_trades_proposer ON trades(proposer_id);
CREATE INDEX idx_trades_receiver ON trades(receiver_id);
CREATE INDEX idx_trades_status ON trades(status);

-- ─── Trade Items ──────────────────────────────────────────────────────────────

CREATE TABLE trade_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id    UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  card_id     UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES card_variants(id),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

CREATE INDEX idx_trade_items_trade ON trade_items(trade_id);

-- ─── Friendships ──────────────────────────────────────────────────────────────

CREATE TABLE friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        friendship_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_friendship_parties CHECK (requester_id != addressee_id)
);

CREATE UNIQUE INDEX idx_friendships_unique ON friendships(
  LEAST(requester_id, addressee_id),
  GREATEST(requester_id, addressee_id)
);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

-- ─── Forum Categories ─────────────────────────────────────────────────────────

CREATE TABLE forum_categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  icon         TEXT,
  color        TEXT,
  display_order INT NOT NULL DEFAULT 0,
  thread_count INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Forum Threads ────────────────────────────────────────────────────────────

CREATE TABLE forum_threads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id  UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL,
  content      TEXT NOT NULL,
  is_pinned    BOOLEAN NOT NULL DEFAULT false,
  is_locked    BOOLEAN NOT NULL DEFAULT false,
  views_count  INT NOT NULL DEFAULT 0,
  replies_count INT NOT NULL DEFAULT 0,
  likes_count  INT NOT NULL DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_threads_category ON forum_threads(category_id);
CREATE INDEX idx_threads_author ON forum_threads(author_id);
CREATE INDEX idx_threads_pinned ON forum_threads(is_pinned, created_at DESC);
CREATE INDEX idx_threads_title_trgm ON forum_threads USING gin(title gin_trgm_ops);

-- ─── Forum Posts (replies) ────────────────────────────────────────────────────

CREATE TABLE forum_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id   UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_edited   BOOLEAN NOT NULL DEFAULT false,
  likes_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_thread ON forum_posts(thread_id);

-- ─── Forum Post Likes ─────────────────────────────────────────────────────────

CREATE TABLE forum_post_likes (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, post_id)
);

-- ─── Tournaments ──────────────────────────────────────────────────────────────

CREATE TABLE tournaments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  format            tournament_format NOT NULL,
  status            tournament_status NOT NULL DEFAULT 'draft',
  deck_type         deck_type,
  max_participants  INT NOT NULL DEFAULT 32,
  entry_fee         INT NOT NULL DEFAULT 0,
  prize_description TEXT,
  rules             TEXT,
  challonge_id      TEXT,
  challonge_url     TEXT,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ,
  registration_opens_at TIMESTAMPTZ,
  registration_closes_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_starts ON tournaments(starts_at);

-- ─── Tournament Registrations ─────────────────────────────────────────────────

CREATE TABLE tournament_registrations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id  UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  profile_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deck_id        UUID REFERENCES decks(id),
  challonge_participant_id TEXT,
  seed           INT,
  placement      INT,
  is_checked_in  BOOLEAN NOT NULL DEFAULT false,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_tourn_reg_unique ON tournament_registrations(tournament_id, profile_id);
CREATE INDEX idx_tourn_reg_tournament ON tournament_registrations(tournament_id);

-- ─── Subscriptions ────────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mp_preapproval_id     TEXT,
  mp_payer_id           TEXT,
  plan_id               TEXT NOT NULL,
  status                subscription_status NOT NULL DEFAULT 'free',
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_subscriptions_profile ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_mp ON subscriptions(mp_preapproval_id);

-- ─── Subscription Events (webhook log) ───────────────────────────────────────

CREATE TABLE subscription_events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id  UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type       TEXT NOT NULL,
  mp_data          JSONB DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sub_events_subscription ON subscription_events(subscription_id);

-- ─── Notifications ────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}'::jsonb,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_profile ON notifications(profile_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(profile_id, is_read) WHERE is_read = false;

-- ─── Reports ──────────────────────────────────────────────────────────────────

CREATE TABLE reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type  report_type NOT NULL,
  target_id    UUID NOT NULL,
  reason       TEXT NOT NULL,
  details      TEXT,
  status       report_status NOT NULL DEFAULT 'pending',
  resolved_by  UUID REFERENCES profiles(id),
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

-- ─── Audit Log ────────────────────────────────────────────────────────────────

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}'::jsonb,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'games', 'expansions', 'cards', 'profiles', 'physical_inventory',
    'decks', 'marketplace_listings', 'marketplace_offers', 'trades',
    'friendships', 'forum_threads', 'forum_posts', 'tournaments', 'subscriptions'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment/decrement forum thread count on category
CREATE OR REPLACE FUNCTION update_category_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_categories SET thread_count = thread_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_categories SET thread_count = thread_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_thread_count
  AFTER INSERT OR DELETE ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION update_category_thread_count();

-- Increment/decrement reply count on thread
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads
    SET replies_count = replies_count + 1,
        last_reply_at = now()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads SET replies_count = replies_count - 1 WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reply_count
  AFTER INSERT OR DELETE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Deck likes counter
CREATE OR REPLACE FUNCTION update_deck_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE decks SET likes_count = likes_count + 1 WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE decks SET likes_count = likes_count - 1 WHERE id = OLD.deck_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deck_likes
  AFTER INSERT OR DELETE ON deck_likes
  FOR EACH ROW EXECUTE FUNCTION update_deck_likes_count();

-- Post likes counter
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_likes
  AFTER INSERT OR DELETE ON forum_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- =============================================================================
-- SEED DATA — Forum Categories
-- =============================================================================

INSERT INTO forum_categories (name, slug, description, icon, color, display_order) VALUES
  ('General',       'general',      'Discusión general sobre Kingdom TCG',       'MessageSquare', 'blue',   1),
  ('Estrategias',   'estrategias',  'Estrategias, combos y meta discussion',     'Swords',        'purple', 2),
  ('Noticias',      'noticias',     'Novedades y anuncios oficiales',            'Newspaper',     'green',  3),
  ('Guías',         'guias',        'Tutoriales y guías para principiantes',     'BookOpen',      'amber',  4),
  ('Intercambios',  'intercambios', 'Buscá y ofrecé cartas para intercambiar',   'RefreshCw',     'teal',   5),
  ('Torneos',       'torneos',      'Discusión sobre torneos y ligas',           'Trophy',        'orange', 6),
  ('Lore',          'lore',         'Historia, lore y worldbuilding del juego',  'Scroll',        'rose',   7);

-- =============================================================================
-- SEED DATA — Initial Game
-- =============================================================================

INSERT INTO games (name, slug, description) VALUES
  ('Kingdom TCG', 'kingdom-tcg', 'Kingdom Trading Card Game — El juego de cartas coleccionables del reino.');
