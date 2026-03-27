"use client";

import { useState, useRef, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { allCards, type KTCGCard } from "@/data/cards";
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
import type { KTCGCategory } from "@/data/cards";

// ---- Types ----
type AlbumType = "fisica" | "digital";

interface OwnedCard {
  card: KTCGCard;
  quantity: number;
  onWishlist: boolean;
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
  { cards: (KTCGCard | null)[]; pageNumber: number; owned: Map<string, OwnedCard> }
>(({ cards, pageNumber, owned }, ref) => {
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
            const ownedEntry = owned.get(card.code);
            const qty = ownedEntry?.quantity ?? 0;
            const onWishlist = ownedEntry?.onWishlist ?? false;

            return (
              <div
                key={card.code}
                className={cn(
                  "relative rounded-lg border aspect-2.5/3.5 flex flex-col items-center justify-center overflow-hidden group cursor-pointer transition-all",
                  qty > 0
                    ? "border-primary-500/40 bg-primary-500/5"
                    : onWishlist
                    ? "border-pink-500/40 bg-pink-500/5"
                    : "border-surface-700/30 bg-surface-800/50 opacity-40"
                )}
                title={card.name}
              >
                <Icon className={cn("h-5 w-5 mb-1", qty > 0 ? "text-primary-400" : "text-surface-600")} />
                <span className="text-[8px] text-center px-1 text-surface-400 leading-tight line-clamp-2">
                  {card.name}
                </span>
                <span className="text-[7px] font-mono text-surface-600 mt-0.5">{card.code}</span>

                {/* quantity badge */}
                {qty > 1 && (
                  <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {qty}
                  </div>
                )}
                {/* wishlist heart */}
                {onWishlist && qty === 0 && (
                  <div className="absolute top-1 right-1">
                    <Heart className="h-3 w-3 text-pink-400 fill-pink-400" />
                  </div>
                )}
                {/* owned check */}
                {qty > 0 && (
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
export function AlbumView() {
  const [albumType, setAlbumType] = useState<AlbumType>("fisica");
  // Mock: some cards owned
  const [owned] = useState<Map<string, OwnedCard>>(() => {
    const m = new Map<string, OwnedCard>();
    // Mark first ~20 cards as owned with random quantities
    allCards.slice(0, 20).forEach((card, i) => {
      m.set(card.code, { card, quantity: i % 3 === 0 ? 2 : 1, onWishlist: false });
    });
    // Some wishlist items
    allCards.slice(20, 28).forEach((card) => {
      m.set(card.code, { card, quantity: 0, onWishlist: true });
    });
    return m;
  });

  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null);

  const CARDS_PER_PAGE = 9; // 3x3
  const chunks: (KTCGCard | null)[][] = [];
  const cardList = [...allCards];
  // pad to multiple of 9
  while (cardList.length % CARDS_PER_PAGE !== 0) cardList.push(null as unknown as KTCGCard);
  for (let i = 0; i < cardList.length; i += CARDS_PER_PAGE) {
    chunks.push(cardList.slice(i, i + CARDS_PER_PAGE) as (KTCGCard | null)[]);
  }

  const ownedCount = [...owned.values()].filter((o) => o.quantity > 0).length;
  const wishlistCount = [...owned.values()].filter((o) => o.onWishlist && o.quantity === 0).length;
  const totalCards = allCards.length;

  return (
    <PageLayout title="Álbum" description="Tu colección personal de Kingdom TCG">
      {/* Tabs: Física / Digital */}
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

      {/* Badges */}
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
        <span className="text-xs text-surface-500">· Pasá el cursor sobre una carta para ver su nombre</span>
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
            {/* Cover */}
            <CoverPage
              title={`Álbum ${albumType === "fisica" ? "Físico" : "Digital"}`}
              subtitle={`${ownedCount} / ${totalCards} cartas · Mazoteca.com`}
            />

            {/* Content pages */}
            {chunks.map((chunk, idx) => (
              <AlbumPage
                key={idx}
                cards={chunk}
                pageNumber={idx + 1}
                owned={owned}
              />
            ))}

            {/* Back cover */}
            <CoverPage
              title="Kingdom TCG™"
              subtitle="Mazoteca.com — Tu colección, tu comunidad."
            />
          </HTMLFlipBook>
        </div>

        {/* Navigation buttons */}
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
