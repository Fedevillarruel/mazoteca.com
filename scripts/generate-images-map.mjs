/**
 * generate-images-map.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Genera automáticamente el archivo images-map.csv leyendo la estructura
 * de carpetas de Google Drive de Mazoteca.
 *
 * ESTRUCTURA ESPERADA EN DRIVE:
 *   Cartas/
 *     01-tropas/
 *       KT001/
 *         KT001.jpg          → imagen principal (sin variante)
 *         KT001 SG.jpg       → variante "SG"
 *         KT001 H.jpg        → variante "H"
 *         KT001 STH.jpg      → variante "STH"
 *       KT002/
 *         KT002.jpg
 *     02-coronados/
 *       KC001/
 *         KC001.jpg
 *         KC001 H.jpg
 *     03-estrategia/ ...
 *     04-arroje/ ...
 *     05-realeza/ ...
 *     06-primigenias/ ...
 *
 * SUFIJOS DE EFECTOS RECONOCIDOS (al final del nombre, separados por espacio):
 *   SG  → Stamp Gold       H   → Holo
 *   ST  → Stamp            STH → Stamp Holo
 *   F   → Foil             SH  → Stamp Holo (alternativo)
 *   (cualquier sufijo en mayúsculas de 1-4 letras se usa tal cual)
 *
 * REQUISITOS:
 *   • Service Account JSON en scripts/google-service-account.json
 *     (compartí la carpeta "Cartas" con el email del service account)
 *   • O usá --public si la carpeta es completamente pública.
 *
 * USO:
 *   node scripts/generate-images-map.mjs --folder=ID_CARPETA_CARTAS
 *   node scripts/generate-images-map.mjs --folder=ID_CARPETA_CARTAS --public
 *
 * El ID de carpeta está en la URL:
 *   https://drive.google.com/drive/folders/ESTE_ES_EL_ID
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir  = dirname(fileURLToPath(import.meta.url));
const CSV_OUT = resolve(__dir, "images-map.csv");
const SA_PATH = resolve(__dir, "google-service-account.json");

// ── CLI args ─────────────────────────────────────────────────────────────────

const args       = process.argv.slice(2);
const FOLDER_ID  = args.find((a) => a.startsWith("--folder="))?.split("=")[1];
const PUBLIC_MODE = args.includes("--public");

if (!FOLDER_ID) {
  console.error("❌  Falta el argumento: --folder=ID_CARPETA_CARTAS");
  console.error("    ID está en: https://drive.google.com/drive/folders/ESTE_ID");
  process.exit(1);
}

// ── Sufijos de efectos especiales ─────────────────────────────────────────────
// Mapa sufijo (en archivo) → label en TN
// Si el sufijo no está acá, se usa tal cual (en mayúsculas).
const EFFECT_LABELS = {
  SG:  "Stamp Gold",
  H:   "Holo",
  ST:  "Stamp",
  STH: "Stamp Holo",
  SH:  "Stamp Holo",
  F:   "Foil",
  FH:  "Foil Holo",
};

// ── Google Drive API ─────────────────────────────────────────────────────────

async function getGoogleAccessToken(sa) {
  const { createSign } = await import("crypto");
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

  const res  = await fetch("https://oauth2.googleapis.com/token", {
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

/** Listar SOLO subcarpetas de un folder */
async function listFolders(parentId, token) {
  const params = new URLSearchParams({
    q:         `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields:    "files(id,name)",
    pageSize:  "1000",
    orderBy:   "name",
  });
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive API ${res.status} listFolders(${parentId}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.files ?? [];
}

/** Listar SOLO imágenes de un folder */
async function listImages(parentId, token) {
  const files = [];
  let pageToken = null;
  do {
    const params = new URLSearchParams({
      q:        `'${parentId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields:   "nextPageToken,files(id,name,mimeType)",
      pageSize: "1000",
      orderBy:  "name",
      ...(pageToken ? { pageToken } : {}),
    });
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Drive API ${res.status} listImages(${parentId}): ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken ?? null;
  } while (pageToken);
  return files;
}

// ── Parsear nombre de archivo ─────────────────────────────────────────────────
/**
 * Dado el nombre de un archivo (ej: "KT001 SG.jpg") y el código de carta
 * que viene de la carpeta padre (ej: "KT001"), retorna { cardCode, variantLabel }.
 *
 * Regla: todo lo que viene DESPUÉS del código (separado por espacio) es el sufijo de efecto.
 *   "KT001.jpg"       → variant: "" (imagen principal)
 *   "KT001 SG.jpg"    → variant: "Stamp Gold"  (o el label mapeado)
 *   "KT001 STH.jpg"   → variant: "Stamp Holo"
 *   "KT001 XYZ.jpg"   → variant: "XYZ"  (sufijo desconocido → tal cual)
 */
function parseImageFile(filename, folderCardCode) {
  const CARD_CODE_RE = /^(K[TCREPA][0-9]{3,9})/i;
  const base = filename.replace(/\.[^.]+$/, "").trim(); // sin extensión

  // El código puede venir del nombre del archivo o de la carpeta padre
  const codeMatch = base.match(CARD_CODE_RE);
  const cardCode  = (codeMatch?.[1] ?? folderCardCode)?.toUpperCase();
  if (!cardCode) return null;

  // Todo lo que sigue al código (con espacio) es el sufijo de efecto
  let suffix = "";
  if (codeMatch) {
    suffix = base.slice(codeMatch[0].length).replace(/^[\s_\-]+/, "").trim();
  } else {
    // El nombre del archivo no tiene código → el sufijo es todo el nombre
    suffix = base.trim();
  }

  // Si no hay sufijo → imagen principal
  if (!suffix) return { cardCode, variantLabel: "" };

  // Mapear sufijo conocido, o usar tal cual
  const variantLabel = EFFECT_LABELS[suffix.toUpperCase()] ?? suffix.toUpperCase();
  return { cardCode, variantLabel };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🗺️   generate-images-map.mjs — Mazoteca");
  console.log("═".repeat(60));
  console.log(`📁  Carpeta raíz: ${FOLDER_ID}`);
  console.log(`🔒  Modo: ${PUBLIC_MODE ? "pública (--public)" : "service account"}`);

  // Auth
  let token = null;
  if (!PUBLIC_MODE) {
    if (!existsSync(SA_PATH)) {
      console.error(`\n❌  No encontré: ${SA_PATH}`);
      console.error("    Opciones:");
      console.error("    a) Descargá el Service Account JSON de Google Cloud y guardalo ahí.");
      console.error("    b) Hacé pública la carpeta de Drive y usá --public.");
      process.exit(1);
    }
    const sa = JSON.parse(readFileSync(SA_PATH, "utf8"));
    console.log(`🔑  Service Account: ${sa.client_email}`);
    token = await getGoogleAccessToken(sa);
    console.log("✅  Token OK\n");
  }

  const rows        = [];
  const unrecognized = [];
  let   totalImages  = 0;

  // Nivel 1: carpetas de categoría (01-tropas, 02-coronados, ...)
  console.log("📂  Leyendo categorías...");
  const categoryFolders = await listFolders(FOLDER_ID, token);
  console.log(`   ${categoryFolders.length} categorías: ${categoryFolders.map((f) => f.name).join(", ")}\n`);

  for (const catFolder of categoryFolders) {
    console.log(`📂  ${catFolder.name}`);

    // Nivel 2: carpetas de carta (KT001, KC001, ...)
    const cardFolders = await listFolders(catFolder.id, token);
    console.log(`   ${cardFolders.length} cartas`);

    for (const cardFolder of cardFolders) {
      // El nombre de la carpeta es el código de carta (ej: "KT001")
      const folderCardCode = cardFolder.name.match(/^(K[TCREPA][0-9]{3,9})/i)?.[1]?.toUpperCase();
      if (!folderCardCode) {
        console.log(`   ⚠️  Carpeta sin código reconocido: "${cardFolder.name}" — salteando`);
        unrecognized.push(`[carpeta] ${catFolder.name}/${cardFolder.name}`);
        continue;
      }

      // Nivel 3: imágenes dentro de la carpeta de la carta
      const images = await listImages(cardFolder.id, token);
      totalImages += images.length;

      if (images.length === 0) {
        console.log(`   ⚠️  ${folderCardCode} — sin imágenes`);
        continue;
      }

      // Ordenar: primero la imagen principal (sin sufijo), luego por nombre
      images.sort((a, b) => a.name.localeCompare(b.name));

      for (const img of images) {
        const parsed = parseImageFile(img.name, folderCardCode);
        if (!parsed) {
          unrecognized.push(`${catFolder.name}/${cardFolder.name}/${img.name}`);
          continue;
        }
        rows.push({
          card_code:     parsed.cardCode,
          variant_label: parsed.variantLabel,
          drive_file_id: img.id,
          _path:         `${catFolder.name}/${cardFolder.name}/${img.name}`,
        });
      }
    }
  }

  // Ordenar por código → variante
  rows.sort((a, b) =>
    a.card_code.localeCompare(b.card_code) ||
    a.variant_label.localeCompare(b.variant_label)
  );

  // Escribir CSV
  const csvLines = [
    "card_code,variant_label,drive_file_id",
    ...rows.map((r) => `${r.card_code},${r.variant_label},${r.drive_file_id}`),
  ];
  writeFileSync(CSV_OUT, csvLines.join("\n") + "\n");

  // Resumen
  console.log("\n" + "═".repeat(60));
  console.log(`📊  Imágenes encontradas: ${totalImages}`);
  console.log(`✅  Filas en CSV:         ${rows.length}`);
  console.log(`❌  No reconocidos:       ${unrecognized.length}`);
  console.log(`💾  CSV guardado en:      ${CSV_OUT}`);

  // Desglose por carta
  const byCode = {};
  for (const r of rows) {
    if (!byCode[r.card_code]) byCode[r.card_code] = [];
    byCode[r.card_code].push(r.variant_label || "(principal)");
  }
  console.log(`\n📋  Preview — primeras 15 cartas:`);
  for (const [code, variants] of Object.entries(byCode).slice(0, 15)) {
    console.log(`   ${code.padEnd(10)} → ${variants.join(" | ")}`);
  }

  if (unrecognized.length > 0) {
    console.log(`\n⚠️  Archivos/carpetas no reconocidos:`);
    for (const u of unrecognized.slice(0, 15)) console.log(`   - ${u}`);
    if (unrecognized.length > 15) console.log(`   ... y ${unrecognized.length - 15} más`);
  }

  console.log(`\n🚀  Próximos pasos:`);
  console.log(`   node scripts/upload-images-to-tn.mjs --dry-run`);
  console.log(`   node scripts/upload-images-to-tn.mjs --skip-existing`);
  console.log(`   node scripts/upload-images-to-tn.mjs\n`);
}

main().catch((err) => {
  console.error("\n💥  Error fatal:", err.message);
  process.exit(1);
});
