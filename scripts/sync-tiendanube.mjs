/**
 * Script de sync manual: TiendaNube → Supabase
 * Uso: node scripts/sync-tiendanube.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

// Leer .env.local
const envPath = resolve(__dir, "../.env.local");
const envVars = {};
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_KEY = envVars["SUPABASE_SERVICE_ROLE_KEY"];
const TN_STORE_ID = envVars["TIENDANUBE_STORE_ID"];
const TN_ACCESS_TOKEN = envVars["TIENDANUBE_ACCESS_TOKEN"];
const TN_APP_ID = "28885";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TN_HEADERS = {
  Authentication: `bearer ${TN_ACCESS_TOKEN}`,
  "User-Agent": `Mazoteca (integraciones@fedini.app) AppId/${TN_APP_ID}`,
  "Content-Type": "application/json",
};

// ── Helpers TN ───────────────────────────────────────────────

async function tnFetch(path) {
  const url = `https://api.tiendanube.com/v1/${TN_STORE_ID}${path}`;
  const res = await fetch(url, { headers: TN_HEADERS });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TN API ${res.status} ${path}: ${body}`);
  }
  return res.json();
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  while (true) {
    const products = await tnFetch(`/products?page=${page}&per_page=200`);
    all.push(...products);
    console.log(`  Página ${page}: ${products.length} productos`);
    if (products.length < 200) break;
    page++;
  }
  return all;
}

// ── Extractores (mismo logic que tiendanube.ts) ──────────────

function normalizeCardCode(raw) {
  // No normalizar ceros — tomar el código exactamente como está en TN
  return raw.toUpperCase();
}

/**
 * Normaliza el tag para hacer match con la tabla cards (KA000001 → KA001).
 * Solo se usa para la FK. El tag original se guarda en tn_tag.
 */
function toCardsFKCode(raw) {
  const prefix = raw.slice(0, 2).toUpperCase();
  const num = parseInt(raw.slice(2), 10);
  return `${prefix}${String(num).padStart(3, "0")}`;
}

function extractCardCode(product) {
  const cardCodeRegex = /\b(K[TCREPA][0-9]{3,9})\b/i;

  // 1. Tags (más confiable)
  if (product.tags) {
    const m = product.tags.match(cardCodeRegex);
    if (m) return normalizeCardCode(m[1]);
  }
  // 2. Nombre
  const name = product.name?.es ?? "";
  const mName = name.match(cardCodeRegex);
  if (mName) return normalizeCardCode(mName[1]);
  // 3. Handle
  const handle = product.handle?.es ?? "";
  const mHandle = handle.match(cardCodeRegex);
  if (mHandle) return normalizeCardCode(mHandle[1]);
  // 4. SKU
  for (const v of product.variants ?? []) {
    if (v.sku) {
      const mSku = v.sku.match(cardCodeRegex);
      if (mSku) return normalizeCardCode(mSku[1]);
    }
  }
  return null;
}

function extractFinish(variant) {
  if (variant.values && variant.values.length > 0) {
    return variant.values.map((v) => v.es).join(" / ");
  }
  return null;
}

function extractCondition(variant) {
  if (variant.values && variant.values.length >= 2) {
    return variant.values[1].es ?? null;
  }
  return null;
}

// ── Upsert ───────────────────────────────────────────────────

async function upsertProduct(product) {
  const tnTag = extractCardCode(product);  // tag exacto de TN, ej: KA000001
  // card_code para FK debe matchear cards(code), que usa padStart(3): KA001
  const cardCode = tnTag ? toCardsFKCode(tnTag) : null;
  const primaryImage = product.images?.[0]?.src ?? null;

  // 1. Upsert product
  const { error: pe } = await supabase.from("tiendanube_products").upsert(
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
  if (pe) console.error(`  ❌ product ${product.id}:`, pe.message);

  // 2. Upsert variants con datos exactos de TN
  for (const variant of product.variants ?? []) {
    const variantImage =
      product.images?.find((img) => img.id === variant.image_id)?.src ??
      primaryImage;

    // Stock: sin gestión → siempre disponible (999), con gestión → valor real
    const stock = variant.stock_management ? (variant.stock ?? 0) : 999;

    // Precio: price = precio actual, compare_at_price = precio tachado
    const price = variant.price ? Number(variant.price) : null;
    const compareAt = variant.compare_at_price ? Number(variant.compare_at_price) : null;
    const promotional_price = compareAt && compareAt > price ? compareAt : null;

    const { error: ve } = await supabase.from("tiendanube_variants").upsert(
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
    if (ve) console.error(`    ❌ variant ${variant.id}:`, ve.message);
  }

  // 3. Limpiar variants eliminadas en TN
  const currentIds = product.variants?.map((v) => v.id) ?? [];
  if (currentIds.length > 0) {
    await supabase
      .from("tiendanube_variants")
      .delete()
      .eq("product_id", product.id)
      .not("id", "in", `(${currentIds.join(",")})`);
  }
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("🔄 Iniciando sync TiendaNube → Supabase...\n");

  // Log de inicio
  const { data: logEntry } = await supabase
    .from("tiendanube_sync_log")
    .insert({ trigger: "manual", status: "running" })
    .select("id")
    .single();

  const logId = logEntry?.id;

  try {
    console.log("📦 Obteniendo productos de TiendaNube...");
    const products = await fetchAllProducts();
    console.log(`\n✅ ${products.length} productos encontrados\n`);

    let synced = 0;
    for (const product of products) {
      const code = extractCardCode(product);
      console.log(`  ↑ [${synced + 1}/${products.length}] ${product.name?.es} (code: ${code ?? "sin código"})`);
      await upsertProduct(product);
      synced++;
    }

    // Marcar éxito
    if (logId) {
      await supabase
        .from("tiendanube_sync_log")
        .update({ status: "success", products_synced: synced, finished_at: new Date().toISOString() })
        .eq("id", logId);
    }

    console.log(`\n🎉 Sync completo: ${synced} productos sincronizados`);

    // Verificar resultado
    const { count: vc } = await supabase
      .from("tiendanube_variants")
      .select("*", { count: "exact", head: true })
      .gt("stock", 0);
    console.log(`📊 Variantes con stock > 0: ${vc}`);

  } catch (err) {
    console.error("\n❌ Error en sync:", err.message);
    if (logId) {
      await supabase
        .from("tiendanube_sync_log")
        .update({ status: "error", error_msg: err.message, finished_at: new Date().toISOString() })
        .eq("id", logId);
    }
    process.exit(1);
  }
}

main();
