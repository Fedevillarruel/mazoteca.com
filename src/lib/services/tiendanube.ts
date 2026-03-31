/**
 * Tiendanube API Service
 * Docs: https://tiendanube.github.io/api-documentation/
 *
 * App ID:     28885
 * Secret:     stored in TIENDANUBE_CLIENT_SECRET env var
 * Store ID:   stored in TIENDANUBE_STORE_ID env var
 * Token:      stored in TIENDANUBE_ACCESS_TOKEN env var
 * Domain:     stored in TIENDANUBE_STORE_DOMAIN env var (e.g. mitienda.mitiendanube.com)
 */

const TN_STORE_ID = process.env.TIENDANUBE_STORE_ID!;
const TN_ACCESS_TOKEN = process.env.TIENDANUBE_ACCESS_TOKEN!;
const TN_APP_ID = "28885";

const BASE_URL = `https://api.tiendanube.com/v1/${TN_STORE_ID}`;

const TN_HEADERS = {
  Authentication: `bearer ${TN_ACCESS_TOKEN}`,
  "User-Agent": `Mazoteca (integraciones@fedini.app) AppId/${TN_APP_ID}`,
  "Content-Type": "application/json",
};

// ── Types ────────────────────────────────────────────────────

export interface TNImage {
  id: number;
  src: string;
  position: number;
}

export interface TNVariant {
  id: number;
  product_id: number;
  price: string;
  compare_at_price: string | null;   // precio tachado (precio original)
  promotional_price: string | null;  // precio con descuento (si aplica)
  stock_management: boolean;
  stock: number | null;
  sku: string | null;
  values: { es: string }[];
  image_id: number | null;
}

export interface TNProduct {
  id: number;
  name: { es: string };
  description: { es: string } | null;
  handle: { es: string };
  published: boolean;
  variants: TNVariant[];
  images: TNImage[];
  tags: string;
  updated_at: string;
  created_at: string;
  categories?: TNCategory[]; // categorías asignadas al producto en TN
}

export interface TNProductsPage {
  products: TNProduct[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// ── API calls ────────────────────────────────────────────────

async function tnFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...TN_HEADERS,
      ...options?.headers,
    },
    next: { revalidate: 0 }, // always fresh for sync
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Tiendanube API error ${res.status} ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

/** Fetch one page of products (max 200 per page) */
export async function fetchProductsPage(
  page = 1,
  perPage = 200
): Promise<TNProductsPage> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    // Only published products for the public view; but for sync we want all
    // Remove this filter if you also want to sync unpublished products
  });

  const products = await tnFetch<TNProduct[]>(`/products?${params}`);

  return {
    products,
    total: products.length, // TN returns X-Total-Count header — simplified here
    page,
    perPage,
    hasMore: products.length === perPage,
  };
}

/** Fetch ALL products by paginating automatically */
export async function fetchAllProducts(): Promise<TNProduct[]> {
  const all: TNProduct[] = [];
  let page = 1;

  while (true) {
    const { products, hasMore } = await fetchProductsPage(page, 200);
    all.push(...products);
    if (!hasMore) break;
    page++;
  }

  return all;
}

/** Fetch a single product by TN id */
export async function fetchProduct(productId: number): Promise<TNProduct> {
  return tnFetch<TNProduct>(`/products/${productId}`);
}

/** Fetch variants for a product */
export async function fetchVariants(productId: number): Promise<TNVariant[]> {
  return tnFetch<TNVariant[]>(`/products/${productId}/variants`);
}

/**
 * Extract card code from a TN product.
 * Strategy (in order):
 *  1. Product tags contain a code like "KT001", "KC001", etc.
 *  2. Product name in Spanish contains the code in brackets: "[KT001]"
 *  3. Handle/slug contains the code
 *  4. First variant SKU looks like a card code
 */
/**
 * Extract card code from a TN product — no normalization, taken exactly as stored in TN tags.
 * Strategy (in order):
 *  1. Product tags (most reliable — manually set in TN, e.g. "KA000001")
 *  2. Product name contains a code
 *  3. Handle/slug contains a code
 *  4. First variant SKU
 */
export function extractCardCode(product: TNProduct): string | null {
  // Matches 2 prefix letters + 3 to 9 digits (no normalization of zeros)
  const cardCodeRegex = /\b(K[TCREPA][0-9]{3,9})\b/i;

  // 1. Tags — taken exactly as stored in TN
  if (product.tags) {
    const m = product.tags.match(cardCodeRegex);
    if (m) return m[1].toUpperCase();
  }

  // 2. Name
  const name = product.name?.es ?? "";
  const mName = name.match(cardCodeRegex);
  if (mName) return mName[1].toUpperCase();

  // 3. Handle
  const handle = product.handle?.es ?? "";
  const mHandle = handle.match(cardCodeRegex);
  if (mHandle) return mHandle[1].toUpperCase();

  // 4. First variant SKU
  for (const v of product.variants ?? []) {
    if (v.sku) {
      const mSku = v.sku.match(cardCodeRegex);
      if (mSku) return mSku[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Returns the variant option values exactly as loaded in TN (e.g. "Foil / Near Mint").
 * Empty if the product has no attributes.
 */
export function extractFinish(variant: TNVariant): string | null {
  if (variant.values && variant.values.length > 0) {
    return variant.values.map((v) => v.es).join(" / ");
  }
  return null;
}

/** Returns the condition exactly as set in TN variant values, or null. */
export function extractCondition(variant: TNVariant): string | null {
  // Condition is conventionally the second value option, if present
  if (variant.values && variant.values.length >= 2) {
    return variant.values[1].es ?? null;
  }
  return null;
}

// ── Store info ───────────────────────────────────────────────

export interface TNStore {
  id: number;
  name: string;
  original_domain: string; // e.g. "mitienda.mitiendanube.com"
  domains: { url: string; main: boolean }[];
}

/** Fetch store info (to get the store domain) */
export async function fetchStoreInfo(): Promise<TNStore> {
  return tnFetch<TNStore>(`/store`);
}

// ── Categories ───────────────────────────────────────────────

export interface TNCategory {
  id: number;
  name: { es: string };
  handle: { es: string };
  parent: number | null; // 0 = root
  subcategories: number[];
}

/**
 * Hierarchical game/subcategory tree, derived from TN categories.
 * Root categories (parent = 0) = Juegos (ej: "Kingdom TCG")
 * Children = Subcategorías (ej: "Arroje", "Tropas", etc.)
 */
export interface TNGameTree {
  id: number;
  name: string;
  handle: string;
  subcategories: { id: number; name: string; handle: string }[];
}

/** Fetch all TN store categories and return them as a game/subcategory tree */
export async function fetchGameCategories(): Promise<TNGameTree[]> {
  const all = await tnFetch<TNCategory[]>(`/categories?per_page=200`);

  // Build a map for quick lookup
  const byId = new Map(all.map((c) => [c.id, c]));

  // Root categories = parent is 0 or null
  const roots = all.filter((c) => !c.parent || c.parent === 0);

  return roots.map((root) => ({
    id: root.id,
    name: root.name.es,
    handle: root.handle.es,
    subcategories: (root.subcategories ?? [])
      .map((subId) => byId.get(subId))
      .filter((c): c is TNCategory => !!c)
      .map((c) => ({ id: c.id, name: c.name.es, handle: c.handle.es })),
  }));
}

// ── Checkout URL helpers ─────────────────────────────────────

/**
 * Returns a direct-to-checkout URL for a specific variant.
 *
 * Tiendanube checkout v3:
 *   POST /checkout/v3/start  (with form data) — not linkable directly
 *
 * Best deep-link option: ?add-to-cart={variantId} on store root,
 * then redirect to cart. But TN also supports:
 *   /cart/add?id={variantId}&quantity=1  → adds to cart and goes to cart page
 *
 * We use /cart/add which is the most reliable cross-store deep link.
 */
export function getCheckoutUrl(variantId: number | string, fallbackHandle?: string | null): string {
  const domain = process.env.TIENDANUBE_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_TN_STORE_DOMAIN;

  if (domain) {
    const base = domain.startsWith("http") ? domain : `https://${domain}`;
    return `${base}/cart/add?id=${variantId}&quantity=1&redirect_to=checkout`;
  }

  if (fallbackHandle) {
    return `https://www.tiendanube.com/productos/${fallbackHandle}`;
  }

  return "#";
}
