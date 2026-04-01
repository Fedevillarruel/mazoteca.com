import type { Metadata } from "next";
import { AlbumGate } from "./album-gate";
import { getCurrentUser } from "@/lib/actions/auth";
import { AlbumView } from "./album-view";
import { createClient } from "@/lib/supabase/server";
import { getCatalogSingles } from "@/lib/services/tiendanube-sync";

export const metadata: Metadata = {
  title: "Álbum Digital",
  description: "Tu álbum digital de Kingdom TCG. Registrá las cartas que tenés.",
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

  // Fetch user's album (card codes the user marked as owned)
  const { data: albumRows } = await supabase
    .from("user_album")
    .select("card_code")
    .eq("profile_id", userId);

  const albumSet = new Set((albumRows ?? []).map((r) => r.card_code));

  return (
    <AlbumView
      albumSet={[...albumSet]}
      singlesMap={Object.fromEntries(singlesMap)}
    />
  );
}
