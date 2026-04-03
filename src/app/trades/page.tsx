import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Star,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { allCards } from "@/data/cards";
import { AcceptOfferButton } from "./accept-offer-button";

export const metadata: Metadata = {
  title: "Intercambios",
  description: "Tus intercambios y ventas de cartas en Mazoteca.",
};

const statusConfig: Record<string, {
  label: string;
  variant: "success" | "warning" | "error" | "default" | "info";
  icon: typeof CheckCircle;
}> = {
  pending:   { label: "Pendiente",  variant: "warning", icon: Clock },
  accepted:  { label: "Aceptado",   variant: "success", icon: CheckCircle },
  rejected:  { label: "Rechazado",  variant: "error",   icon: XCircle },
  cancelled: { label: "Cancelado",  variant: "default", icon: XCircle },
  expired:   { label: "Expirado",   variant: "default", icon: AlertTriangle },
};

function cardName(code: string) {
  return allCards.find((c) => c.code === code)?.name ?? code;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TradesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch offers where current user is the buyer (sent)
  const { data: sentOffers } = await supabase
    .from("listing_offers")
    .select(`
      id, offer_type, offer_card_code, offer_price, note, status, created_at,
      listing:card_listings(
        id, card_code, listing_type, price, seller_id,
        seller:profiles(id, username, display_name, avatar_url, reputation, total_trades)
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch offers on MY listings (received)
  const { data: receivedOffers } = await supabase
    .from("listing_offers")
    .select(`
      id, offer_type, offer_card_code, offer_price, note, status, created_at,
      buyer:profiles(id, username, display_name, avatar_url, reputation, total_trades),
      listing:card_listings(id, card_code, listing_type, price, seller_id)
    `)
    .in(
      "listing_id",
      // sub-select: listing ids owned by current user
      (await supabase.from("card_listings").select("id").eq("seller_id", user.id)).data?.map((l) => l.id) ?? []
    )
    .order("created_at", { ascending: false });

  // Fetch private chats
  const { data: chats } = await supabase
    .from("private_chats")
    .select(`
      id, created_at, closed_at, expires_at,
      participant_a, participant_b,
      a_profile:profiles!private_chats_participant_a_fkey(id, username, display_name, avatar_url, reputation),
      b_profile:profiles!private_chats_participant_b_fkey(id, username, display_name, avatar_url, reputation)
    `)
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // My ratings given/received
  const { data: ratingsReceived } = await supabase
    .from("trade_ratings")
    .select("id, score, comment, created_at, rater:profiles(username, avatar_url)")
    .eq("rated_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Stats
  const pending = (sentOffers ?? []).filter((o) => o.status === "pending").length
                + (receivedOffers ?? []).filter((o) => o.status === "pending").length;
  const accepted = (chats ?? []).length;
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("reputation, total_trades")
    .eq("id", user.id)
    .single();

  const rep = Math.round(Number(myProfile?.reputation ?? 0) * 20);
  const now = new Date().getTime();

  return (
    <PageLayout title="Intercambios" description="Tus ofertas, chats y reputación">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Card variant="glass">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">{pending}</p>
            <p className="text-xs text-surface-400">Pendientes</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-green-400">{myProfile?.total_trades ?? 0}</p>
            <p className="text-xs text-surface-400">Completados</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-primary-400">{accepted}</p>
            <p className="text-xs text-surface-400">Chats abiertos</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-accent-400 flex items-center justify-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {rep}/100
            </p>
            <p className="text-xs text-surface-400">Reputación</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Received offers (on my listings) ── */}
      {(receivedOffers ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-3">
            Ofertas recibidas
          </h2>
          <div className="space-y-3">
            {(receivedOffers ?? []).map((offer) => {
              const listing = Array.isArray(offer.listing) ? offer.listing[0] : offer.listing;
              const buyer = Array.isArray(offer.buyer) ? offer.buyer[0] : offer.buyer;
              const status = statusConfig[offer.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;
              const buyerRep = Math.round(Number((buyer as { reputation?: number })?.reputation ?? 0) * 20);
              return (
                <Card key={offer.id} variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant={status.variant}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge variant="default">Recibida</Badge>
                          <span className="text-xs text-surface-500">{formatDate(offer.created_at)}</span>
                        </div>

                        {/* Buyer info */}
                        <div className="flex items-center gap-2 mb-2">
                          {(buyer as { avatar_url?: string })?.avatar_url ? (
                            <Image src={(buyer as { avatar_url: string }).avatar_url} alt="" width={20} height={20} className="rounded-full" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-surface-700" />
                          )}
                          <Link href={`/profile/${(buyer as { username: string })?.username}`} className="text-sm font-medium text-primary-400 hover:underline">
                            {(buyer as { display_name?: string; username: string })?.display_name ?? (buyer as { username: string })?.username}
                          </Link>
                          {buyerRep > 0 && (
                            <span className="text-xs text-amber-400">★ {buyerRep}/100</span>
                          )}
                        </div>

                        {/* What they offer */}
                        <p className="text-sm text-surface-300">
                          {offer.offer_type === "buy"
                            ? `Ofrece $${offer.offer_price?.toLocaleString("es-AR")} por `
                            : `Quiere intercambiar ${cardName(offer.offer_card_code ?? "")} por `}
                          <span className="font-medium text-surface-100">
                            {cardName((listing as { card_code: string })?.card_code ?? "")}
                          </span>
                        </p>
                        {offer.note && (
                          <p className="text-xs text-surface-500 italic mt-1">&ldquo;{offer.note}&rdquo;</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        {offer.status === "pending" && (
                          <AcceptOfferButton offerId={offer.id} />
                        )}
                        {offer.status === "accepted" && (
                          <Link href="/trades#chats">
                            <Button size="sm" variant="secondary">
                              <MessageSquare className="h-4 w-4" />
                              Ver chat
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Sent offers ── */}
      {(sentOffers ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-3">
            Mis ofertas enviadas
          </h2>
          <div className="space-y-3">
            {(sentOffers ?? []).map((offer) => {
              const listing = Array.isArray(offer.listing) ? offer.listing[0] : offer.listing;
              const seller = Array.isArray((listing as { seller?: unknown })?.seller)
                ? ((listing as { seller: unknown[] }).seller)[0]
                : (listing as { seller?: unknown })?.seller;
              const status = statusConfig[offer.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;
              const sellerRep = Math.round(Number((seller as { reputation?: number })?.reputation ?? 0) * 20);
              return (
                <Card key={offer.id} variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant={status.variant}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge variant="default">Enviada</Badge>
                          <span className="text-xs text-surface-500">{formatDate(offer.created_at)}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-surface-400">Para:</span>
                          <Link href={`/profile/${(seller as { username?: string })?.username ?? "#"}`} className="text-sm font-medium text-primary-400 hover:underline">
                            {(seller as { display_name?: string; username?: string })?.display_name ?? (seller as { username?: string })?.username}
                          </Link>
                          {sellerRep > 0 && (
                            <span className="text-xs text-amber-400">★ {sellerRep}/100</span>
                          )}
                        </div>

                        <p className="text-sm text-surface-300">
                          {offer.offer_type === "buy"
                            ? `Tu oferta: $${offer.offer_price?.toLocaleString("es-AR")} por `
                            : `Tu oferta: ${cardName(offer.offer_card_code ?? "")} por `}
                          <span className="font-medium text-surface-100">
                            {cardName((listing as { card_code?: string })?.card_code ?? "")}
                          </span>
                        </p>
                        {offer.note && (
                          <p className="text-xs text-surface-500 italic mt-1">&ldquo;{offer.note}&rdquo;</p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {offer.status === "accepted" && (
                          <Link href="/trades#chats">
                            <Button size="sm" variant="secondary">
                              <MessageSquare className="h-4 w-4" />
                              Chat
                            </Button>
                          </Link>
                        )}
                        {offer.status === "pending" && (
                          <span className="text-xs text-surface-500">Esperando respuesta</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Chats / Active trades ── */}
      <section className="mb-8" id="chats">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-3">
          Chats de intercambio
        </h2>
        {(chats ?? []).length === 0 ? (
          <Card variant="glass">
            <CardContent className="py-10 text-center text-surface-500 text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Todavía no hay chats activos. Cuando aceptes o te acepten una oferta, aparecerá acá.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(chats ?? []).map((chat) => {
              const isA = chat.participant_a === user.id;
              const otherProfile = isA
                ? (Array.isArray(chat.b_profile) ? chat.b_profile[0] : chat.b_profile)
                : (Array.isArray(chat.a_profile) ? chat.a_profile[0] : chat.a_profile);
              const other = otherProfile as { username?: string; display_name?: string; avatar_url?: string; reputation?: number } | null;
              const otherRep = Math.round(Number(other?.reputation ?? 0) * 20);
              const isClosed = Boolean(chat.closed_at);
              const expiresAt = chat.expires_at ? new Date(chat.expires_at as string) : null;
              const daysLeft = expiresAt
                ? Math.max(0, Math.ceil((expiresAt.getTime() - now) / 86_400_000))
                : null;

              return (
                <Card key={chat.id} variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {other?.avatar_url ? (
                          <Image src={other.avatar_url} alt="" width={36} height={36} className="rounded-full shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-surface-700 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/profile/${other?.username ?? "#"}`} className="text-sm font-medium text-surface-100 hover:text-primary-400">
                              {other?.display_name ?? other?.username ?? "Usuario"}
                            </Link>
                            {otherRep > 0 && (
                              <span className="text-xs text-amber-400">★ {otherRep}/100</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {isClosed ? (
                              <Badge variant="default">Cerrado</Badge>
                            ) : (
                              <>
                                <Badge variant="success">Activo</Badge>
                                {daysLeft !== null && (
                                  <span className={`text-xs ${daysLeft <= 1 ? "text-red-400" : "text-surface-500"}`}>
                                    {daysLeft > 0 ? `Cierra en ${daysLeft}d` : "Cierra hoy"}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/trades/chat/${chat.id}`}>
                        <Button size="sm" variant={isClosed ? "ghost" : "secondary"}>
                          <MessageSquare className="h-4 w-4" />
                          {isClosed ? "Ver historial" : "Abrir chat"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── My ratings ── */}
      {(ratingsReceived ?? []).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-3">
            Puntuaciones recibidas
          </h2>
          <div className="space-y-2">
            {(ratingsReceived ?? []).map((r) => {
              const rater = Array.isArray(r.rater) ? r.rater[0] : r.rater;
              return (
                <Card key={r.id} variant="glass">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex gap-0.5 shrink-0">
                      {[1,2,3,4,5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${s <= r.score ? "fill-amber-400 text-amber-400" : "text-surface-700"}`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      {r.comment && (
                        <p className="text-sm text-surface-300 italic truncate">&ldquo;{r.comment}&rdquo;</p>
                      )}
                      <p className="text-xs text-surface-500">
                        por <Link href={`/profile/${(rater as { username?: string })?.username ?? "#"}`} className="text-surface-400 hover:underline">
                          {(rater as { username?: string })?.username}
                        </Link> · {formatDate(r.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {(sentOffers ?? []).length === 0 && (receivedOffers ?? []).length === 0 && (chats ?? []).length === 0 && (
        <Card variant="glass">
          <CardContent className="py-16 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-surface-600" />
            <p className="text-surface-300 font-medium mb-2">Todavía no tenés intercambios</p>
            <p className="text-sm text-surface-500 mb-5">
              Explorá las cartas en Trading y hacé una oferta, o publicá las tuyas desde tu álbum.
            </p>
            <Link href="/forum?tab=trading">
              <Button>
                <RefreshCw className="h-4 w-4" />
                Ver Trading
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
