/**
 * generate-card-variants.mjs
 * ─────────────────────────────────────────────────────────────────────
 * Lee scripts/images-map.csv y genera src/data/card-variants.json
 *
 * Cada fila con variant_label no vacío genera una "carta variante"
 * con su propio código único (ej: KC001-H, KC001-SG, KR001-ST).
 *
 * El imageIndex indica la posición 0-based de la imagen en el array
 * all_images del producto TN (las imágenes se subieron en el mismo
 * orden que el CSV: ordenado por card_code, luego por variant_label).
 *
 * Uso:
 *   node scripts/generate-card-variants.mjs
 * ─────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir   = dirname(fileURLToPath(import.meta.url));
const CSV_IN  = resolve(__dir, "images-map.csv");
const JSON_OUT = resolve(__dir, "../src/data/card-variants.json");

// ── Mapeo variant_label → sufijo de código ────────────────────────────
const LABEL_TO_SUFFIX = {
  "Holo":                    "H",
  "Stamp Gold":              "SG",
  "Stamp":                   "ST",
  "Stamp Holo":              "STH",
  "Alternativo":             "AL",
  "Alternativo Foil Art Holo": "ALFAH",
  "Alternativo Stamp":       "ALST",
  "Promo":                   "PO",
  "Promo Foil Art":          "POFA",
  "Promo Foil Art Holo":     "POFAH",
  "Arte 2":                  "2",
  "Arte 3":                  "3",
  "Arte 4":                  "4",
  "Arte 5":                  "5",
};

// ── Leer CSV ─────────────────────────────────────────────────────────
const lines = readFileSync(CSV_IN, "utf8").split("\n").filter(Boolean);
const header = lines[0]; // card_code,variant_label,drive_file_id
void header;

// Agrupar filas por card_code, ordenadas según aparecen en el CSV
const byCard = new Map(); // card_code → [{ variantLabel, driveFileId }, ...]
for (const line of lines.slice(1)) {
  const [cardCode, variantLabel = "", driveFileId = ""] = line.split(",");
  if (!cardCode || !driveFileId) continue;
  if (!byCard.has(cardCode)) byCard.set(cardCode, []);
  byCard.get(cardCode).push({ variantLabel: variantLabel.trim(), driveFileId: driveFileId.trim() });
}

// ── Generar variantes ─────────────────────────────────────────────────
const variants = [];
const unrecognized = [];

for (const [baseCode, rows] of byCard.entries()) {
  // Las filas ya están en orden del CSV (ordenadas por variant_label al generar)
  // imageIndex = posición en all_images de TN (que coincide con el orden del CSV)
  for (let i = 0; i < rows.length; i++) {
    const { variantLabel, driveFileId } = rows[i];

    // Saltear la imagen principal (variant_label vacío y hay solo 1 imagen)
    // Pero sí incluir "Arte 2", "Arte 3" etc. (imágenes alternativas del mismo producto)
    if (!variantLabel) continue; // La imagen principal no genera variante

    const suffix = LABEL_TO_SUFFIX[variantLabel];
    if (!suffix) {
      unrecognized.push(`${baseCode} — "${variantLabel}"`);
      continue;
    }

    variants.push({
      variantCode:  `${baseCode}-${suffix}`,
      baseCode,
      variantLabel,
      driveFileId,
      imageIndex: i, // posición en all_images[]
    });
  }
}

// Ordenar por variantCode
variants.sort((a, b) => a.variantCode.localeCompare(b.variantCode));

// ── Escribir JSON ─────────────────────────────────────────────────────
writeFileSync(JSON_OUT, JSON.stringify(variants, null, 2) + "\n");

// ── Resumen ───────────────────────────────────────────────────────────
console.log("\n🃏  generate-card-variants.mjs — Mazoteca");
console.log("═".repeat(55));
console.log(`📊  Cartas base:     ${byCard.size}`);
console.log(`✅  Variantes:       ${variants.length}`);
if (unrecognized.length > 0) {
  console.log(`⚠️   No reconocidos:  ${unrecognized.length}`);
  for (const u of unrecognized) console.log(`   - ${u}`);
}
console.log(`💾  Guardado en:    ${JSON_OUT}\n`);

// Preview por tipo
const byBase = {};
for (const v of variants) {
  if (!byBase[v.baseCode]) byBase[v.baseCode] = [];
  byBase[v.baseCode].push(`${v.variantLabel}(${v.variantCode})`);
}
console.log("📋  Preview — primeras 8 cartas con variantes:");
let shown = 0;
for (const [code, vars] of Object.entries(byBase)) {
  if (shown++ >= 8) break;
  console.log(`   ${code.padEnd(8)} → ${vars.join(" | ")}`);
}
