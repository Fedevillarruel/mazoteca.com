import { createClient } from "@/lib/supabase/server";

// =============================================================================
// Cards
// =============================================================================

interface CardFilters {
  search?: string;
  expansion_id?: string;
  rarity?: string;
  type?: string;
  kingdom?: string;
  page?: number;
  perPage?: number;
  sort?: "name" | "number" | "rarity" | "newest";
}

export async function getCards(filters: CardFilters = {}) {
  const supabase = await createClient();
  const { page = 1, perPage = 24, sort = "number" } = filters;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("cards")
    .select("*, expansion:expansions(name, slug, code)", { count: "exact" })
    .eq("is_active", true);

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.expansion_id) {
    query = query.eq("expansion_id", filters.expansion_id);
  }
  if (filters.rarity) {
    query = query.eq("rarity", filters.rarity);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.kingdom) {
    query = query.eq("kingdom", filters.kingdom);
  }

  switch (sort) {
    case "name":
      query = query.order("name");
      break;
    case "rarity":
      query = query.order("rarity");
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("number");
  }

  const { data, count, error } = await query.range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize: perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export async function getCardBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cards")
    .select("*, expansion:expansions(*), variants:card_variants(*)")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// Decks
// =============================================================================

export async function getPublicDecks(page = 1, perPage = 12) {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("decks")
    .select("*, profile:profiles(username, avatar_url), deck_cards(card_id, quantity)", { count: "exact" })
    .eq("is_public", true)
    .order("likes_count", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize: perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export async function getUserDecks(profileId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("decks")
    .select("*, deck_cards(card_id, quantity)")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDeckById(deckId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("decks")
    .select(`
      *,
      profile:profiles(username, avatar_url),
      crowned:cards!decks_crowned_id_fkey(*),
      deck_cards(
        quantity,
        card:cards(*)
      )
    `)
    .eq("id", deckId)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// Marketplace
// =============================================================================

export async function getActiveListings(page = 1, perPage = 20) {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("marketplace_listings")
    .select(`
      *,
      card:cards(name, slug, image_url, rarity),
      variant:card_variants(finish),
      seller:profiles(username, avatar_url, reputation)
    `, { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize: perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export async function getListingById(listingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(`
      *,
      card:cards(*, expansion:expansions(name, code)),
      variant:card_variants(finish, image_url),
      seller:profiles(username, avatar_url, reputation, total_sales, location)
    `)
    .eq("id", listingId)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// Forum
// =============================================================================

export async function getForumCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("forum_categories")
    .select("*")
    .order("display_order");

  if (error) throw error;
  return data || [];
}

export async function getThreadsByCategory(categoryId: string, page = 1, perPage = 20) {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("forum_threads")
    .select("*, author:profiles(username, avatar_url)", { count: "exact" })
    .eq("category_id", categoryId)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize: perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export async function getThreadById(threadId: string) {
  const supabase = await createClient();

  // Increment view count (fire-and-forget, best effort)
  try {
    // Note: In production, create an RPC function "increment_thread_views" in Supabase
    // For now, we just fetch without incrementing
  } catch {
    // Silently ignore view count errors
  }

  const { data, error } = await supabase
    .from("forum_threads")
    .select("*, author:profiles(username, avatar_url), category:forum_categories(name, slug)")
    .eq("id", threadId)
    .single();

  if (error) throw error;
  return data;
}

export async function getThreadPosts(threadId: string, page = 1, perPage = 25) {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("forum_posts")
    .select("*, author:profiles(username, avatar_url)", { count: "exact" })
    .eq("thread_id", threadId)
    .order("created_at")
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize: perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

// =============================================================================
// Tournaments
// =============================================================================

export async function getTournaments(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("tournaments")
    .select("*, organizer:profiles(username)")
    .order("starts_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// =============================================================================
// Profile
// =============================================================================

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// Notifications
// =============================================================================

export async function getNotifications(profileId: string, page = 1, perPage = 20) {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize: perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export async function getUnreadNotificationCount(profileId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("is_read", false);

  if (error) throw error;
  return count || 0;
}
