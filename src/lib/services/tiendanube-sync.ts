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

async function upsertProduct(product: TNProduct) {
  const supabase = createAdminClient();

  const cardCode = extractCardCode(product);

  // 1. Upsert product row
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

  // 2. Upsert each variant as its own row
  const primaryImage = product.images?.[0]?.src ?? null;

  for (const variant of product.variants ?? []) {
    // Find the image for this variant if it has one
    const variantImage =
      product.images?.find((img) => img.id === variant.image_id)?.src ??
      primaryImage;

    await supabase.from("tiendanube_variants").upsert(
      {
        id: variant.id,
        product_id: product.id,
        card_code: cardCode,
        sku: variant.sku ?? null,
        finish: extractFinish(variant),
        condition: extractCondition(variant),
        price: variant.price ? Number(variant.price) : null,
        promotional_price: variant.promotional_price
          ? Number(variant.promotional_price)
          : null,
        stock: variant.stock_management ? variant.stock : 999,
        image_url: variantImage,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }

  // 3. Remove variants that no longer exist in TN
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
    .gt("stock", 0)
    .order("price", { ascending: true });

  return data ?? [];
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
