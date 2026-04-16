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

// ── Sufijos de efectos ────────────────────────────────────────────────────────
// Formato de archivo: KC001-01-SG.webp → código KC001, imagen nro 01, efecto SG
// El sufijo numérico (-01, -02) indica versión/arte distinto → imágenes adicionales del producto
// Los sufijos de efecto van DESPUÉS del número:  KC001-01-H  KC001-03-SG  KC001-02-AL
const EFFECT_LABELS = {
  H:      "Holo",
  SG:     "Stamp Gold",
  ST:     "Stamp",
  STH:    "Stamp Holo",
  SH:     "Stamp Holo",
  F:      "Foil",
  FH:     "Foil Holo",
  AL:     "Alternativo",
  ALFAH:  "Alternativo Foil Art Holo",
  ALST:   "Alternativo Stamp",
  PO:     "Promo",
  POFA:   "Promo Foil Art",
  POFAH:  "Promo Foil Art Holo",
  HOLO:   "Holo",
  // Sufijos numéricos: segunda/tercera arte
  "2":    "Arte 2",
  "3":    "Arte 3",
  "4":    "Arte 4",
  "5":    "Arte 5",
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

/** Headers base para todas las llamadas a Drive */
function driveHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Parámetros comunes para soportar Shared Drives y carpetas compartidas */
const DRIVE_COMMON = {
  supportsAllDrives:          "true",
  includeItemsFromAllDrives:  "true",
};

/** Verificar acceso a la carpeta raíz y mostrar diagnóstico */
async function checkRootFolder(folderId, token) {
  const params = new URLSearchParams({
    fields: "id,name,mimeType",
    supportsAllDrives: "true",
  });
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?${params}`,
    { headers: driveHeaders(token) }
  );
  if (res.status === 404) {
    throw new Error(
      `El service account no puede ver la carpeta (404).\n` +
      `  ✋ Asegurate de:\n` +
      `     1. Ir a Drive → carpeta "Cartas" → clic derecho → Compartir\n` +
      `     2. Agregar: mazoteca@mazoteca.iam.gserviceaccount.com como Lector\n` +
      `     3. Hacer clic en "Guardar" (no solo agregar)\n` +
      `     4. Esperar 1-2 minutos y reintentar`
    );
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive API ${res.status} al verificar carpeta: ${body.slice(0, 200)}`);
  }
  return res.json();
}

/** Listar SOLO subcarpetas de un folder */
async function listFolders(parentId, token) {
  const params = new URLSearchParams({
    ...DRIVE_COMMON,
    q:        `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields:   "files(id,name)",
    pageSize: "1000",
    orderBy:  "name",
  });
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    { headers: driveHeaders(token) }
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
      ...DRIVE_COMMON,
      q:        `'${parentId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields:   "nextPageToken,files(id,name,mimeType)",
      pageSize: "1000",
      orderBy:  "name",
      ...(pageToken ? { pageToken } : {}),
    });
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      { headers: driveHeaders(token) }
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
 * Parsea el nombre de un archivo de carta y retorna { cardCode, variantLabel }.
 *
 * Formatos observados en Drive:
 *   KT000001-01.webp        → card: KT000001 → normalizado KT001,  variant: ""
 *   KT000001-02.webp        → card: KT000001, variant: "Arte 2"   (segunda imagen)
 *   KC001-01.webp           → card: KC001, variant: ""
 *   KC001-01-H.webp         → card: KC001, variant: "Holo"
 *   KC001-01-holo.webp      → card: KC001, variant: "Holo"
 *   KC001-03-SG.webp        → card: KC001, variant: "Stamp Gold"
 *   KC001-02-AL.webp        → card: KC001, variant: "Alternativo"
 *   KC001-02-ALFAH.webp     → card: KC001, variant: "Alternativo Foil Art Holo"
 */
function parseImageFile(filename) {
  // Regex: prefijo K + letra + dígitos largos (ej KT000001 o KC001)
  const CODE_RE = /^(K[TCREPA][0-9]{3,9})/i;
  const base = filename.replace(/\.[^.]+$/, "").trim(); // sin extensión

  const codeMatch = base.match(CODE_RE);
  if (!codeMatch) return null;

  const rawCode = codeMatch[1].toUpperCase();

  // Normalizar código largo → corto: KT000001 → KT001
  const prefix = rawCode.slice(0, 2);
  const num    = parseInt(rawCode.slice(2), 10);
  const cardCode = `${prefix}${String(num).padStart(3, "0")}`;

  // El resto: -01-SG  /  -02-AL  /  -01-holo  /  -01
  const rest = base.slice(codeMatch[0].length); // ej: "-01-SG" o "-01"

  // Separar partes por "-"
  const parts = rest.split("-").map(p => p.trim()).filter(Boolean);
  // parts[0] = número de arte (01, 02, 03...)
  // parts[1+] = sufijos de efecto

  const artNum = parseInt(parts[0], 10) || 1;

  // Sufijos de efecto (todo lo que viene después del número)
  const effectParts = parts.slice(1);
  const effectRaw   = effectParts.join("-").toUpperCase();

  let variantLabel = "";

  if (effectRaw) {
    variantLabel = EFFECT_LABELS[effectRaw] ?? effectRaw;
  } else if (artNum > 1) {
    // Sin efecto pero es un arte alternativo
    variantLabel = `Arte ${artNum}`;
  }
  // artNum === 1 y sin efecto → imagen principal, variantLabel = ""

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

  // Verificar acceso a la carpeta raíz antes de continuar
  console.log("🔍  Verificando acceso a la carpeta raíz...");
  const rootFolder = await checkRootFolder(FOLDER_ID, token);
  console.log(`✅  Carpeta encontrada: "${rootFolder.name}"\n`);

  // Nivel 1: carpetas de categoría (01-tropas, 02-coronados, ...)
  console.log("📂  Leyendo categorías...");
  const categoryFolders = await listFolders(FOLDER_ID, token);
  console.log(`   ${categoryFolders.length} categorías: ${categoryFolders.map((f) => f.name).join(", ")}\n`);

  for (const catFolder of categoryFolders) {
    console.log(`📂  ${catFolder.name}`);
    // Nivel 2: subcarpetas
    //   - Tropas:    LVL 1 / LVL 2 / LVL 3 / LVL 4  → imágenes directas
    //   - Resto:     "Nombre Personaje"/              → imágenes directas
    const subFolders = await listFolders(catFolder.id, token);

    if (subFolders.length === 0) {
      // Carpeta sin subcarpetas → imágenes directamente en la carpeta de categoría
      const images = await listImages(catFolder.id, token);
      totalImages += images.length;
      if (images.length === 0) {
        console.log(`   (sin subcarpetas ni imágenes — salteando)\n`);
        continue;
      }
      console.log(`   ${images.length} imagen${images.length !== 1 ? "es" : ""} directas`);
      for (const img of images) {
        if (img.name.startsWith(".")) continue;
        const parsed = parseImageFile(img.name);
        if (!parsed) {
          unrecognized.push(`${catFolder.name}/${img.name}`);
          continue;
        }
        rows.push({
          card_code:     parsed.cardCode,
          variant_label: parsed.variantLabel,
          drive_file_id: img.id,
          _filename:     img.name,
          _path:         `${catFolder.name}/${img.name}`,
        });
      }
      console.log();
      continue;
    }

    console.log(`   ${subFolders.length} subcarpetas: ${subFolders.map((f) => f.name).join(", ")}`);

    for (const subFolder of subFolders) {
      if (subFolder.name.startsWith(".")) continue;

      const images = await listImages(subFolder.id, token);
      totalImages += images.length;

      if (images.length === 0) {
        console.log(`   ⚠️  "${subFolder.name}" — sin imágenes`);
        continue;
      }

      console.log(`   📁 ${subFolder.name}: ${images.length} imagen${images.length !== 1 ? "es" : ""}`);

      for (const img of images) {
        if (img.name.startsWith(".")) continue;
        const parsed = parseImageFile(img.name);
        if (!parsed) {
          unrecognized.push(`${catFolder.name}/${subFolder.name}/${img.name}`);
          continue;
        }
        rows.push({
          card_code:     parsed.cardCode,
          variant_label: parsed.variantLabel,
          drive_file_id: img.id,
          _filename:     img.name,
          _path:         `${catFolder.name}/${subFolder.name}/${img.name}`,
        });
      }
    }
    console.log();
  }

  // Ordenar por código → variante
  rows.sort((a, b) =>
    a.card_code.localeCompare(b.card_code) ||
    a.variant_label.localeCompare(b.variant_label)
  );

  // Deduplicar: si el mismo (card_code, variant_label) aparece dos veces,
  // preferir el archivo con nombre más corto (formato correcto KC001-01-H vs KC000001-01-holo)
  const seen = new Map();
  const duplicates = [];
  const dedupedRows = [];
  for (const row of rows) {
    const key = `${row.card_code}|${row.variant_label}`;
    if (seen.has(key)) {
      const existing = seen.get(key);
      if (row._filename.length < existing._filename.length) {
        // El nuevo es mejor (nombre más corto = formato correcto)
        duplicates.push(`⚠️  Duplicado descartado: ${existing._path} (preferido: ${row._path})`);
        dedupedRows.splice(dedupedRows.indexOf(existing), 1);
        dedupedRows.push(row);
        seen.set(key, row);
      } else {
        duplicates.push(`⚠️  Duplicado descartado: ${row._path} (preferido: ${existing._path})`);
      }
    } else {
      seen.set(key, row);
      dedupedRows.push(row);
    }
  }

  // Escribir CSV
  const csvLines = [
    "card_code,variant_label,drive_file_id",
    ...dedupedRows.map((r) => `${r.card_code},${r.variant_label},${r.drive_file_id}`),
  ];
  writeFileSync(CSV_OUT, csvLines.join("\n") + "\n");

  // Resumen
  console.log("\n" + "═".repeat(60));
  console.log(`📊  Imágenes encontradas: ${totalImages}`);
  console.log(`✅  Filas en CSV:         ${dedupedRows.length}`);
  console.log(`🔁  Duplicados quitados:  ${duplicates.length}`);
  console.log(`❌  No reconocidos:       ${unrecognized.length}`);
  console.log(`💾  CSV guardado en:      ${CSV_OUT}`);

  // Desglose por carta
  const byCode = {};
  for (const r of dedupedRows) {
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

  if (duplicates.length > 0) {
    console.log(`\n🔁  Duplicados eliminados (archivos mal nombrados en Drive):`);
    for (const d of duplicates) console.log(`   ${d}`);
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
