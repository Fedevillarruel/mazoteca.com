import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { CatalogView } from "./catalog-view";
import { getCatalogSingles } from "@/lib/services/tiendanube-sync";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Catálogo de Cartas",
  description:
    "Catálogo completo de cartas TCG. Explorá todas las cartas existentes, filtrá por tipo y agregá a tu mazo, álbum o wishlist.",
};

export const dynamic = "force-dynamic"; // siempre server-render, datos frescos de Tiendanube

export default async function CatalogPage() {
  const singlesMap = await getCatalogSingles().catch(() => new Map());

  // Fetch user's album codes server-side for initial state
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let albumCodes = new Set<string>();
  if (user) {
    const { data } = await supabase
      .from("user_album")
      .select("card_code")
      .eq("profile_id", user.id);
    albumCodes = new Set((data ?? []).map((r: { card_code: string }) => r.card_code));
  }

  return (
    <PageLayout
      title="Catálogo de Cartas"
      description="Todas las cartas existentes — agregá a tu mazo, álbum o wishlist"
    >
      <CatalogView singlesMap={singlesMap} albumCodes={albumCodes} />
    </PageLayout>
  );
}
