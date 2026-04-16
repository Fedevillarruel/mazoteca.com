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
import { createSign } from "crypto";

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Config ───────────────────────────────────────────────────────────────────

const ENV_PATH = resolve(__dir, "../.env.local");
const CSV_PATH = resolve(__dir, "images-map.csv");
const LOG_PATH = resolve(__dir, "upload-images-log.json");
const SA_PATH  = resolve(__dir, "google-service-account.json");

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
const DIAGNOSE      = args.includes("--diagnose");
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

/** Obtener token de Google Service Account */
async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss:   sa.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud:   "https://oauth2.googleapis.com/token",
    exp:   now + 3600,
    iat:   now,
  })).toString("base64url");
  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, "base64url");
  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion:  jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Sin access_token: ${JSON.stringify(data)}`);
  return data.access_token;
}

/** Descargar imagen desde Drive usando service account */
async function downloadFromDrive(fileId, driveToken) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${driveToken}` },
  });

  if (!res.ok) {
    throw new Error(`Drive download failed: ${res.status} para fileId=${fileId}`);
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
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
 * Subir imagen a un producto de TN usando base64 en JSON.
 * Retorna el objeto imagen creado.
 */
async function uploadImageToProduct(productId, imageBuffer, contentType, position = 0) {
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "webp";
  const filename = `carta_${Date.now()}.${ext}`;
  const attachment = Buffer.from(imageBuffer).toString("base64");

  const res = await fetch(`${TN_BASE}/products/${productId}/images`, {
    method: "POST",
    headers: TN_HEADERS,
    body: JSON.stringify({ filename, attachment, position }),
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
  if (DIAGNOSE) log("🔍", "DIAGNOSE activado — mostrando todos los productos TN y sus códigos");
  if (ONLY_CARD) log("🎯", `Procesando solo: ${ONLY_CARD}`);

  // 0. Autenticación Google Drive
  if (!existsSync(SA_PATH)) {
    console.error(`❌  No encontré: ${SA_PATH}`);
    process.exit(1);
  }
  const sa = JSON.parse(readFileSync(SA_PATH, "utf8"));
  log("🔑", `Service Account: ${sa.client_email}`);
  const driveToken = await getGoogleAccessToken(sa);
  log("✅", "Token de Drive OK");

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

  // Modo diagnóstico: mostrar todos los productos y sus códigos
  if (DIAGNOSE) {
    console.log("\n📋  Productos en TN con código detectado:");
    for (const p of products) {
      const code = extractCardCode(p);
      const name = p.name?.es ?? "(sin nombre)";
      const imgs = (p.images ?? []).length;
      if (code) {
        console.log(`  ✅ ${code.padEnd(8)} → "${name}" (id:${p.id}, imágenes:${imgs})`);
      }
    }
    console.log("\n📋  Productos en TN SIN código detectado (necesitan tag/nombre con código K...):");
    for (const p of products) {
      const code = extractCardCode(p);
      if (!code) {
        const name = p.name?.es ?? "(sin nombre)";
        const tags = p.tags ?? "(sin tags)";
        const imgs = (p.images ?? []).length;
        console.log(`  ⚠️  id:${p.id} "${name}" tags:"${tags}" imágenes:${imgs}`);
      }
    }
    console.log(`\n📊  Total: ${products.length} productos | ${productByCode.size} con código\n`);
    return;
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
      const position = i + 1; // TN requiere position >= 1

      try {
        if (DRY_RUN) {
          log("  🧪", `[DRY] Subiría imagen drive:${drive_file_id} pos:${position} variante:"${variant_label || "(principal)"}"`);
          results.ok.push({ cardCode, drive_file_id, status: "dry-run" });
          continue;
        }

        // Descargar de Drive
        log("  ⬇️ ", `Descargando de Drive: ${drive_file_id}...`);
        const { buffer, contentType } = await downloadFromDrive(drive_file_id, driveToken);
        log("  📥", `Descargado: ${(buffer.byteLength / 1024).toFixed(1)} KB (${contentType})`);

        // Subir a TN
        log("  ⬆️ ", `Subiendo a TN producto ${product.id} pos:${position}...`);
        const uploadedImage = await uploadImageToProduct(product.id, buffer, contentType, position);
        log("  ✅", `Imagen subida: TN image id=${uploadedImage.id} src=${uploadedImage.src}`);

        // Asociar a variante si se especificó
        if (variant_label) {
          // Busca la variante por:
          // 1. Que el valor contenga el label exacto  ("Stamp", "Holo", ...)
          // 2. Que el label sea "Arte N" y el valor sea el número "N"
          const artNum = variant_label.match(/^Arte (\d+)$/i)?.[1];
          const variant = (product.variants ?? []).find((v) =>
            v.values?.some((val) => {
              const tnVal = val.es?.trim() ?? "";
              if (tnVal.toLowerCase() === variant_label.toLowerCase()) return true;
              if (artNum && tnVal === artNum) return true;
              if (tnVal.toLowerCase().includes(variant_label.toLowerCase())) return true;
              return false;
            })
          );
          if (variant) {
            await associateImageToVariant(product.id, variant.id, uploadedImage.id);
            log("  🔗", `Asociada al variante "${variant.values?.[0]?.es}" (id: ${variant.id})`);
          } else {
            log("  ℹ️ ", `Sin variante TN para "${variant_label}" — imagen subida a la galería`);
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
