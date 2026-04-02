// ─── Shared action types (no "use server" — safe to import anywhere) ──────────

export type NotificationCategory = "trades" | "singles" | "friends" | "forum" | "system";

export interface NotificationPreferences {
  trades: boolean;
  singles: boolean;
  friends: boolean;
  forum: boolean;
  system: boolean;
}

export interface AuthActionResult {
  error?: string;
  success?: boolean;
  redirectUrl?: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  newUsersLast7d: number;
  totalCards: number;
  premiumUsers: number;
  totalListings: number;
  activeListings: number;
  pendingReports: number;
  totalTrades: number;
  activeTrades: number;
  totalForumThreads: number;
  totalForumPosts: number;
  totalSinglesProducts: number;
  singlesInStock: number;
  lastSyncStatus: string | null;
  lastSyncAt: string | null;
}

export type UserRole = "user" | "moderator" | "admin";

export interface TnOrder {
  id: number;
  status: string;
  payment_status: string | null;
  shipping_status: string | null;
  gateway: string | null;
  currency: string;
  total: number | null;
  subtotal: number | null;
  discount: number | null;
  shipping_cost: number | null;
  customer_email: string | null;
  customer_name: string | null;
  line_items: TnLineItem[];
  shipping_address: TnAddress | null;
  tracking_number: string | null;
  tracking_url: string | null;
  tn_created_at: string | null;
  tn_updated_at: string | null;
  synced_at: string;
}

export interface TnLineItem {
  id: number;
  variant_id: number | null;
  product_id: number | null;
  name: string;
  price: string;
  quantity: number;
  sku: string | null;
}

export interface TnAddress {
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zipcode: string | null;
}
