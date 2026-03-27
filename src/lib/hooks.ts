"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  Card,
  Deck,
  MarketplaceListing,
  ForumCategory,
  ForumThread,
  ForumPost,
  Tournament,
  Profile,
  Notification,
  Friendship,
  Trade,
  PaginatedResponse,
} from "@/types";

const supabase = createClient();

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
  sort?: string;
}

export function useCards(filters: CardFilters = {}) {
  const { page = 1, perPage = 24, sort = "number" } = filters;

  return useQuery<PaginatedResponse<Card>>({
    queryKey: ["cards", filters],
    queryFn: async () => {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("cards")
        .select("*, expansion:expansions(name, slug, code)", { count: "exact" });

      if (filters.search) query = query.ilike("name", `%${filters.search}%`);
      if (filters.expansion_id) query = query.eq("expansion_id", filters.expansion_id);
      if (filters.rarity) query = query.eq("rarity", filters.rarity);
      if (filters.type) query = query.eq("card_type", filters.type);
      if (filters.kingdom) query = query.eq("kingdom", filters.kingdom);

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
          query = query.order("card_number");
      }

      const { data, count, error } = await query.range(from, to);
      if (error) throw error;

      return {
        data: (data as Card[]) || [],
        count: count || 0,
        page,
        pageSize: perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      };
    },
  });
}

export function useCard(slug: string) {
  return useQuery({
    queryKey: ["card", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*, expansion:expansions(*), variants:card_variants(*)")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Card & { expansion: unknown; variants: unknown[] };
    },
    enabled: !!slug,
  });
}

export function useExpansions() {
  return useQuery({
    queryKey: ["expansions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expansions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Expansions don't change often
  });
}

// =============================================================================
// Decks
// =============================================================================

export function usePublicDecks(page = 1) {
  return useQuery<PaginatedResponse<Deck>>({
    queryKey: ["decks", "public", page],
    queryFn: async () => {
      const perPage = 12;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, count, error } = await supabase
        .from("decks")
        .select(
          "*, user:profiles(username, avatar_url, display_name)",
          { count: "exact" }
        )
        .eq("is_public", true)
        .order("likes_count", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: (data as Deck[]) || [],
        count: count || 0,
        page,
        pageSize: perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      };
    },
  });
}

export function useMyDecks(userId: string | null) {
  return useQuery({
    queryKey: ["decks", "mine", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select("*, deck_cards(card_id, quantity)")
        .eq("user_id", userId!)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data as Deck[]) || [];
    },
    enabled: !!userId,
  });
}

export function useDeck(deckId: string) {
  return useQuery({
    queryKey: ["deck", deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select(
          `*, user:profiles(username, avatar_url, display_name), deck_cards(quantity, card:cards(*))`
        )
        .eq("id", deckId)
        .single();

      if (error) throw error;
      return data as Deck;
    },
    enabled: !!deckId,
  });
}

// =============================================================================
// Marketplace
// =============================================================================

interface ListingFilters {
  page?: number;
  search?: string;
  condition?: string;
  sort?: string;
}

export function useListings(filters: ListingFilters = {}) {
  const { page = 1 } = filters;

  return useQuery<PaginatedResponse<MarketplaceListing>>({
    queryKey: ["listings", filters],
    queryFn: async () => {
      const perPage = 20;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("marketplace_listings")
        .select(
          `*, card:cards(name, slug, image_url, rarity, card_type), seller:profiles(username, avatar_url, trust_score)`,
          { count: "exact" }
        )
        .eq("status", "active");

      if (filters.search) {
        // Search in card name via join — approximate with post filter
        query = query.ilike("card.name", `%${filters.search}%`);
      }
      if (filters.condition) {
        query = query.eq("condition", filters.condition);
      }

      switch (filters.sort) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, count, error } = await query.range(from, to);
      if (error) throw error;

      return {
        data: (data as MarketplaceListing[]) || [],
        count: count || 0,
        page,
        pageSize: perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      };
    },
  });
}

export function useListing(listingId: string) {
  return useQuery({
    queryKey: ["listing", listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select(
          `*, card:cards(*, expansion:expansions(name, code)), seller:profiles(username, avatar_url, trust_score, total_sales, location)`
        )
        .eq("id", listingId)
        .single();

      if (error) throw error;
      return data as MarketplaceListing;
    },
    enabled: !!listingId,
  });
}

// =============================================================================
// Forum
// =============================================================================

export function useForumCategories() {
  return useQuery<ForumCategory[]>({
    queryKey: ["forum-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return (data as ForumCategory[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useForumThreads(categoryId: string, page = 1) {
  return useQuery<PaginatedResponse<ForumThread>>({
    queryKey: ["forum-threads", categoryId, page],
    queryFn: async () => {
      const perPage = 20;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, count, error } = await supabase
        .from("forum_threads")
        .select("*, author:profiles(username, avatar_url, role, is_premium)", {
          count: "exact",
        })
        .eq("category_id", categoryId)
        .order("is_pinned", { ascending: false })
        .order("last_reply_at", { ascending: false, nullsFirst: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: (data as ForumThread[]) || [],
        count: count || 0,
        page,
        pageSize: perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      };
    },
    enabled: !!categoryId,
  });
}

export function useThread(threadId: string) {
  return useQuery({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(
          "*, author:profiles(username, avatar_url, role, is_premium), category:forum_categories(name, slug)"
        )
        .eq("id", threadId)
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    enabled: !!threadId,
  });
}

export function useThreadPosts(threadId: string, page = 1) {
  return useQuery<PaginatedResponse<ForumPost>>({
    queryKey: ["thread-posts", threadId, page],
    queryFn: async () => {
      const perPage = 25;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, count, error } = await supabase
        .from("forum_posts")
        .select("*, author:profiles(username, avatar_url, role, is_premium)", {
          count: "exact",
        })
        .eq("thread_id", threadId)
        .order("created_at")
        .range(from, to);

      if (error) throw error;

      return {
        data: (data as ForumPost[]) || [],
        count: count || 0,
        page,
        pageSize: perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      };
    },
    enabled: !!threadId,
  });
}

// =============================================================================
// Tournaments
// =============================================================================

export function useTournaments(status?: string) {
  return useQuery<Tournament[]>({
    queryKey: ["tournaments", status],
    queryFn: async () => {
      let query = supabase
        .from("tournaments")
        .select("*, organizer:profiles(username, avatar_url)")
        .order("starts_at", { ascending: true });

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return (data as Tournament[]) || [];
    },
  });
}

// =============================================================================
// Profile & Social
// =============================================================================

export function useProfile(username: string) {
  return useQuery<Profile>({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!username,
  });
}

export function useFriends(userId: string | null) {
  return useQuery<Friendship[]>({
    queryKey: ["friends", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select(
          `*, requester:profiles!friendships_requester_id_fkey(id, username, avatar_url, display_name), addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url, display_name)`
        )
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq("status", "accepted")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data as Friendship[]) || [];
    },
    enabled: !!userId,
  });
}

export function useFriendRequests(userId: string | null) {
  return useQuery<Friendship[]>({
    queryKey: ["friend-requests", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select(
          `*, requester:profiles!friendships_requester_id_fkey(id, username, avatar_url, display_name)`
        )
        .eq("addressee_id", userId!)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Friendship[]) || [];
    },
    enabled: !!userId,
  });
}

// =============================================================================
// Trades
// =============================================================================

export function useMyTrades(userId: string | null) {
  return useQuery<Trade[]>({
    queryKey: ["trades", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select(
          `*, proposer:profiles!trades_proposer_id_fkey(id, username, avatar_url, display_name), receiver:profiles!trades_receiver_id_fkey(id, username, avatar_url, display_name)`
        )
        .or(`proposer_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data as Trade[]) || [];
    },
    enabled: !!userId,
  });
}

// =============================================================================
// Notifications
// =============================================================================

export function useNotifications(userId: string | null, page = 1) {
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ["notifications", userId, page],
    queryFn: async () => {
      const perPage = 20;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: (data as Notification[]) || [],
        count: count || 0,
        page,
        pageSize: perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      };
    },
    enabled: !!userId,
  });
}

export function useUnreadNotificationCount(userId: string | null) {
  return useQuery({
    queryKey: ["unread-notifications", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
    refetchInterval: 30_000, // Poll every 30s
  });
}

// =============================================================================
// Collection
// =============================================================================

export function useDigitalCollection(userId: string | null) {
  return useQuery({
    queryKey: ["digital-collection", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_inventory")
        .select("*, card:cards(name, slug, image_url, rarity, card_type, expansion_id)")
        .eq("user_id", userId!)
        .order("obtained_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function usePhysicalCollection(userId: string | null) {
  return useQuery({
    queryKey: ["physical-collection", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physical_inventory")
        .select("*, card:cards(name, slug, image_url, rarity, card_type, expansion_id)")
        .eq("user_id", userId!)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useWishlist(userId: string | null) {
  return useQuery({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("*, card:cards(name, slug, image_url, rarity, card_type)")
        .eq("user_id", userId!)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

// =============================================================================
// Search (global)
// =============================================================================

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return { cards: [], users: [], threads: [] };

      const [cardsResult, usersResult, threadsResult] = await Promise.all([
        supabase
          .from("cards")
          .select("id, name, slug, image_url, rarity")
          .ilike("name", `%${query}%`)
          .limit(5),
        supabase
          .from("profiles")
          .select("id, username, avatar_url, display_name")
          .ilike("username", `%${query}%`)
          .limit(5),
        supabase
          .from("forum_threads")
          .select("id, title, slug")
          .ilike("title", `%${query}%`)
          .limit(5),
      ]);

      return {
        cards: cardsResult.data || [],
        users: usersResult.data || [],
        threads: threadsResult.data || [],
      };
    },
    enabled: query.length >= 2,
    staleTime: 10_000,
  });
}
