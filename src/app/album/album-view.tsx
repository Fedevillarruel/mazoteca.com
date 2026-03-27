"use client";

import { useState, useRef, forwardRef } from "react";
import Link from "next/link";
import HTMLFlipBook from "react-pageflip";
import { allCards, type KTCGCard, type KTCGCategory } from "@/data/cards";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Monitor,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
  Crown,
  Shield,
  Star,
  Scroll,
  Sparkles,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---- Types ----
type AlbumType = "fisica" | "digital";

interface AlbumViewProps {
  physicalMap: Record<string, number>; // card_id (UUID) → qty  [from DB]
  digitalMap: Record<string, number>;  // card_id (UUID) → qty  [from DB]
  wishlistSet: string[];               // card_id (UUID)[]
}

// ---- Category icon map ----
const categoryIcon: Record<KTCGCategory, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

// ---- Page component (forwarded ref required by react-pageflip) ----
const AlbumPage = forwardRef<
  HTMLDivElement,
  {
    cards: (KTCGCard | null)[];
    pageNumber: number;
    qty: (code: string) => number;
    onWishlist: (code: string) => boolean;
  }
>(({ cards, pageNumber, qty, onWishlist }, ref) => {
  return (
    <div
      ref={ref}
      className="album-page bg-surface-900 border border-surface-800 select-none overflow-hidden"
      style={{ width: "100%", height: "100%" }}
    >
      <div className="h-full flex flex-col p-3 gap-2">
        <div className="grid grid-cols-3 gap-2 flex-1">
          {cards.map((card, idx) => {
            if (!card) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="border-2 border-dashed border-surface-700/50 rounded-lg flex items-center justify-center aspect-2.5/3.5"
                >
                  <Plus className="h-4 w-4 text-surface-700" />
                </div>
              );
            }
            const Icon = categoryIcon[card.category];
            const count = qty(card.code);
            const wishlisted = onWishlist(card.code);

            return (
              <div
                key={card.code}
                className={cn(
                  "relative rounded-lg border aspect-2.5/3.5 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all",
                  count > 0
                    ? "border-primary-500/40 bg-primary-500/5"
                    : wishlisted
                    ? "border-pink-500/40 bg-pink-500/5"
                    : "border-surface-700/30 bg-surface-800/50 opacity-40"
                )}
                title={card.name}
              >
                <Icon className={cn("h-5 w-5 mb-1", count > 0 ? "text-primary-400" : "text-surface-600")} />
                <span className="text-[8px] text-center px-1 text-surface-400 leading-tight line-clamp-2">
                  {card.name}
                </span>
                <span className="text-[7px] font-mono text-surface-600 mt-0.5">{card.code}</span>

                {count > 1 && (
                  <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {count}
                  </div>
                )}
                {wishlisted && count === 0 && (
                  <div className="absolute top-1 right-1">
                    <Heart className="h-3 w-3 text-pink-400 fill-pink-400" />
                  </div>
                )}
                {count > 0 && (
                  <div className="absolute top-1 left-1 h-3 w-3 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-[7px] text-white font-bold">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center text-[9px] text-surface-600 mt-1">Pág. {pageNumber}</p>
      </div>
    </div>
  );
});
AlbumPage.displayName = "AlbumPage";

// ---- Cover Page ----
const CoverPage = forwardRef<HTMLDivElement, { title: string; subtitle: string }>(
  ({ title, subtitle }, ref) => (
    <div
      ref={ref}
      className="bg-surface-950 border border-surface-700 flex flex-col items-center justify-center select-none"
      style={{ width: "100%", height: "100%" }}
    >
      <Crown className="h-12 w-12 text-accent-400 mb-4" />
      <h2 className="text-xl font-bold text-surface-50 text-center px-4">{title}</h2>
      <p className="text-sm text-surface-400 mt-2 text-center px-4">{subtitle}</p>
      <p className="text-xs text-surface-600 mt-6">Kingdom TCG™ — Mazoteca.com</p>
    </div>
  )
);
CoverPage.displayName = "CoverPage";

// ---- Main AlbumView ----
export function AlbumView({ physicalMap, digitalMap, wishlistSet }: AlbumViewProps) {
  const [albumType, setAlbumType] = useState<AlbumType>("fisica");

  const wishlistIds = new Set(wishlistSet);

  // NOTE: physicalMap/digitalMap keys are Supabase card UUIDs.
  // allCards uses short codes like "KT001". Until the DB cards table is seeded
  // with matching UUIDs we show real counts only when available, otherwise 0.
  // The map lookup by code acts as a graceful fallback.
  const activeMap = albumType === "fisica" ? physicalMap : digitalMap;

  // Build a code→qty map from the active DB map
  // (If keys happen to match codes directly, it works. Otherwise counts = 0 gracefully.)
  const codeQty = (code: string): number => activeMap[code] ?? 0;
  const codeWishlist = (code: string): boolean => wishlistIds.has(code);

  const ownedCount = allCards.filter((c) => codeQty(c.code) > 0).length;
  const wishlistCount = allCards.filter((c) => codeWishlist(c.code) && codeQty(c.code) === 0).length;
  const totalCards = allCards.length;

  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null);

  const CARDS_PER_PAGE = 9;
  const cardList = [...allCards];
  while (cardList.length % CARDS_PER_PAGE !== 0) cardList.push(null as unknown as KTCGCard);
  const chunks: (KTCGCard | null)[][] = [];
  for (let i = 0; i < cardList.length; i += CARDS_PER_PAGE) {
    chunks.push(cardList.slice(i, i + CARDS_PER_PAGE) as (KTCGCard | null)[]);
  }

  return (
    <PageLayout title="Álbum" description="Tu colección personal de Kingdom TCG">
      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setAlbumType("fisica")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            albumType === "fisica"
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
          )}
        >
          <Package className="h-4 w-4" />
          Álbum Físico
        </button>
        <button
          onClick={() => setAlbumType("digital")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            albumType === "digital"
              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
          )}
        >
          <Monitor className="h-4 w-4" />
          Álbum Digital
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-primary-400">{ownedCount}</p>
            <p className="text-xs text-surface-400">Cartas en álbum</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-surface-300">{totalCards}</p>
            <p className="text-xs text-surface-400">Total en el juego</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-pink-400">{wishlistCount}</p>
            <p className="text-xs text-surface-400">En wishlist</p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Badge variant="default" className="gap-1.5">
          <div className="h-2 w-2 rounded-full bg-primary-400" />
          Tenés esta carta
        </Badge>
        <Badge variant="default" className="gap-1.5">
          <Heart className="h-3 w-3 text-pink-400 fill-pink-400" />
          En tu wishlist
        </Badge>
        <Badge variant="default" className="gap-1.5">
          <div className="h-2 w-2 rounded-full bg-surface-600" />
          No tenés
        </Badge>
        {ownedCount === 0 && (
          <span className="text-xs text-surface-500 ml-2">
            · Agregá cartas desde{" "}
            <Link href="/catalog" className="text-primary-400 underline">el catálogo</Link>{" "}
            o desde los{" "}
            <Link href="/decks" className="text-primary-400 underline">mazos oficiales</Link>
          </span>
        )}
      </div>

      {/* Album type label */}
      <div className="flex items-center gap-2 mb-4">
        {albumType === "fisica" ? (
          <><Package className="h-4 w-4 text-amber-400" /><span className="text-sm font-medium text-amber-400">Colección Física</span></>
        ) : (
          <><Monitor className="h-4 w-4 text-blue-400" /><span className="text-sm font-medium text-blue-400">Colección Digital</span></>
        )}
      </div>

      {/* FlipBook */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-full overflow-hidden" style={{ maxWidth: 700 }}>
          <HTMLFlipBook
            ref={bookRef}
            width={340}
            height={480}
            size="fixed"
            minWidth={240}
            maxWidth={500}
            minHeight={320}
            maxHeight={700}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            className="mx-auto"
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={600}
            usePortrait={false}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            <CoverPage
              title={`Álbum ${albumType === "fisica" ? "Físico" : "Digital"}`}
              subtitle={`${ownedCount} / ${totalCards} cartas · Mazoteca.com`}
            />
            {chunks.map((chunk, idx) => (
              <AlbumPage
                key={idx}
                cards={chunk}
                pageNumber={idx + 1}
                qty={codeQty}
                onWishlist={codeWishlist}
              />
            ))}
            <CoverPage
              title="Kingdom TCG™"
              subtitle="Mazoteca.com — Tu colección, tu comunidad."
            />
          </HTMLFlipBook>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-xs text-surface-500">{chunks.length} páginas · {totalCards} cartas</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => bookRef.current?.pageFlip().flipNext()}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
