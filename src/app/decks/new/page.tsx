import type { Metadata } from "next";
import { getCatalogSingles } from "@/lib/services/tiendanube-sync";
import DeckBuilderView from "./deck-builder-view";

export const metadata: Metadata = {
  title: "Nuevo Mazo | Kingdom TCG",
  description: "Armá tu mazo de Kingdom TCG.",
};

export default async function DeckBuilderPage() {
  // Fetch image URLs from TiendaNube catalog
  const singlesMap = await getCatalogSingles().catch(() => new Map());
  const imageMap: Record<string, string | null> = {};
  for (const [code, entry] of singlesMap.entries()) {
    imageMap[code] = entry.image_url ?? null;
  }

  return <DeckBuilderView imageMap={imageMap} />;
}
