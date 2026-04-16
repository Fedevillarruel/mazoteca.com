// ============================================================
// Card Variants — generado por scripts/generate-card-variants.mjs
// Cada entrada es una variante de carta con su propio código único
// ============================================================

import rawVariants from "./card-variants.json";

export interface KTCGVariant {
  /** Código único de la variante, ej: "KC001-H", "KR001-ST" */
  variantCode: string;
  /** Código de la carta base, ej: "KC001" */
  baseCode: string;
  /** Etiqueta legible, ej: "Holo", "Stamp Gold" */
  variantLabel: string;
  /** ID del archivo en Google Drive */
  driveFileId: string;
  /**
   * Posición 0-based de la imagen en all_images[] del producto TN.
   * La carta base (principal) ocupa siempre imageIndex 0 si tiene
   * variant_label vacío. Las variantes usan el índice de la subida.
   */
  imageIndex: number;
}

export const allVariants: KTCGVariant[] = rawVariants as KTCGVariant[];

/** Mapa variantCode → KTCGVariant */
export const variantByCode: Record<string, KTCGVariant> = Object.fromEntries(
  allVariants.map((v) => [v.variantCode, v])
);

/** Mapa baseCode → lista de variantes */
export const variantsByBase: Record<string, KTCGVariant[]> = {};
for (const v of allVariants) {
  if (!variantsByBase[v.baseCode]) variantsByBase[v.baseCode] = [];
  variantsByBase[v.baseCode].push(v);
}

/** Devuelve la URL de imagen de una variante dado el singlesMap.
 *  Usa all_images[imageIndex] del producto base.
 */
export function getVariantImageUrl(
  variant: KTCGVariant,
  allImagesMap: Record<string, string[]>
): string | null {
  const images = allImagesMap[variant.baseCode] ?? [];
  return images[variant.imageIndex] ?? images[0] ?? null;
}
