import type { Metadata } from "next";
import { AlbumGate } from "./album-gate";
import { getCurrentUser } from "@/lib/actions/auth";
import { AlbumView } from "./album-view";
import { createClient } from "@/lib/supabase/server";
import { getCatalogSingles } from "@/lib/services/tiendanube-sync";

export const metadata: Metadata = {
  title: "Álbum Digital",
  description: "Tu álbum digital de Kingdom TCG. Registrá las cartas que tenés.",
  robots: { index: false, follow: false },
};

export const revalidate = 30;

export default async function AlbumPage() {
  const userSession = await getCurrentUser();

  if (!userSession?.profile) {
    return <AlbumGate />;
  }

  const [supabase, singlesMap] = await Promise.all([
    createClient(),
    getCatalogSingles().catch(() => new Map()),
  ]);

  const userId = userSession.profile.id;

  // Fetch user's album (card codes + quantities + wishlist)
  const { data: albumRows } = await supabase
    .from("user_album")
    .select("card_code, quantity, is_wishlisted")
    .eq("profile_id", userId);

  // albumMap: code → quantity (0 = wishlisted but not owned)
  const albumMap: Record<string, number> = {};
  const wishlistSet: string[] = [];
  for (const row of albumRows ?? []) {
    if ((row.quantity ?? 0) > 0) albumMap[row.card_code] = row.quantity ?? 1;
    if (row.is_wishlisted) wishlistSet.push(row.card_code);
  }

  const singlesObj = Object.fromEntries(singlesMap);

  // allImagesMap: base card code → array de URLs de imágenes del producto TN
  // (se usa para obtener la imagen de cada variante por imageIndex)
  const allImagesMap: Record<string, string[]> = {};
  for (const [code, entry] of singlesMap.entries()) {
    if (entry.all_images.length > 0) allImagesMap[code] = entry.all_images;
  }

  return (
    <AlbumView
      albumMap={albumMap}
      singlesMap={singlesObj}
      allImagesMap={allImagesMap}
      initialWishlist={wishlistSet}
      username={userSession.profile.username ?? ""}
    />
  );
}
