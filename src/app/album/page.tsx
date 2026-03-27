import type { Metadata } from "next";
import { AlbumGate } from "./album-gate";
import { getCurrentUser } from "@/lib/actions/auth";
import { AlbumView } from "./album-view";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Álbum",
  description: "Tu álbum personal de Kingdom TCG. Registrá tu colección física y digital.",
};

export default async function AlbumPage() {
  const userSession = await getCurrentUser();

  if (!userSession?.profile) {
    return <AlbumGate />;
  }

  const supabase = await createClient();
  const userId = userSession.profile.id;

  // Fetch physical and digital inventory
  const [{ data: physicalRaw }, { data: digitalRaw }, { data: wishlistRaw }] = await Promise.all([
    supabase
      .from("physical_inventory")
      .select("card_id, quantity")
      .eq("profile_id", userId),
    supabase
      .from("digital_inventory")
      .select("card_id, quantity")
      .eq("profile_id", userId),
    supabase
      .from("wishlists")
      .select("card_id")
      .eq("profile_id", userId),
  ]);

  // Build maps: card_id → quantity
  const physicalMap: Record<string, number> = {};
  for (const row of physicalRaw ?? []) {
    physicalMap[row.card_id] = (physicalMap[row.card_id] ?? 0) + row.quantity;
  }

  const digitalMap: Record<string, number> = {};
  for (const row of digitalRaw ?? []) {
    digitalMap[row.card_id] = (digitalMap[row.card_id] ?? 0) + row.quantity;
  }

  const wishlistSet = new Set((wishlistRaw ?? []).map((r) => r.card_id));

  return (
    <AlbumView
      physicalMap={physicalMap}
      digitalMap={digitalMap}
      wishlistSet={[...wishlistSet]}
    />
  );
}
