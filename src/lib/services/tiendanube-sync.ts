"use server";

/**
 * Tiendanube → Supabase sync service
 * Called by:
 *  - /api/tiendanube/sync (cron or manual trigger)
 *  - /api/tiendanube/webhook (real-time product updates)
 */

import { createAdminClient } from "@/lib/supabase/server";
import {
  fetchAllProducts,
  fetchProduct,
  extractCardCode,
  extractFinish,
  extractCondition,
  type TNProduct,
} from "./tiendanube";

// ── Full sync ────────────────────────────────────────────────

export async function syncAllProducts(trigger: "cron" | "manual" = "manual") {
  const supabase = createAdminClient();

  // Create sync log entry
  const { data: logEntry } = await supabase
    .from("tiendanube_sync_log")
    .insert({ trigger, status: "running" })
    .select("id")
    .single();

  const logId = logEntry?.id;

  try {
    const products = await fetchAllProducts();
    let synced = 0;

    for (const product of products) {
      await upsertProduct(product);
      synced++;
    }

    // Mark success
    if (logId) {
      await supabase
        .from("tiendanube_sync_log")
        .update({
          status: "success",
          products_synced: synced,
          finished_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    return { success: true, synced };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[syncAllProducts]", msg);

    if (logId) {
      await supabase
        .from("tiendanube_sync_log")
        .update({
          status: "error",
          error_msg: msg,
          finished_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    return { success: false, error: msg };
  }
}

// ── Single product sync (used by webhook) ───────────────────

export async function syncSingleProduct(productId: number) {
  const supabase = createAdminClient();

  try {
    const product = await fetchProduct(productId);
    await upsertProduct(product);

    // Log the webhook sync
    await supabase.from("tiendanube_sync_log").insert({
      trigger: "webhook",
      status: "success",
      products_synced: 1,
      finished_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[syncSingleProduct]", productId, msg);

    await supabase.from("tiendanube_sync_log").insert({
      trigger: "webhook",
      status: "error",
      error_msg: msg,
      finished_at: new Date().toISOString(),
    });

    return { success: false, error: msg };
  }
}

// ── Delete a product from cache ──────────────────────────────

export async function deleteProduct(productId: number) {
  const supabase = createAdminClient();

  // variants cascade via FK
  await supabase
    .from("tiendanube_products")
    .delete()
    .eq("id", productId);

  return { success: true };
}

// ── Upsert helpers ───────────────────────────────────────────

/**
 * Normaliza el tag de TN (ej. "KA000001") al código de FK de cards (ej. "KA001").
 * cards.code usa padStart(3), TN puede usar padStart(6) u otras variantes.
 */
function toCardsFKCode(raw: string | null): string | null {
  if (!raw) return null;
  const m = raw.match(/^(K[TCREPA])0*(\d+)$/i);
  if (!m) return raw.toUpperCase();
  return (m[1] + m[2].padStart(3, "0")).toUpperCase();
}

async function upsertProduct(product: TNProduct) {
  const supabase = createAdminClient();

  const tnTag = extractCardCode(product);       // tag exacto de TN: "KA000001"
  const cardCode = toCardsFKCode(tnTag);        // normalizado para FK: "KA001"

  // 1. Upsert product row — guardamos todo tal cual viene de TN
  await supabase.from("tiendanube_products").upsert(
    {
      id: product.id,
      card_code: cardCode,
      name: product.name?.es ?? `Producto ${product.id}`,
      description: product.description?.es ?? null,
      handle: product.handle?.es ?? null,
      published: product.published,
      variants: product.variants ?? [],
      images: product.images ?? [],
      synced_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  // 2. Upsert cada variante con datos exactos de TN
  const primaryImage = product.images?.[0]?.src ?? null;

  for (const variant of product.variants ?? []) {
    const variantImage =
      product.images?.find((img) => img.id === variant.image_id)?.src ??
      primaryImage;

    // Stock: si TN no gestiona stock → disponible (stock = 999)
    //        si gestiona → usar el valor real (puede ser 0)
    const stock = variant.stock_management
      ? (variant.stock ?? 0)
      : 999;

    // Precio: en TN, price = precio de venta actual
    //         compare_at_price = precio original tachado (cuando hay descuento)
    //         promotional_price = precio especial (menos común)
    const price = variant.price ? Number(variant.price) : null;
    const compareAtPrice = variant.compare_at_price
      ? Number(variant.compare_at_price)
      : null;
    // Solo guardar precio tachado si es distinto al precio actual
    const promotional_price =
      compareAtPrice && compareAtPrice > price! ? compareAtPrice : null;

    await supabase.from("tiendanube_variants").upsert(
      {
        id: variant.id,
        product_id: product.id,
        card_code: cardCode,
        sku: variant.sku ?? null,
        finish: extractFinish(variant),
        condition: extractCondition(variant),
        price,
        promotional_price,
        stock,
        image_url: variantImage,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }

  // 3. Eliminar variantes que ya no existen en TN
  const currentVariantIds = product.variants?.map((v) => v.id) ?? [];
  if (currentVariantIds.length > 0) {
    await supabase
      .from("tiendanube_variants")
      .delete()
      .eq("product_id", product.id)
      .not("id", "in", `(${currentVariantIds.join(",")})`);
  }
}

// ── Query helpers (used by pages) ───────────────────────────

/**
 * Returns all variants for a card code that exist in the TN store,
 * regardless of stock. Use `variant.stock > 0` to check availability.
 */
export async function getVariantsByCardCode(cardCode: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("tiendanube_variants")
    .select(
      `
      id,
      product_id,
      card_code,
      sku,
      finish,
      condition,
      price,
      promotional_price,
      stock,
      image_url,
      synced_at,
      tiendanube_products!inner (
        id,
        name,
        handle,
        published
      )
    `
    )
    .eq("card_code", cardCode)
    .order("price", { ascending: true });

  return data ?? [];
}

/**
 * Returns the set of card codes that have at least one product in the TN store.
 * Used by the catalog to show "disponible en singles" badges.
 */
export async function getCardCodesInStore(): Promise<Set<string>> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("tiendanube_products")
    .select("card_code")
    .not("card_code", "is", null);

  const codes = new Set<string>();
  for (const row of data ?? []) {
    if (row.card_code) codes.add(row.card_code);
  }
  return codes;
}

export interface CatalogSingleEntry {
  card_code: string;
  min_price: number | null;
  max_price: number | null;
  promotional_price: number | null; // precio tachado (original) si hay descuento
  total_stock: number;
  image_url: string | null;
  all_images: string[];            // todas las imágenes del producto para carrusel
  handle: string | null;
  variant_ids: number[];           // para checkout
}

/**
 * Returns data for all cards currently in the TN store (published=true),
 * regardless of stock. Used by catalog to show only purchasable cards.
 */
export async function getCatalogSingles(): Promise<Map<string, CatalogSingleEntry>> {
  const supabase = createAdminClient();

  // Get all variants for published products
  const { data: variants } = await supabase
    .from("tiendanube_variants")
    .select(`
      id,
      card_code,
      price,
      promotional_price,
      stock,
      image_url,
      tiendanube_products!inner (
        handle,
        images,
        published
      )
    `)
    .eq("tiendanube_products.published", true)
    .not("card_code", "is", null);

  const map = new Map<string, CatalogSingleEntry>();

  for (const v of variants ?? []) {
    const code = v.card_code as string;
    // Supabase returns joined rows as array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tnProduct = Array.isArray(v.tiendanube_products) ? v.tiendanube_products[0] : v.tiendanube_products as any;
    const handle = tnProduct?.handle ?? null;
    const rawImages: { src: string }[] = tnProduct?.images ?? [];
    const allImages = rawImages.map((img) => img.src).filter(Boolean);

    const price = v.price ? Number(v.price) : null;
    const promo = v.promotional_price ? Number(v.promotional_price) : null;

    if (!map.has(code)) {
      map.set(code, {
        card_code: code,
        min_price: price,
        max_price: price,
        promotional_price: promo,
        total_stock: v.stock ?? 0,
        image_url: v.image_url ?? allImages[0] ?? null,
        all_images: allImages,
        handle,
        variant_ids: [v.id],
      });
    } else {
      const entry = map.get(code)!;
      if (price !== null) {
        entry.min_price = Math.min(entry.min_price ?? price, price);
        entry.max_price = Math.max(entry.max_price ?? price, price);
      }
      if (promo !== null && (entry.promotional_price === null || promo > entry.promotional_price)) {
        entry.promotional_price = promo;
      }
      entry.total_stock += v.stock ?? 0;
      if (!entry.image_url && v.image_url) entry.image_url = v.image_url;
      if (entry.all_images.length === 0) entry.all_images = allImages;
      entry.variant_ids.push(v.id);
    }
  }

  return map;
}

export async function getAllPublishedSingles(opts?: {
  limit?: number;
  offset?: number;
  cardCode?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const supabase = createAdminClient();

  let query = supabase
    .from("tiendanube_variants")
    .select(
      `
      id,
      product_id,
      card_code,
      finish,
      condition,
      price,
      promotional_price,
      stock,
      image_url,
      synced_at,
      tiendanube_products!inner (
        id,
        name,
        handle,
        published
      ),
      cards (
        name,
        slug,
        category,
        card_type,
        level,
        edition
      )
    `,
      { count: "exact" }
    )
    .gt("stock", 0)
    .eq("tiendanube_products.published", true);

  if (opts?.cardCode) {
    query = query.eq("card_code", opts.cardCode);
  }
  if (opts?.minPrice != null) {
    query = query.gte("price", opts.minPrice);
  }
  if (opts?.maxPrice != null) {
    query = query.lte("price", opts.maxPrice);
  }

  query = query
    .order("price", { ascending: true })
    .range(opts?.offset ?? 0, (opts?.offset ?? 0) + (opts?.limit ?? 48) - 1);

  const { data, count } = await query;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getSyncStats() {
  const supabase = createAdminClient();

  const [lastSync, productCount, variantCount] = await Promise.all([
    supabase
      .from("tiendanube_sync_log")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(5),
    supabase
      .from("tiendanube_products")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("tiendanube_variants")
      .select("*", { count: "exact", head: true })
      .gt("stock", 0),
  ]);

  return {
    lastSyncs: lastSync.data ?? [],
    totalProducts: productCount.count ?? 0,
    totalVariantsInStock: variantCount.count ?? 0,
  };
}
