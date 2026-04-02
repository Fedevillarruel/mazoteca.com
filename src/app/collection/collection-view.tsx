"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Grid3X3,
  List,
  Heart,
  SlidersHorizontal,
  X,
  Gamepad2,
} from "lucide-react";
import { toggleFavorite } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";
import { compareCards } from "@/lib/utils/card-sort";
import type { CollectionCard } from "./page";

// ── Filter options ───────────────────────────────────────────

const CATEGORIES = [
  "Tropas",
  "Coronados",
  "Realeza",
  "Estrategia",
  "Estrategia Primigenia",
  "Arroje",
] as const;

// ── Component ────────────────────────────────────────────────

export function CollectionView({ cards }: { cards: CollectionCard[] }) {
  const [view,        setView]        = useState<"grid" | "list">("grid");
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("");
  const [game,        setGame]        = useState("");
  const [showFavs,    setShowFavs]    = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Build dynamic game options from the actual cards in the album
  const gameOptions = Array.from(
    new Set(cards.map((c) => c.tn_game).filter((g): g is string => !!g))
  ).sort();

  const [optimisticCards, addOptimistic] = useOptimistic(
    cards,
    (prev: CollectionCard[], update: { code: string; value: boolean }) =>
      prev.map((c) => (c.code === update.code ? { ...c, is_favorite: update.value } : c))
  );
  const [, startTransition] = useTransition();

  const favCount = optimisticCards.filter((c) => c.is_favorite).length;

  const filtered = optimisticCards
    .filter((c) => {
      if (game && c.tn_game !== game) return false;
      if (category && c.category !== category) return false;
      if (showFavs && !c.is_favorite) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Favorites first, then canonical category/level order
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return compareCards(a, b);
    });

  function handleFavorite(card: CollectionCard) {
    startTransition(async () => {
      addOptimistic({ code: card.code, value: !card.is_favorite });
      await toggleFavorite(card.code);
    });
  }

  const clearFilters = () => {
    setSearch(""); setCategory(""); setGame(""); setShowFavs(false);
  };
  const hasFilters = !!(search || category || game || showFavs);

  return (
    <PageLayout
      title="Mi Colección"
      description="Álbum digital · Kingdom TCG"
    >
      {/* ── Header stats ── */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary-400" />
              <p className="text-sm font-medium text-surface-200">
                Álbum Digital · Kingdom TCG
              </p>
            </div>
            <div className="flex items-center gap-4">
              {favCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-rose-400">
                  <Heart className="h-3.5 w-3.5 fill-rose-400" />
                  {favCount} favorita{favCount !== 1 ? "s" : ""}
                </span>
              )}
              <span className="text-sm font-bold text-accent-400">
                {optimisticCards.length} carta{optimisticCards.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Buscar carta por nombre o código..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* View mode */}
          <div className="flex rounded-lg border border-surface-700 overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={cn("p-2 transition-colors", view === "grid" ? "bg-primary-600 text-white" : "bg-surface-800 text-surface-400 hover:text-surface-200")}
              aria-label="Vista grilla"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-2 transition-colors", view === "list" ? "bg-primary-600 text-white" : "bg-surface-800 text-surface-400 hover:text-surface-200")}
              aria-label="Vista lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Favorites toggle */}
          <button
            onClick={() => setShowFavs(!showFavs)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
              showFavs
                ? "border-rose-500 bg-rose-500/10 text-rose-400"
                : "border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200"
            )}
          >
            <Heart className={cn("h-4 w-4", showFavs && "fill-rose-400")} />
            {favCount > 0 ? `Favoritas (${favCount})` : "Favoritas"}
          </button>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
              showFilters
                ? "border-primary-500 bg-primary-500/10 text-primary-400"
                : "border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">

            {/* Game filter — only shown if there are multiple games */}
            {gameOptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Gamepad2 className="h-3.5 w-3.5" /> Juego
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={game === "" ? "primary" : "default"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => setGame("")}
                  >
                    Todos
                  </Badge>
                  {gameOptions.map((g) => (
                    <Badge
                      key={g}
                      variant={game === g ? "primary" : "default"}
                      className="cursor-pointer px-3 py-1"
                      onClick={() => setGame(g)}
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Category filter */}
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                Categoría
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={category === "" ? "primary" : "default"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setCategory("")}
                >
                  Todas
                </Badge>
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={category === cat ? "primary" : "default"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>
      )}

      {/* ── Result count ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-surface-500">
          {filtered.length} de {optimisticCards.length} cartas
          {hasFilters && (
            <button onClick={clearFilters} className="ml-2 text-primary-400 hover:text-primary-300 underline">
              Limpiar filtros
            </button>
          )}
        </p>
        <Link href="/catalog" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
          + Agregar cartas →
        </Link>
      </div>

      {/* ── Empty state ── */}
      {optimisticCards.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">Tu álbum está vacío</p>
          <p className="text-sm text-surface-500 mt-1">
            Buscá cartas en el catálogo y agregálas a tu álbum
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
          >
            Ir al catálogo
          </Link>
        </div>
      )}

      {/* ── No search results ── */}
      {optimisticCards.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-8 w-8 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400 text-sm">No se encontraron cartas con esos filtros.</p>
          <button onClick={clearFilters} className="mt-3 text-primary-400 hover:text-primary-300 text-sm underline">
            Limpiar filtros
          </button>
        </div>
      )}

      {/* ── Grid ── */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filtered.map((card) => (
            <div key={card.code} className="relative group">
              {/* Card thumbnail */}
              <Link href={`/catalog/${card.slug}`}>
                <div className="relative aspect-2.5/3.5 rounded-lg overflow-hidden border-2 border-primary-600/40 bg-surface-800 transition-transform hover:scale-105 hover:border-primary-500">
                  {card.image_url ? (
                    <Image
                      src={card.image_url}
                      alt={card.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
                      <span className="text-[9px] font-mono text-surface-400">{card.code}</span>
                      <span className="text-[10px] text-surface-300 font-medium leading-tight line-clamp-2">{card.name}</span>
                    </div>
                  )}
                  {/* Quantity badge */}
                  {card.quantity > 1 && (
                    <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{card.quantity}</span>
                    </div>
                  )}
                  {/* Favorite indicator */}
                  {card.is_favorite && (
                    <div className="absolute top-1 left-1">
                      <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400 drop-shadow" />
                    </div>
                  )}
                  {/* Category label — only shown when no image */}
                  {!card.image_url && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1.5 py-1">
                      <p className="text-[9px] text-surface-300 truncate text-center">{card.category}</p>
                    </div>
                  )}
                </div>
              </Link>

              {/* Favorite toggle button */}
              <button
                onClick={() => handleFavorite(card)}
                className={cn(
                  "absolute -top-1.5 -left-1.5 z-10 h-6 w-6 rounded-full flex items-center justify-center transition-all shadow-md",
                  card.is_favorite
                    ? "bg-rose-500 text-white opacity-100"
                    : "bg-surface-800 text-surface-400 opacity-0 group-hover:opacity-100"
                )}
                title={card.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
              >
                <Heart className={cn("h-3 w-3", card.is_favorite && "fill-white")} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── List ── */}
      {view === "list" && filtered.length > 0 && (
        <div className="space-y-1.5">
          {filtered.map((card) => (
            <div
              key={card.code}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors"
            >
              <div className="relative h-14 w-10 rounded bg-surface-700 shrink-0 overflow-hidden flex items-center justify-center">
                {card.image_url ? (
                  <Image src={card.image_url} alt={card.name} fill className="object-cover" sizes="40px" />
                ) : (
                  <span className="text-[8px] font-mono text-surface-500">{card.code.slice(-3)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/catalog/${card.slug}`} className="text-sm font-medium text-surface-100 truncate block hover:text-primary-300 transition-colors">
                  {card.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-surface-500">{card.code}</span>
                  <Badge variant="default" className="text-[10px] py-0">{card.category}</Badge>
                  {card.level != null && (
                    <Badge variant="info" className="text-[10px] py-0">Nv. {card.level}</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-surface-400 font-medium">x{card.quantity}</span>
                <button
                  onClick={() => handleFavorite(card)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    card.is_favorite
                      ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
                      : "text-surface-600 hover:text-rose-400 hover:bg-rose-500/10"
                  )}
                  title={card.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
                >
                  <Heart className={cn("h-4 w-4", card.is_favorite && "fill-rose-400")} />
                </button>
                <button
                  onClick={() => {/* TODO: remove from album */}}
                  className="p-1.5 rounded-lg text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Quitar del álbum"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
