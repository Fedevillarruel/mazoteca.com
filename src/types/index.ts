// ============================================================
// Domain Types — Core entities for Mazoteca
// ============================================================

// ---- Enums ----

export type UserRole = "user" | "moderator" | "admin";
export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type CardType = "combatant" | "strategy" | "artifact" | "terrain" | "spell" | "crowned";
export type CardCondition = "mint" | "near_mint" | "excellent" | "good" | "played" | "poor";
export type DeckType = "strategy" | "combatants";
export type ListingStatus = "active" | "sold" | "cancelled" | "expired";
export type ListingType = "fixed_price" | "accepting_offers";
export type OfferStatus = "pending" | "accepted" | "rejected" | "cancelled" | "expired";
export type TradeStatus = "proposed" | "negotiating" | "accepted" | "rejected" | "cancelled" | "completed";
export type FriendshipStatus = "pending" | "accepted" | "rejected" | "blocked";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "paused" | "expired";
export type TournamentStatus = "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled";
export type TournamentFormat = "swiss" | "single_elimination" | "double_elimination" | "round_robin";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
export type NotificationType = 
  | "friend_request" 
  | "friend_accepted" 
  | "trade_proposed" 
  | "trade_updated" 
  | "offer_received" 
  | "offer_accepted"
  | "offer_rejected"
  | "tournament_reminder"
  | "forum_reply"
  | "system";
export type CollectionVisibility = "public" | "friends_only" | "private";

// ---- Core Entities ----

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Expansion {
  id: string;
  game_id: string;
  name: string;
  slug: string;
  code: string; // e.g. "KTG-01"
  description: string | null;
  release_date: string | null;
  logo_url: string | null;
  total_cards: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Card {
  id: string;
  game_id: string;
  expansion_id: string;
  name: string;
  slug: string;
  card_number: string; // e.g. "001"
  card_type: CardType;
  rarity: CardRarity;
  kingdom: string | null; // faction/kingdom
  cost: number | null;
  attack: number | null;
  defense: number | null;
  health: number | null;
  ability_text: string | null;
  flavor_text: string | null;
  keywords: string[];
  image_url: string | null;
  thumbnail_url: string | null;
  artist: string | null;
  is_banned: boolean;
  is_restricted: boolean;
  max_copies_in_deck: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  expansion?: Expansion;
}

export interface CardVariant {
  id: string;
  card_id: string;
  variant_name: string; // e.g. "Foil", "Full Art", "Promo"
  image_url: string | null;
  rarity_override: CardRarity | null;
  created_at: string;
}

// ---- User & Profile ----

export interface Profile {
  id: string; // same as auth user id
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  is_premium: boolean;
  subscription_status: SubscriptionStatus | null;
  trust_score: number;
  total_trades: number;
  total_sales: number;
  digital_collection_visibility: CollectionVisibility;
  physical_collection_visibility: CollectionVisibility;
  decks_visibility: CollectionVisibility;
  favorite_game_id: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Inventory ----

export interface DigitalInventoryItem {
  id: string;
  user_id: string;
  card_id: string;
  variant_id: string | null;
  quantity: number;
  obtained_at: string;
  source: "pack_opening" | "daily_reward" | "trade" | "purchase" | "admin_grant";
  card?: Card;
}

export interface PhysicalInventoryItem {
  id: string;
  user_id: string;
  card_id: string;
  variant_id: string | null;
  quantity: number;
  condition: CardCondition;
  notes: string | null;
  is_for_trade: boolean;
  is_for_sale: boolean;
  added_at: string;
  card?: Card;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  card_id: string;
  priority: number; // 1-5
  notes: string | null;
  created_at: string;
  card?: Card;
}

// ---- Decks ----

export interface Deck {
  id: string;
  user_id: string;
  game_id: string;
  name: string;
  slug: string;
  description: string | null;
  deck_type: DeckType;
  is_public: boolean;
  is_valid: boolean;
  card_count: number;
  cover_card_id: string | null;
  notes: string | null;
  tags: string[];
  likes_count: number;
  copies_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  user?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name">;
  cover_card?: Card;
  cards?: DeckCard[];
}

export interface DeckCard {
  id: string;
  deck_id: string;
  card_id: string;
  quantity: number;
  is_crowned: boolean;
  sort_order: number;
  card?: Card;
}

// ---- Marketplace ----

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  card_id: string;
  variant_id: string | null;
  listing_type: ListingType;
  price: number | null; // in cents
  currency: string;
  quantity: number;
  condition: CardCondition;
  description: string | null;
  photo_urls: string[];
  status: ListingStatus;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  // Joined
  seller?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name" | "trust_score">;
  card?: Card;
}

export interface MarketplaceOffer {
  id: string;
  listing_id: string;
  buyer_id: string;
  amount: number; // in cents
  currency: string;
  message: string | null;
  status: OfferStatus;
  created_at: string;
  responded_at: string | null;
  // Joined
  buyer?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name" | "trust_score">;
  listing?: MarketplaceListing;
}

// ---- Trades ----

export interface Trade {
  id: string;
  proposer_id: string;
  receiver_id: string;
  status: TradeStatus;
  proposer_message: string | null;
  receiver_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // Joined
  proposer?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name" | "trust_score">;
  receiver?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name" | "trust_score">;
  proposer_items?: TradeItem[];
  receiver_items?: TradeItem[];
}

export interface TradeItem {
  id: string;
  trade_id: string;
  user_id: string;
  card_id: string;
  variant_id: string | null;
  quantity: number;
  card?: Card;
}

// ---- Social / Friends ----

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  // Joined
  requester?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name">;
  addressee?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name">;
}

// ---- Forum ----

export interface ForumCategory {
  id: string;
  game_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  parent_id: string | null;
  thread_count: number;
  post_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ForumThread {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  views_count: number;
  replies_count: number;
  likes_count: number;
  tags: string[];
  last_reply_at: string | null;
  last_reply_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  author?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name" | "role" | "is_premium">;
  category?: ForumCategory;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  is_solution: boolean;
  likes_count: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  author?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name" | "role" | "is_premium">;
}

// ---- Tournaments ----

export interface Tournament {
  id: string;
  game_id: string;
  organizer_id: string;
  challonge_id: string | null;
  challonge_url: string | null;
  name: string;
  slug: string;
  description: string | null;
  format: TournamentFormat;
  deck_type: DeckType | null;
  status: TournamentStatus;
  max_participants: number | null;
  current_participants: number;
  entry_fee: number | null;
  prize_description: string | null;
  rules: string | null;
  banner_url: string | null;
  starts_at: string;
  registration_closes_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  organizer?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name">;
  game?: Game;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  deck_id: string | null;
  status: "registered" | "checked_in" | "dropped" | "disqualified";
  seed: number | null;
  final_standing: number | null;
  registered_at: string;
  // Joined
  user?: Pick<Profile, "id" | "username" | "avatar_url" | "display_name">;
  deck?: Pick<Deck, "id" | "name" | "deck_type">;
}

// ---- Subscriptions ----

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  mp_subscription_id: string | null;
  mp_payer_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionEvent {
  id: string;
  subscription_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

// ---- Notifications ----

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ---- Reports ----

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  entity_type: "listing" | "trade" | "thread" | "post" | "profile";
  entity_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  moderator_id: string | null;
  moderator_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

// ---- Audit ----

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ---- Utility Types ----

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FilterState {
  search: string;
  kingdom: string | null;
  cardType: CardType | null;
  rarity: CardRarity | null;
  expansionId: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}
