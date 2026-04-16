/**
 * generate-images-map.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Genera automáticamente el archivo images-map.csv leyendo una carpeta de
 * Google Drive. Los archivos deben tener el código de carta en el nombre.
 *
 * REQUISITOS:
 *   1. Creá un Service Account en Google Cloud Console:
 *      https://console.cloud.google.com/iam-admin/serviceaccounts
 *   2. Habilitá la Google Drive API en el proyecto.
 *   3. Descargá el JSON de credenciales y guardalo como:
 *      scripts/google-service-account.json
 *   4. Compartí tu carpeta de Drive con el email del service account
 *      (aparece en el JSON como "client_email").
 *
 *   ALTERNATIVA SIN SERVICE ACCOUNT:
 *   Si tu carpeta es pública, usá --public-folder y solo necesitás el ID.
 *
 * USO:
 *   node scripts/generate-images-map.mjs --folder=FOLDER_ID_DE_DRIVE
 *   node scripts/generate-images-map.mjs --folder=FOLDER_ID_DE_DRIVE --public-folder
 *
 * El FOLDER_ID está en la URL de Drive:
 *   https://drive.google.com/drive/folders/ESTE_ES_EL_ID
 *
 * CONVENCIÓN DE NOMBRES de archivos en Drive:
 *   KT001.jpg               → imagen principal de KT001
 *   KT001_foil.jpg          → variante "Foil" de KT001
 *   KT001_foil_near-mint.jpg → variante "Foil / Near Mint" de KT001
 *   KC001_front.jpg         → imagen principal (ignora sufijos: front, back, 1, 2)
 * ────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

const CSV_OUT  = resolve(__dir, "images-map.csv");
const SA_PATH  = resolve(__dir, "google-service-account.json");

// ── CLI args ─────────────────────────────────────────────────────────────────

const args     = process.argv.slice(2);
const FOLDER_ID   = args.find((a) => a.startsWith("--folder="))?.split("=")[1];
const PUBLIC_MODE = args.includes("--public-folder");

if (!FOLDER_ID) {
  console.error("❌  Necesitás pasar --folder=FOLDER_ID_DE_DRIVE");
  console.error("    El ID está en: https://drive.google.com/drive/folders/ESTE_ID");
  process.exit(1);
}

// ── Google Drive API ─────────────────────────────────────────────────────────

/**
 * Obtener access token desde Service Account usando JWT.
 * Solo para carpetas privadas (no se necesita si es --public-folder).
 */
async function getGoogleAccessToken(sa) {
  // Importar crypto para firmar JWT
  const { createSign } = await import("crypto");

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");

  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(sa.private_key, "base64url");
  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`No access_token: ${JSON.stringify(data)}`);
  return data.access_token;
}

/**
 * Listar archivos de imagen en una carpeta de Drive (recursivo).
 */
async function listDriveFiles(folderId, accessToken) {
  const files = [];
  let pageToken = null;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,parents)",
      pageSize: "1000",
      ...(pageToken ? { pageToken } : {}),
    });

    const url = `https://www.googleapis.com/drive/v3/files?${params}`;
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    const res = await fetch(url, { headers });

    if (!res.ok) {
      const body = await res.text();
      // Si falla sin auth, intentar con API key pública (solo carpetas públicas)
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          `Sin acceso a Drive. ¿La carpeta es pública? Si no, necesitás google-service-account.json.\n${body}`
        );
      }
      throw new Error(`Drive API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken ?? null;
  } while (pageToken);

  return files;
}

/**
 * También listar subcarpetas para recursividad (una carta = una subcarpeta)
 */
async function listSubfolders(folderId, accessToken) {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "1000",
  });

  const url = `https://www.googleapis.com/drive/v3/files?${params}`;
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  return data.files ?? [];
}

/**
 * Parsear nombre de archivo → { cardCode, variantLabel }
 *
 * Convenciones soportadas:
 *   KT001.jpg                   → cardCode: KT001, variant: ""
 *   KT001_foil.jpg              → cardCode: KT001, variant: "Foil"
 *   KT001_foil_near-mint.jpg    → cardCode: KT001, variant: "Foil / Near Mint"
 *   KC001 - Viggo Foil.jpg      → cardCode: KC001, variant: "Foil"
 *   KT001_1.jpg / KT001_front.jpg → cardCode: KT001, variant: ""
 */
function parseFilename(filename) {
  const CARD_CODE_RE = /\b(K[TCREPA][0-9]{3,9})\b/i;
  const baseName = filename.replace(/\.[^.]+$/, ""); // sin extensión

  const codeMatch = baseName.match(CARD_CODE_RE);
  if (!codeMatch) return null;

  const cardCode = codeMatch[1].toUpperCase();

  // Extraer lo que sigue después del código
  const afterCode = baseName.slice(codeMatch.index + codeMatch[0].length)
    .replace(/^[\s_\-–—]+/, "")
    .trim();

  // Ignorar sufijos genéricos
  const IGNORE = /^(front|back|1|2|3|a|b|principal|main)$/i;
  if (!afterCode || IGNORE.test(afterCode)) {
    return { cardCode, variantLabel: "" };
  }

  // Convertir "foil_near-mint" → "Foil / Near Mint"
  const variantLabel = afterCode
    .split(/[_\-–]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((p) => !IGNORE.test(p))
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" / ");

  return { cardCode, variantLabel };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🗺️   generate-images-map.mjs");
  console.log("═".repeat(60));
  console.log(`📁  Carpeta Drive: ${FOLDER_ID}`);
  console.log(`🔒  Modo: ${PUBLIC_MODE ? "pública (sin auth)" : "service account"}`);

  // Obtener access token
  let accessToken = null;
  if (!PUBLIC_MODE) {
    if (!existsSync(SA_PATH)) {
      console.error(`❌  No encontré: ${SA_PATH}`);
      console.error("    Descargá el JSON del Service Account de Google Cloud Console.");
      console.error("    O usá --public-folder si tu carpeta es pública.");
      process.exit(1);
    }
    const sa = JSON.parse(readFileSync(SA_PATH, "utf8"));
    console.log(`🔑  Service Account: ${sa.client_email}`);
    accessToken = await getGoogleAccessToken(sa);
    console.log("✅  Token obtenido");
  }

  // Listar archivos en la carpeta raíz
  console.log("\n📂  Listando archivos...");
  let allFiles = await listDriveFiles(FOLDER_ID, accessToken);

  // Si hay subcarpetas (organización por carta), buscar también dentro
  const subfolders = await listSubfolders(FOLDER_ID, accessToken);
  if (subfolders.length > 0) {
    console.log(`📂  Encontré ${subfolders.length} subcarpetas — buscando dentro...`);
    for (const folder of subfolders) {
      const subFiles = await listDriveFiles(folder.id, accessToken);
      // Los archivos en subcarpetas heredan el nombre de la carpeta si no tienen código
      for (const f of subFiles) {
        // Si el filename no tiene código de carta, intentar leerlo del nombre de la carpeta
        if (!f.name.match(/\b(K[TCREPA][0-9]{3,9})\b/i) && folder.name.match(/\b(K[TCREPA][0-9]{3,9})\b/i)) {
          f._folderName = folder.name;
        }
      }
      allFiles.push(...subFiles);
    }
  }

  console.log(`📄  ${allFiles.length} imágenes encontradas`);

  // Parsear y generar rows CSV
  const rows = [];
  const unrecognized = [];

  for (const file of allFiles) {
    const nameToUse = file._folderName
      ? `${file._folderName}_${file.name}`
      : file.name;

    const parsed = parseFilename(nameToUse);
    if (!parsed) {
      unrecognized.push(file.name);
      continue;
    }

    rows.push({
      card_code: parsed.cardCode,
      variant_label: parsed.variantLabel,
      drive_file_id: file.id,
      _filename: file.name, // solo para el log
    });
  }

  // Ordenar por código + variante
  rows.sort((a, b) =>
    a.card_code.localeCompare(b.card_code) || a.variant_label.localeCompare(b.variant_label)
  );

  // Generar CSV
  const csvLines = [
    "card_code,variant_label,drive_file_id",
    ...rows.map((r) => `${r.card_code},${r.variant_label},${r.drive_file_id}`),
  ];

  writeFileSync(CSV_OUT, csvLines.join("\n") + "\n");

  // Resumen
  console.log("\n" + "═".repeat(60));
  console.log(`✅  ${rows.length} entradas generadas → ${CSV_OUT}`);

  if (unrecognized.length > 0) {
    console.log(`\n⚠️  ${unrecognized.length} archivos sin código de carta reconocido:`);
    for (const name of unrecognized.slice(0, 20)) {
      console.log(`   - ${name}`);
    }
    if (unrecognized.length > 20) console.log(`   ... y ${unrecognized.length - 20} más`);
    console.log("\n   Renombralos incluyendo el código: ej. KT001_foil.jpg");
  }

  console.log("\n📋  Preview (primeras 10 filas):");
  for (const r of rows.slice(0, 10)) {
    console.log(`   ${r.card_code.padEnd(10)} | "${r.variant_label.padEnd(20)}" | ${r.drive_file_id} (${r._filename})`);
  }

  console.log(`\n🚀  Ahora podés correr:`);
  console.log(`   node scripts/upload-images-to-tn.mjs --dry-run`);
  console.log(`   node scripts/upload-images-to-tn.mjs\n`);
}

main().catch((err) => {
  console.error("💥  Error fatal:", err.message);
  process.exit(1);
});
