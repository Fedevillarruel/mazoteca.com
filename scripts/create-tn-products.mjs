/**
 * create-tn-products.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Crea en Tiendanube los productos de cartas que faltan.
 * Compara cards_verified.json contra los productos existentes en TN y crea
 * los que no están. Luego podés correr upload-images-to-tn.mjs --skip-existing.
 *
 * USO:
 *   node scripts/create-tn-products.mjs
 *   node scripts/create-tn-products.mjs --dry-run
 *   node scripts/create-tn-products.mjs --only=KT
 *   node scripts/create-tn-products.mjs --card=KT002
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const ENV_PATH   = resolve(__dir, "../.env.local");
const CARDS_PATH = resolve(__dir, "../src/data/cards_verified.json");
const LOG_PATH   = resolve(__dir, "create-products-log.json");

const envVars = {};
if (existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const TN_STORE_ID = envVars["TIENDANUBE_STORE_ID"]    ?? process.env.TIENDANUBE_STORE_ID;
const TN_TOKEN    = envVars["TIENDANUBE_ACCESS_TOKEN"] ?? process.env.TIENDANUBE_ACCESS_TOKEN;
const TN_APP_ID   = "28885";
const TN_BASE     = `https://api.tiendanube.com/v1/${TN_STORE_ID}`;
const TN_HEADERS  = {
  Authentication: `bearer ${TN_TOKEN}`,
  "User-Agent": `Mazoteca (integraciones@fedini.app) AppId/${TN_APP_ID}`,
  "Content-Type": "application/json",
};

// ── TN Category IDs (pre-existentes) ─────────────────────────────────────────
const CATS = {
  root:      37899975, // Kingdom TCG
  tropas:    37899976,
  coronados: 37899977,
  realeza:   37902517, // "Realezas"
  estrategia: 37899979,
  arroje:    37899981,
  primigenias: 37899980,
};

// ── CLI ───────────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const DRY_RUN  = args.includes("--dry-run");
const ONLY_TYPE = args.find(a => a.startsWith("--only="))?.split("=")[1]?.toUpperCase();
const ONLY_CARD = args.find(a => a.startsWith("--card="))?.split("=")[1]?.toUpperCase();
const DELAY_MS  = parseInt(args.find(a => a.startsWith("--delay="))?.split("=")[1] ?? "1000", 10);

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(emoji, msg) { console.log(`${emoji}  ${msg}`); }

async function tnFetch(path, options = {}) {
  const res = await fetch(`${TN_BASE}${path}`, {
    ...options,
    headers: { ...TN_HEADERS, ...options.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TN API ${res.status} ${path}: ${body.slice(0, 400)}`);
  }
  return res.status === 204 ? null : res.json();
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  while (true) {
    const products = await tnFetch(`/products?page=${page}&per_page=200`);
    all.push(...products);
    if (products.length < 200) break;
    page++;
    await sleep(500);
  }
  return all;
}

/** Extraer código de carta de un producto TN */
function extractCardCode(product) {
  const regex = /\b(K[TCREPA][0-9]{3,9})\b/i;
  for (const src of [
    product.tags,
    product.name?.es,
    product.handle?.es,
    ...(product.variants ?? []).map(v => v.sku),
  ]) {
    const m = src?.match(regex);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

/** Construir payload de producto para TN */
function buildProductPayload(card) {
  const { name, code, type, level, edition, crowned, finishes } = card;
  const artPart = "/01";
  const edPart  = edition ? ` - (Ed. ${edition})` : "";
  const tags    = `${code}${artPart}${edPart}`;

  let categories = [CATS.root];
  let attributes = [];
  let variants   = [];

  if (type === "tropa") {
    categories = [CATS.root, CATS.tropas];
    attributes = [{ es: "Nivel" }];
    variants   = [{ values: [{ es: String(level ?? "1") }], price: "1000.00", stock: 1 }];

  } else if (type === "realeza") {
    categories = [CATS.root, CATS.realeza];
    attributes = [{ es: "Coronado" }];
    variants   = [{ values: [{ es: crowned ?? "Sin coronado" }], price: "1000.00", stock: 1 }];

  } else if (type === "coronado") {
    categories = [CATS.root, CATS.coronados];
    attributes = [{ es: "Acabado" }];
    // Una variante por cada acabado
    const finishList = finishes?.length
      ? finishes
      : ["Común"];
    variants = finishList.map(f => ({
      values: [{ es: f }],
      price: "1000.00",
      stock: 1,
    }));

  } else if (type === "estrategia") {
    categories = [CATS.root, CATS.estrategia];
    attributes = [];
    variants   = [{ values: [], price: "1000.00", stock: 1 }];

  } else if (type === "estrategia_primigenia") {
    categories = [CATS.root, CATS.primigenias];
    attributes = [];
    variants   = [{ values: [], price: "1000.00", stock: 1 }];

  } else if (type === "arroje") {
    categories = [CATS.root, CATS.arroje];
    attributes = [];
    variants   = [{ values: [], price: "1000.00", stock: 1 }];

  } else {
    categories = [CATS.root];
    attributes = [];
    variants   = [{ values: [], price: "1000.00", stock: 1 }];
  }

  return {
    name:        { es: name },
    handle:      { es: code.toLowerCase() + "-" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") },
    description: { es: "" },
    published:   true,
    tags,
    categories,
    attributes,
    variants,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🏗️   create-tn-products.mjs — Mazoteca");
  console.log("═".repeat(60));

  if (!TN_STORE_ID || !TN_TOKEN) {
    console.error("❌  Faltan TIENDANUBE_STORE_ID o TIENDANUBE_ACCESS_TOKEN en .env.local");
    process.exit(1);
  }

  if (DRY_RUN) log("🧪", "DRY RUN — no se creará nada");
  if (ONLY_TYPE) log("🎯", `Solo tipo: ${ONLY_TYPE}`);
  if (ONLY_CARD) log("🎯", `Solo carta: ${ONLY_CARD}`);

  // 1. Cargar cards_verified.json
  const allCards = JSON.parse(readFileSync(CARDS_PATH, "utf8"));
  log("📋", `cards_verified.json: ${allCards.length} cartas`);

  // 2. Obtener productos TN existentes
  log("📦", "Cargando productos de TN...");
  const tnProducts = await fetchAllProducts();
  log("✅", `${tnProducts.length} productos en TN`);

  // Códigos que ya están en TN
  const existingCodes = new Set(
    tnProducts.map(p => extractCardCode(p)).filter(Boolean)
  );
  log("🔍", `Códigos en TN: ${existingCodes.size}`);

  // 3. Filtrar cartas que faltan
  let missingCards = allCards.filter(c => !existingCodes.has(c.code.toUpperCase()));

  if (ONLY_TYPE) {
    missingCards = missingCards.filter(c => c.code.toUpperCase().startsWith(ONLY_TYPE));
  }
  if (ONLY_CARD) {
    missingCards = missingCards.filter(c => c.code.toUpperCase() === ONLY_CARD);
  }

  log("⚠️ ", `Cartas faltantes a crear: ${missingCards.length}`);

  if (missingCards.length === 0) {
    log("✅", "¡No falta ninguna carta! Todo está en TN.");
    return;
  }

  // Mostrar resumen de lo que se va a crear
  const byType = {};
  for (const c of missingCards) {
    byType[c.type] = (byType[c.type] ?? 0) + 1;
  }
  console.log("\n📊  Desglose por tipo:");
  for (const [type, count] of Object.entries(byType)) {
    console.log(`   ${type.padEnd(15)} → ${count} cartas`);
  }

  console.log(`\n${"─".repeat(60)}`);

  // 4. Crear productos
  const results = { created: [], errors: [] };

  for (const card of missingCards) {
    const payload = buildProductPayload(card);

    if (DRY_RUN) {
      log("🧪", `[DRY] ${card.code} "${card.name}" → ${card.type} | variants: ${payload.variants.map(v=>v.values[0]?.es ?? "(sin valor)").join(", ")}`);
      results.created.push({ code: card.code, name: card.name, status: "dry-run" });
      continue;
    }

    try {
      log("➕", `Creando ${card.code} "${card.name}" (${card.type})...`);
      const created = await tnFetch("/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      log("  ✅", `Creado — id: ${created.id} | variantes: ${created.variants?.length}`);
      results.created.push({ code: card.code, name: card.name, tn_id: created.id, status: "ok" });
      await sleep(DELAY_MS);
    } catch (err) {
      log("  ❌", `Error creando ${card.code}: ${err.message}`);
      results.errors.push({ code: card.code, name: card.name, error: err.message });
      await sleep(DELAY_MS);
    }
  }

  // 5. Resumen
  console.log("\n" + "═".repeat(60));
  console.log(`✅  Creados:  ${results.created.length}`);
  console.log(`❌  Errores:  ${results.errors.length}`);

  writeFileSync(LOG_PATH, JSON.stringify(results, null, 2));
  log("📝", `Log guardado en: ${LOG_PATH}`);

  if (results.errors.length > 0) {
    console.log("\n⚠️  Errores:");
    for (const e of results.errors) console.log(`   ${e.code} — ${e.error}`);
  }

  if (!DRY_RUN && results.created.length > 0) {
    console.log("\n🚀  Próximos pasos:");
    console.log("   node scripts/upload-images-to-tn.mjs --skip-existing");
  }

  console.log("\n🏁  Listo.\n");
}

main().catch(err => {
  console.error("💥  Error fatal:", err.message);
  process.exit(1);
});
