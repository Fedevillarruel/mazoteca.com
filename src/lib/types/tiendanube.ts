// ── Tiendanube sync types (NO "use server") ─────────────────
// Keep this file free of "use server" so it can be imported from
// anywhere: server components, client components, and server actions.

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  noCode: number;
  noMatch: number;
  errors: { productId: number; name: string; error: string }[];
  unmatched: { productId: number; name: string; rawCode: string | null }[];
  error?: string;
}

export interface CatalogSingleEntry {
  card_code: string;
  min_price: number | null;
  max_price: number | null;
  promotional_price: number | null;
  total_stock: number;
  image_url: string | null;
  all_images: string[];
  handle: string | null;
  variant_ids: number[];
  tn_game: string | null;
}
