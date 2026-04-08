import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getCardByCode } from "@/data/cards";
import { getCatalogSingles } from "@/lib/services/tiendanube-sync";
import { CollectionView } from "./collection-view";

export const metadata: Metadata = {
  title: "Mi Colección",
  description: "Álbum digital de Kingdom TCG — todas las cartas que agregaste.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const userSession = await getCurrentUser();

  if (!userSession?.profile) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Fetch album rows + singlesMap (for tn_game) in parallel
  const [{ data: albumRows }, singlesMap] = await Promise.all([
    supabase
      .from("user_album")
      .select("card_code, quantity, is_favorite")
      .eq("profile_id", userSession.profile.id)
      .order("card_code"),
    getCatalogSingles().catch(() => new Map()),
  ]);

  // Join with static card data
  const rawCards = (albumRows ?? [])
    .map((row: { card_code: string; quantity: number; is_favorite: boolean }) => {
      const card = getCardByCode(row.card_code);
      if (!card) return null;
      return {
        code: card.code,
        name: card.name,
        slug: card.slug,
        category: card.category as string,
        card_type: card.card_type as string,
        level: card.level,
        edition: card.edition,
        quantity: row.quantity ?? 1,
        is_favorite: row.is_favorite ?? false,
        tn_game: singlesMap.get(row.card_code)?.tn_game ?? null,
        image_url: singlesMap.get(row.card_code)?.image_url ?? null,
      };
    });
  const cards: CollectionCard[] = rawCards.filter((c) => c !== null) as CollectionCard[];

  return <CollectionView cards={cards} />;
}

// Type shared with the client view
export type CollectionCard = {
  code: string;
  name: string;
  slug: string;
  category: string;
  card_type: string;
  level: number | null;
  edition: string;
  quantity: number;
  is_favorite: boolean;
  tn_game: string | null;
  image_url: string | null;
};
