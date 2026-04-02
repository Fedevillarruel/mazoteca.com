import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  Crown,
  Layers,
  ShoppingBag,
  Star,
  Calendar,
  MessageSquare,
  Heart,
  Swords,
  Scroll,
  BookMarked,
  Shield,
  Sparkles,
  Crosshair,
} from "lucide-react";
import { getProfileByUsername, getPublicDecksByUsername, getWishlistByUsername } from "@/lib/queries";
import { getCurrentUser } from "@/lib/actions/auth";
import { ReportUserButton } from "./report-user-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Perfil de ${username}`,
    description: `Mirá el perfil, colección y mazos de ${username} en Mazoteca.`,
  };
}

const categoryIcon: Record<string, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

function priorityLabel(p: number) {
  if (p >= 4) return { label: "Alta", cls: "bg-red-500/15 text-red-400 border-red-500/30" };
  if (p >= 2) return { label: "Media", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  return { label: "Baja", cls: "bg-surface-700 text-surface-400 border-surface-600" };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [profile, decks, wishlist, currentUser] = await Promise.all([
    getProfileByUsername(username).catch(() => null),
    getPublicDecksByUsername(username).catch(() => []),
    getWishlistByUsername(username).catch(() => []),
    getCurrentUser().catch(() => null),
  ]);

  if (!profile) notFound();

  const isOwn = currentUser?.profile?.id === profile.id;
  const memberSince = new Date(profile.created_at).toLocaleDateString("es-AR", {
    month: "short",
    year: "numeric",
  });

  return (
    <PageLayout>
      {/* ── Profile Header ── */}
      <div className="relative mb-8">
        <div className="h-40 sm:h-52 rounded-2xl bg-linear-to-r from-primary-900 via-primary-800 to-accent-900/40 overflow-hidden" />

        <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12 sm:-mt-14 px-4 sm:px-6">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-surface-900 bg-surface-800 overflow-hidden shrink-0">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={username} fill className="object-cover" />
            ) : (
              <Image
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${username}`}
                alt={username}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="flex-1 pt-2 sm:pt-14 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-surface-50">
                {profile.display_name || username}
              </h1>
              {profile.display_name && (
                <span className="text-surface-400 text-sm">@{username}</span>
              )}
              {profile.is_premium && (
                <Badge variant="success">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
              {profile.role === "admin" && <Badge variant="warning">Admin</Badge>}
            </div>
            {profile.bio && (
              <p className="text-sm text-surface-400 mb-3 max-w-lg">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-surface-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Miembro desde {memberSince}
              </span>
              {profile.location && (
                <span>📍 {profile.location}</span>
              )}
            </div>
          </div>

          {!isOwn && (
            <div className="flex items-center gap-2 shrink-0 sm:pt-14">
              <Button size="sm">
                <UserPlus className="h-4 w-4" />
                Agregar amigo
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
              {currentUser && (
                <ReportUserButton targetId={profile.id} username={username} />
              )}
            </div>
          )}
          {isOwn && (
            <div className="sm:pt-14">
              <Button variant="secondary" size="sm">
                <Link href="/settings">Editar perfil</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Layers className="h-5 w-5 mx-auto mb-2 text-primary-400" />
            <p className="text-xl font-bold text-surface-50">{decks.length}</p>
            <p className="text-xs text-surface-400">Mazos</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Heart className="h-5 w-5 mx-auto mb-2 text-rose-400" />
            <p className="text-xl font-bold text-surface-50">{wishlist.length}</p>
            <p className="text-xs text-surface-400">Wishlist</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-5 w-5 mx-auto mb-2 text-amber-400" />
            <p className="text-xl font-bold text-surface-50">{profile.total_sales ?? 0}</p>
            <p className="text-xs text-surface-400">Ventas</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-2 text-yellow-400" />
            <p className="text-xl font-bold text-surface-50">
              {Number(profile.reputation ?? 0).toFixed(1)}★
            </p>
            <p className="text-xs text-surface-400">Reputación</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Decks 2/3 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary-400" />
                  Mazos públicos
                </span>
                {decks.length > 0 && (
                  <span className="text-xs text-surface-500 font-normal">
                    {decks.length} mazo{decks.length !== 1 ? "s" : ""}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {decks.length === 0 ? (
                <div className="text-center py-10 text-surface-500">
                  <Layers className="h-9 w-9 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Todavía no hay mazos públicos.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {decks.map((deck) => {
                    const cardCount = Array.isArray(deck.deck_cards)
                      ? (deck.deck_cards as { card_id: string; quantity?: number }[])
                          .reduce((s, dc) => s + (dc.quantity ?? 1), 0)
                      : 0;
                    return (
                      <Link
                        key={deck.id}
                        href={`/decks/${deck.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50 hover:bg-surface-700/50 border border-surface-800 hover:border-surface-700 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                              deck.deck_type === "combatants"
                                ? "bg-primary-900/60 text-primary-400"
                                : "bg-amber-900/40 text-amber-400"
                            }`}
                          >
                            {deck.deck_type === "combatants"
                              ? <Swords className="h-4 w-4" />
                              : <Scroll className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-surface-100 truncate">{deck.name}</p>
                            <p className="text-xs text-surface-400">
                              {deck.deck_type === "combatants" ? "Combatientes" : "Estrategia"}
                              {cardCount > 0 && ` · ${cardCount} cartas`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {deck.is_valid
                            ? <Badge variant="success">Válido</Badge>
                            : <Badge variant="warning">Incompleto</Badge>}
                          {deck.likes_count > 0 && (
                            <span className="text-xs text-surface-500 flex items-center gap-0.5">
                              <Heart className="h-3 w-3 text-rose-400" />{deck.likes_count}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Wishlist 1/3 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-violet-400" />
                  Wishlist
                </span>
                {wishlist.length > 0 && (
                  <span className="text-xs text-surface-500 font-normal">{wishlist.length}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wishlist.length === 0 ? (
                <div className="text-center py-10 text-surface-500">
                  <Heart className="h-9 w-9 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">La wishlist está vacía.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {wishlist.map((item) => {
                    const card = item.card as unknown as {
                      id: string; name: string; slug: string; code: string;
                      image_url?: string; category?: string;
                    } | null;
                    if (!card) return null;
                    const Icon = categoryIcon[card.category ?? ""] ?? Shield;
                    const prio = priorityLabel(item.priority);
                    return (
                      <Link
                        key={item.id}
                        href={`/catalog/${card.slug}`}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-800/50 hover:bg-surface-700/50 border border-surface-800 hover:border-surface-700 transition-all"
                      >
                        <div className="h-10 w-7 rounded bg-surface-700 overflow-hidden shrink-0 flex items-center justify-center relative">
                          {card.image_url ? (
                            <Image
                              src={card.image_url}
                              alt={card.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          ) : (
                            <Icon className="h-4 w-4 text-surface-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-surface-100 truncate">{card.name}</p>
                          <p className="text-[10px] text-surface-500 font-mono">{card.code}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${prio.cls}`}>
                          {prio.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </PageLayout>
  );
}
