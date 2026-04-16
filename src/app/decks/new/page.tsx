import type { Metadata } from "next";
import { getCatalogSingles } from "@/lib/services/tiendanube-sync";
import { createClient } from "@/lib/supabase/server";
import DeckBuilderView from "./deck-builder-view";

export const metadata: Metadata = {
  title: "Nuevo Mazo | Kingdom TCG",
  description: "Armá tu mazo de Kingdom TCG.",
};

export const dynamic = "force-dynamic";

export default async function DeckBuilderPage() {
  // Fetch image URLs from TiendaNube catalog
  const singlesMap = await getCatalogSingles().catch(() => new Map());
  const imageMap: Record<string, string | null> = {};
  const allImagesMap: Record<string, string[]> = {};
  for (const [code, entry] of singlesMap.entries()) {
    imageMap[code] = entry.image_url ?? null;
    allImagesMap[code] = entry.all_images ?? [];
  }

  // Load user's album so the pool only shows owned cards
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const albumMap: Record<string, number> = {};
  if (user) {
    const { data } = await supabase
      .from("user_album")
      .select("card_code, quantity")
      .eq("profile_id", user.id)
      .gt("quantity", 0);
    for (const row of (data ?? []) as { card_code: string; quantity: number }[]) {
      albumMap[row.card_code] = row.quantity;
    }
  }

  return <DeckBuilderView imageMap={imageMap} allImagesMap={allImagesMap} albumMap={albumMap} />;
}
