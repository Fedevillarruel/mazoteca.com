-- =============================================================================
-- Mazoteca — Row Level Security Policies
-- =============================================================================
-- Run AFTER 001_initial_schema.sql
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE expansions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Helper: Check if current user is admin
-- =============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_moderator_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- PUBLIC READ — Games, Expansions, Cards, Card Variants, Forum Categories
-- =============================================================================

-- Games
CREATE POLICY "games_select_all" ON games FOR SELECT USING (true);
CREATE POLICY "games_admin_all" ON games FOR ALL USING (is_admin());

-- Expansions
CREATE POLICY "expansions_select_all" ON expansions FOR SELECT USING (true);
CREATE POLICY "expansions_admin_all" ON expansions FOR ALL USING (is_admin());

-- Cards
CREATE POLICY "cards_select_all" ON cards FOR SELECT USING (true);
CREATE POLICY "cards_admin_all" ON cards FOR ALL USING (is_admin());

-- Card Variants
CREATE POLICY "variants_select_all" ON card_variants FOR SELECT USING (true);
CREATE POLICY "variants_admin_all" ON card_variants FOR ALL USING (is_admin());

-- Forum Categories
CREATE POLICY "forum_cats_select_all" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "forum_cats_admin_all" ON forum_categories FOR ALL USING (is_admin());

-- =============================================================================
-- PROFILES
-- =============================================================================

CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (
    profile_visibility = 'public'
    OR id = auth.uid()
    OR is_moderator_or_admin()
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can update any profile
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_admin());

-- =============================================================================
-- DIGITAL INVENTORY
-- =============================================================================

CREATE POLICY "digital_inv_select_own" ON digital_inventory
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "digital_inv_select_public" ON digital_inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = digital_inventory.profile_id
      AND collection_visibility = 'public'
    )
  );

CREATE POLICY "digital_inv_insert_own" ON digital_inventory
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "digital_inv_update_own" ON digital_inventory
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "digital_inv_delete_own" ON digital_inventory
  FOR DELETE USING (profile_id = auth.uid());

-- =============================================================================
-- PHYSICAL INVENTORY
-- =============================================================================

CREATE POLICY "physical_inv_select_own" ON physical_inventory
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "physical_inv_insert_own" ON physical_inventory
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "physical_inv_update_own" ON physical_inventory
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "physical_inv_delete_own" ON physical_inventory
  FOR DELETE USING (profile_id = auth.uid());

-- =============================================================================
-- WISHLISTS
-- =============================================================================

CREATE POLICY "wishlists_select_own" ON wishlists
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "wishlists_manage_own" ON wishlists
  FOR ALL USING (profile_id = auth.uid());

-- =============================================================================
-- DECKS & DECK CARDS
-- =============================================================================

CREATE POLICY "decks_select_public" ON decks
  FOR SELECT USING (is_public = true OR profile_id = auth.uid());

CREATE POLICY "decks_insert_own" ON decks
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "decks_update_own" ON decks
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "decks_delete_own" ON decks
  FOR DELETE USING (profile_id = auth.uid());

CREATE POLICY "deck_cards_select" ON deck_cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND (decks.is_public = true OR decks.profile_id = auth.uid())
    )
  );

CREATE POLICY "deck_cards_manage_own" ON deck_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.profile_id = auth.uid()
    )
  );

-- Deck Likes
CREATE POLICY "deck_likes_select" ON deck_likes FOR SELECT USING (true);
CREATE POLICY "deck_likes_manage_own" ON deck_likes
  FOR ALL USING (profile_id = auth.uid());

-- =============================================================================
-- MARKETPLACE
-- =============================================================================

CREATE POLICY "listings_select_active" ON marketplace_listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "listings_insert_own" ON marketplace_listings
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "listings_update_own" ON marketplace_listings
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "listings_delete_own" ON marketplace_listings
  FOR DELETE USING (seller_id = auth.uid());

CREATE POLICY "listings_admin_all" ON marketplace_listings FOR ALL USING (is_admin());

-- Offers
CREATE POLICY "offers_select_involved" ON marketplace_offers
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE id = marketplace_offers.listing_id
      AND seller_id = auth.uid()
    )
  );

CREATE POLICY "offers_insert_buyer" ON marketplace_offers
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "offers_update_involved" ON marketplace_offers
  FOR UPDATE USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM marketplace_listings
      WHERE id = marketplace_offers.listing_id
      AND seller_id = auth.uid()
    )
  );

-- =============================================================================
-- TRADES
-- =============================================================================

CREATE POLICY "trades_select_involved" ON trades
  FOR SELECT USING (proposer_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "trades_insert_proposer" ON trades
  FOR INSERT WITH CHECK (proposer_id = auth.uid());

CREATE POLICY "trades_update_involved" ON trades
  FOR UPDATE USING (proposer_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "trade_items_select" ON trade_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_items.trade_id
      AND (trades.proposer_id = auth.uid() OR trades.receiver_id = auth.uid())
    )
  );

CREATE POLICY "trade_items_manage" ON trade_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_items.trade_id
      AND trades.proposer_id = auth.uid()
    )
  );

-- =============================================================================
-- FRIENDSHIPS
-- =============================================================================

CREATE POLICY "friendships_select_involved" ON friendships
  FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "friendships_insert" ON friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "friendships_update_involved" ON friendships
  FOR UPDATE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "friendships_delete_involved" ON friendships
  FOR DELETE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- =============================================================================
-- FORUM THREADS & POSTS
-- =============================================================================

CREATE POLICY "threads_select_all" ON forum_threads FOR SELECT USING (true);

CREATE POLICY "threads_insert_auth" ON forum_threads
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "threads_update_own" ON forum_threads
  FOR UPDATE USING (author_id = auth.uid() OR is_moderator_or_admin());

CREATE POLICY "threads_delete_mod" ON forum_threads
  FOR DELETE USING (author_id = auth.uid() OR is_moderator_or_admin());

CREATE POLICY "posts_select_all" ON forum_posts FOR SELECT USING (true);

CREATE POLICY "posts_insert_auth" ON forum_posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_update_own" ON forum_posts
  FOR UPDATE USING (author_id = auth.uid() OR is_moderator_or_admin());

CREATE POLICY "posts_delete_mod" ON forum_posts
  FOR DELETE USING (author_id = auth.uid() OR is_moderator_or_admin());

-- Post Likes
CREATE POLICY "post_likes_select" ON forum_post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_manage" ON forum_post_likes
  FOR ALL USING (profile_id = auth.uid());

-- =============================================================================
-- TOURNAMENTS
-- =============================================================================

CREATE POLICY "tournaments_select_all" ON tournaments FOR SELECT USING (true);

CREATE POLICY "tournaments_admin_manage" ON tournaments
  FOR ALL USING (is_moderator_or_admin());

CREATE POLICY "tourn_reg_select" ON tournament_registrations FOR SELECT USING (true);

CREATE POLICY "tourn_reg_insert_own" ON tournament_registrations
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "tourn_reg_update_own" ON tournament_registrations
  FOR UPDATE USING (profile_id = auth.uid() OR is_moderator_or_admin());

CREATE POLICY "tourn_reg_delete_own" ON tournament_registrations
  FOR DELETE USING (profile_id = auth.uid() OR is_moderator_or_admin());

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "subscriptions_admin_all" ON subscriptions
  FOR ALL USING (is_admin());

CREATE POLICY "sub_events_select_own" ON subscription_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE id = subscription_events.subscription_id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "sub_events_admin_all" ON subscription_events
  FOR ALL USING (is_admin());

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (profile_id = auth.uid());

-- =============================================================================
-- REPORTS
-- =============================================================================

CREATE POLICY "reports_insert_auth" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_select_mod" ON reports
  FOR SELECT USING (reporter_id = auth.uid() OR is_moderator_or_admin());

CREATE POLICY "reports_update_mod" ON reports
  FOR UPDATE USING (is_moderator_or_admin());

-- =============================================================================
-- AUDIT LOG
-- =============================================================================

CREATE POLICY "audit_admin_select" ON audit_log
  FOR SELECT USING (is_admin());

CREATE POLICY "audit_admin_insert" ON audit_log
  FOR INSERT WITH CHECK (is_admin());
