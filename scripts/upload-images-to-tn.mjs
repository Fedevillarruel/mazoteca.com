/**
 * upload-images-to-tn.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Sube imágenes de cartas desde Google Drive a los productos de Tiendanube.
 *
 * CÓMO FUNCIONA:
 *   1. Obtiene todos los productos de TN (con sus imágenes actuales).
 *   2. Lee un archivo CSV que mapea código de carta → IDs de Google Drive.
 *   3. Para cada carta, descarga cada imagen de Drive y la sube a TN.
 *   4. Asocia cada imagen al variante correcto (si aplica).
 *
 * PREPARACIÓN:
 *   1. Compartí tu carpeta de Drive con acceso "Cualquier persona con el link puede ver".
 *   2. Creá el archivo images-map.csv (ver formato abajo).
 *   3. Correlo: node scripts/upload-images-to-tn.mjs
 *
 * FORMATO images-map.csv:
 *   card_code,variant_label,drive_file_id
 *   KT001,,1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
 *   KT001,Foil,1xYzAbCdEfGhIjKlMnOpQrStUvWx789
 *   KC001,,1ZyXwVuTsRqPoNmLkJiHgFeDcBa012345
 *
 *   - card_code: código de la carta (ej: KT001)
 *   - variant_label: etiqueta del variante en TN (ej: "Foil", "Near Mint").
 *                    Dejá vacío para imagen principal del producto.
 *   - drive_file_id: ID del archivo en Google Drive (del link de compartir)
 *                    Link de Drive: https://drive.google.com/file/d/ESTE_ID/view
 *
 * ENV requeridas (en .env.local):
 *   TIENDANUBE_STORE_ID
 *   TIENDANUBE_ACCESS_TOKEN
 *
 * OPCIONES:
 *   --dry-run        Solo muestra qué haría, sin subir nada
 *   --card=KT001     Procesa solo una carta específica
 *   --skip-existing  Saltea productos que ya tienen imágenes
 *   --delay=1500     Milisegundos de espera entre requests (default: 1500)
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Config ───────────────────────────────────────────────────────────────────

const ENV_PATH = resolve(__dir, "../.env.local");
const CSV_PATH = resolve(__dir, "images-map.csv");
const LOG_PATH = resolve(__dir, "upload-images-log.json");

// Parsear .env.local
const envVars = {};
if (existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, "utf8").split("\n")) {
    const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (match) envVars[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const TN_STORE_ID    = envVars["TIENDANUBE_STORE_ID"]    ?? process.env.TIENDANUBE_STORE_ID;
const TN_TOKEN       = envVars["TIENDANUBE_ACCESS_TOKEN"] ?? process.env.TIENDANUBE_ACCESS_TOKEN;
const TN_APP_ID      = "28885";
const TN_BASE        = `https://api.tiendanube.com/v1/${TN_STORE_ID}`;
const TN_HEADERS     = {
  Authentication: `bearer ${TN_TOKEN}`,
  "User-Agent": `Mazoteca (integraciones@fedini.app) AppId/${TN_APP_ID}`,
  "Content-Type": "application/json",
};

// ── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN       = args.includes("--dry-run");
const SKIP_EXISTING = args.includes("--skip-existing");
const ONLY_CARD     = args.find((a) => a.startsWith("--card="))?.split("=")[1]?.toUpperCase();
const DELAY_MS      = parseInt(args.find((a) => a.startsWith("--delay="))?.split("=")[1] ?? "1500", 10);

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

/** Obtener URL de descarga directa desde Google Drive file ID */
function driveDownloadUrl(fileId) {
  // Google Drive direct download URL (funciona para archivos <100MB sin confirmación)
  return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
}

/** Descargar imagen desde Drive como ArrayBuffer */
async function downloadFromDrive(fileId) {
  const url = driveDownloadUrl(fileId);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MazotecaBot/1.0)",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Drive download failed: ${res.status} for fileId=${fileId}`);
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
    throw new Error(`Drive devolvió content-type inesperado: ${contentType} — ¿El archivo es público?`);
  }

  const buffer = await res.arrayBuffer();
  return { buffer, contentType: contentType.startsWith("image/") ? contentType : "image/jpeg" };
}

/** Llamada a la API de TN */
async function tnFetch(path, options = {}) {
  const res = await fetch(`${TN_BASE}${path}`, {
    ...options,
    headers: { ...TN_HEADERS, ...options.headers },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TN API ${res.status} ${path}: ${body.slice(0, 300)}`);
  }

  return res.status === 204 ? null : res.json();
}

/** Obtener todos los productos de TN */
async function fetchAllProducts() {
  const all = [];
  let page = 1;
  while (true) {
    log("📦", `Cargando productos TN — página ${page}...`);
    const products = await tnFetch(`/products?page=${page}&per_page=200`);
    all.push(...products);
    if (products.length < 200) break;
    page++;
    await sleep(500);
  }
  return all;
}

/**
 * Extraer código de carta de un producto TN.
 * Busca en tags → nombre → handle.
 */
function extractCardCode(product) {
  const regex = /\b(K[TCREPA][0-9]{3,9})\b/i;
  if (product.tags) {
    const m = product.tags.match(regex);
    if (m) return m[1].toUpperCase();
  }
  const name = product.name?.es ?? "";
  const mName = name.match(regex);
  if (mName) return mName[1].toUpperCase();
  const handle = product.handle?.es ?? "";
  const mHandle = handle.match(regex);
  if (mHandle) return mHandle[1].toUpperCase();
  for (const v of product.variants ?? []) {
    if (v.sku) {
      const mSku = v.sku.match(regex);
      if (mSku) return mSku[1].toUpperCase();
    }
  }
  return null;
}

/**
 * Subir imagen a un producto de TN usando multipart/form-data.
 * Retorna el objeto imagen creado.
 */
async function uploadImageToProduct(productId, imageBuffer, contentType, position = 0) {
  // TN acepta subir imagen via URL externa O via multipart.
  // Usamos URL de Drive directa (más simple que multipart):
  // POST /products/{id}/images  con { src: "https://..." }
  // PERO Drive requiere auth → usamos multipart con el buffer.

  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const filename = `carta_${Date.now()}.${ext}`;

  const form = new FormData();
  form.append("position", String(position));
  form.append(
    "attachment",
    new Blob([imageBuffer], { type: contentType }),
    filename
  );

  const res = await fetch(`${TN_BASE}/products/${productId}/images`, {
    method: "POST",
    headers: {
      Authentication: TN_HEADERS.Authentication,
      "User-Agent": TN_HEADERS["User-Agent"],
      // NO incluir Content-Type — fetch lo pone solo con boundary para multipart
    },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Upload imagen TN ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.json();
}

/**
 * Asociar imagen a un variante específico de TN.
 * Requiere el imageId devuelto por uploadImageToProduct.
 */
async function associateImageToVariant(productId, variantId, imageId) {
  return tnFetch(`/products/${productId}/variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify({ image_id: imageId }),
  });
}

/** Parsear el CSV de mapeo */
function parseCsv(csvPath) {
  if (!existsSync(csvPath)) return null;

  const lines = readFileSync(csvPath, "utf8").split("\n").filter(Boolean);
  const header = lines[0].split(",").map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = parts[j] ?? "";
    }
    if (row.card_code && row.drive_file_id) {
      rows.push(row);
    }
  }

  return rows;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀  upload-images-to-tn.mjs");
  console.log("═".repeat(60));

  if (!TN_STORE_ID || !TN_TOKEN) {
    console.error("❌  Faltan TIENDANUBE_STORE_ID o TIENDANUBE_ACCESS_TOKEN en .env.local");
    process.exit(1);
  }

  if (DRY_RUN) log("🧪", "DRY RUN activado — no se subirá nada");
  if (ONLY_CARD) log("🎯", `Procesando solo: ${ONLY_CARD}`);

  // 1. Leer CSV
  const csvRows = parseCsv(CSV_PATH);
  if (!csvRows) {
    console.error(`❌  No encontré el archivo: ${CSV_PATH}`);
    console.error("    Crealo con el formato:");
    console.error("    card_code,variant_label,drive_file_id");
    console.error("    KT001,,1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456");
    process.exit(1);
  }
  log("📋", `CSV cargado: ${csvRows.length} entradas`);

  // 2. Filtrar por carta específica si se pasó --card=
  const filteredRows = ONLY_CARD
    ? csvRows.filter((r) => r.card_code.toUpperCase() === ONLY_CARD)
    : csvRows;

  if (filteredRows.length === 0) {
    log("⚠️ ", `No hay entradas en el CSV para ${ONLY_CARD ?? "ninguna carta"}`);
    process.exit(0);
  }

  // 3. Obtener productos de TN
  const products = await fetchAllProducts();
  log("✅", `${products.length} productos cargados de TN`);

  // Construir mapa: cardCode → producto
  const productByCode = new Map();
  for (const p of products) {
    const code = extractCardCode(p);
    if (code) productByCode.set(code, p);
  }

  // 4. Agrupar CSV por carta
  const grouped = new Map();
  for (const row of filteredRows) {
    const code = row.card_code.toUpperCase();
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code).push(row);
  }

  // 5. Procesar
  const results = { ok: [], skipped: [], errors: [] };

  for (const [cardCode, rows] of grouped.entries()) {
    const product = productByCode.get(cardCode);

    if (!product) {
      log("⚠️ ", `${cardCode} — No encontrado en TN (¿el producto existe y tiene tag/código correcto?)`);
      results.skipped.push({ cardCode, reason: "no encontrado en TN" });
      continue;
    }

    const existingImages = product.images ?? [];
    if (SKIP_EXISTING && existingImages.length > 0) {
      log("⏭️ ", `${cardCode} — Tiene ${existingImages.length} imagen(es), salteando`);
      results.skipped.push({ cardCode, reason: "ya tiene imágenes" });
      continue;
    }

    log("🃏", `${cardCode} — Producto: "${product.name?.es}" (id: ${product.id}) — ${rows.length} imagen(s)`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const { drive_file_id, variant_label } = row;
      const position = i;

      try {
        if (DRY_RUN) {
          log("  🧪", `[DRY] Subiría imagen drive:${drive_file_id} pos:${position} variante:"${variant_label || "(principal)"}"`);
          results.ok.push({ cardCode, drive_file_id, status: "dry-run" });
          continue;
        }

        // Descargar de Drive
        log("  ⬇️ ", `Descargando de Drive: ${drive_file_id}...`);
        const { buffer, contentType } = await downloadFromDrive(drive_file_id);
        log("  📥", `Descargado: ${(buffer.byteLength / 1024).toFixed(1)} KB (${contentType})`);

        // Subir a TN
        log("  ⬆️ ", `Subiendo a TN producto ${product.id} pos:${position}...`);
        const uploadedImage = await uploadImageToProduct(product.id, buffer, contentType, position);
        log("  ✅", `Imagen subida: TN image id=${uploadedImage.id} src=${uploadedImage.src}`);

        // Asociar a variante si se especificó
        if (variant_label) {
          const variant = (product.variants ?? []).find((v) =>
            v.values?.some((val) => val.es?.toLowerCase().includes(variant_label.toLowerCase()))
          );
          if (variant) {
            await associateImageToVariant(product.id, variant.id, uploadedImage.id);
            log("  🔗", `Asociada al variante "${variant_label}" (id: ${variant.id})`);
          } else {
            log("  ⚠️ ", `No encontré variante con label "${variant_label}" en producto ${product.id}`);
          }
        }

        results.ok.push({ cardCode, drive_file_id, tn_image_id: uploadedImage.id, status: "ok" });

        // Rate limiting: TN permite ~2 req/seg en imágenes
        await sleep(DELAY_MS);

      } catch (err) {
        log("  ❌", `Error en ${cardCode} (drive:${drive_file_id}): ${err.message}`);
        results.errors.push({ cardCode, drive_file_id, error: err.message });
        await sleep(DELAY_MS);
      }
    }
  }

  // 6. Resumen
  console.log("\n" + "═".repeat(60));
  console.log(`✅  OK:       ${results.ok.length}`);
  console.log(`⏭️   Salteados: ${results.skipped.length}`);
  console.log(`❌  Errores:  ${results.errors.length}`);

  // Guardar log
  writeFileSync(LOG_PATH, JSON.stringify(results, null, 2));
  log("📝", `Log guardado en: ${LOG_PATH}`);

  if (results.errors.length > 0) {
    console.log("\n⚠️  Errores:");
    for (const e of results.errors) {
      console.log(`   ${e.cardCode} — ${e.error}`);
    }
  }

  console.log("\n🏁  Listo.\n");
}

main().catch((err) => {
  console.error("💥  Error fatal:", err.message);
  process.exit(1);
});
