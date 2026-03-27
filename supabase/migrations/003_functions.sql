-- =============================================================================
-- Mazoteca — Additional SQL Functions
-- =============================================================================
-- Run AFTER 001_initial_schema.sql
-- =============================================================================

-- Atomic increment for thread views
CREATE OR REPLACE FUNCTION increment_thread_views(thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_threads
  SET views_count = views_count + 1
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic increment for listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_listings
  SET views_count = views_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate deck card count
CREATE OR REPLACE FUNCTION validate_deck(deck_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_deck RECORD;
  v_total INT;
BEGIN
  SELECT * INTO v_deck FROM decks WHERE id = deck_id;
  IF NOT FOUND THEN RETURN false; END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO v_total
  FROM deck_cards WHERE deck_cards.deck_id = deck_id;

  IF v_deck.deck_type = 'combatants' THEN
    -- 33 cards + 1 crowned
    RETURN v_total = 33 AND v_deck.crowned_id IS NOT NULL;
  ELSIF v_deck.deck_type = 'strategy' THEN
    -- 30 cards exactly
    RETURN v_total = 30;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-validate deck on card changes
CREATE OR REPLACE FUNCTION auto_validate_deck()
RETURNS TRIGGER AS $$
DECLARE
  v_deck_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_deck_id := OLD.deck_id;
  ELSE
    v_deck_id := NEW.deck_id;
  END IF;

  UPDATE decks SET is_valid = validate_deck(v_deck_id) WHERE id = v_deck_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_validate_deck
  AFTER INSERT OR UPDATE OR DELETE ON deck_cards
  FOR EACH ROW EXECUTE FUNCTION auto_validate_deck();

-- Get collection completion stats for a user/expansion
CREATE OR REPLACE FUNCTION get_collection_stats(p_profile_id UUID, p_expansion_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_cards BIGINT,
  owned_cards BIGINT,
  completion_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT c.id) AS total_cards,
    COUNT(DISTINCT di.card_id) AS owned_cards,
    CASE
      WHEN COUNT(DISTINCT c.id) = 0 THEN 0
      ELSE ROUND(COUNT(DISTINCT di.card_id)::NUMERIC / COUNT(DISTINCT c.id) * 100, 1)
    END AS completion_percentage
  FROM cards c
  LEFT JOIN digital_inventory di ON di.card_id = c.id AND di.profile_id = p_profile_id
  WHERE c.is_active = true
    AND (p_expansion_id IS NULL OR c.expansion_id = p_expansion_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
