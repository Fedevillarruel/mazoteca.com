import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // used for photos + seller avatar
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { OfferForm } from "./offer-form";
import { allCards } from "@/data/cards";

export const metadata: Metadata = { title: "Hacer oferta" };

const conditionLabel: Record<string, string> = {
  mint: "Mint", near_mint: "Near Mint", excellent: "Excelente",
  good: "Buena", lightly_played: "Poco jugada", played: "Jugada", poor: "Mala",
};

export default async function OfferPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listing } = await supabase
    .from("card_listings")
    .select(`
      id, card_code, listing_type, price, condition, note,
      photo_front_url, photo_back_url, status, seller_id,
      seller:profiles(id, username, display_name, avatar_url, reputation, total_trades)
    `)
    .eq("id", listingId)
    .single();

  if (!listing || listing.status !== "active") notFound();
  if (listing.seller_id === user.id) redirect("/trades");

  // Buyer's album cards (for trade offers)
  const { data: albumRows } = await supabase
    .from("user_album")
    .select("card_code, quantity_owned")
    .eq("user_id", user.id)
    .gt("quantity_owned", 0);

  const albumCards = (albumRows ?? []).map((r) => {
    const card = allCards.find((c) => c.code === r.card_code);
    return { code: r.card_code, name: card?.name ?? r.card_code, qty: r.quantity_owned };
  });

  const cardInfo = allCards.find((c) => c.code === listing.card_code);
  const cardName = cardInfo?.name ?? listing.card_code;
  const seller = Array.isArray(listing.seller) ? listing.seller[0] : listing.seller;
  const rep = Number(seller?.reputation ?? 0);
  const repScore = Math.round(rep * 20); // 0-5 scale to 0-100

  return (
    <PageLayout>
      <Link
        href="/forum?tab=trading"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Trading
      </Link>

      <h1 className="text-2xl font-bold text-surface-50 mb-6">Hacer una oferta</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Listing detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Card info */}
            <div className="flex items-start gap-3">
              <div className="h-21 w-15 rounded-lg bg-surface-700 flex items-center justify-center text-xs text-surface-500 shrink-0 text-center px-1">
                {listing.card_code}
              </div>
              <div>
                <p className="font-semibold text-surface-100">{cardName}</p>
                <p className="text-xs text-surface-400 mb-2">{listing.card_code}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={listing.listing_type === "sale" ? "success" : listing.listing_type === "trade" ? "info" : "warning"}>
                    {listing.listing_type === "sale" ? "Venta" : listing.listing_type === "trade" ? "Intercambio" : "Venta/Intercambio"}
                  </Badge>
                  <Badge variant="default">{conditionLabel[listing.condition] ?? listing.condition}</Badge>
                  {listing.price && (
                    <span className="text-green-400 font-semibold text-sm">
                      ${listing.price.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>
                {listing.note && (
                  <p className="text-xs text-surface-400 mt-2 italic">{listing.note}</p>
                )}
              </div>
            </div>

            {/* Photos */}
            {(listing.photo_front_url || listing.photo_back_url) && (
              <div className="flex gap-3">
                {listing.photo_front_url && (
                  <div className="flex-1">
                    <p className="text-xs text-surface-500 mb-1">Frente</p>
                    <Image
                      src={listing.photo_front_url}
                      alt="Frente"
                      width={160}
                      height={220}
                      className="rounded-lg object-cover w-full max-h-44"
                    />
                  </div>
                )}
                {listing.photo_back_url && (
                  <div className="flex-1">
                    <p className="text-xs text-surface-500 mb-1">Dorso</p>
                    <Image
                      src={listing.photo_back_url}
                      alt="Dorso"
                      width={160}
                      height={220}
                      className="rounded-lg object-cover w-full max-h-44"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Seller */}
            <div className="pt-2 border-t border-surface-800">
              <p className="text-xs text-surface-500 mb-1">Vendedor / Intercambiador</p>
              <div className="flex items-center gap-2">
                {seller?.avatar_url ? (
                  <Image src={seller.avatar_url} alt={seller.username} width={28} height={28} className="rounded-full" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-surface-700" />
                )}
                <div>
                  <Link href={`/profile/${seller?.username}`} className="text-sm font-medium text-surface-200 hover:text-primary-400">
                    {seller?.display_name ?? seller?.username}
                  </Link>
                  {repScore > 0 && (
                    <p className="text-xs text-amber-400">★ {repScore}/100 · {seller?.total_trades ?? 0} intercambios</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offer form */}
        <OfferForm
          listingId={listingId}
          listingType={listing.listing_type as "sale" | "trade" | "both"}
          albumCards={albumCards}
        />
      </div>
    </PageLayout>
  );
}
