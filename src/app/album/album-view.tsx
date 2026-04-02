"use client";

import {
  useState,
  useTransition,
  forwardRef,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import Image from "next/image";
import HTMLFlipBook from "react-pageflip";
import { allCards, type KTCGCard, type KTCGCategory } from "@/data/cards";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Crown, Shield, Star, Scroll, Sparkles, Crosshair,
  BookMarked, Search, X, Check, Grid3X3, BookOpen,
  ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag,
  RefreshCw, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleAlbum, setAlbumQuantity, createCardListing } from "@/lib/actions/profile";
import type { CatalogSingleEntry } from "@/lib/types/tiendanube";

// ── Types ─────────────────────────────────────────────────────
export interface AlbumViewProps {
  albumMap: Record<string, number>; // card_code → quantity
  singlesMap: Record<string, CatalogSingleEntry>;
}

interface CardModalState {
  card: KTCGCard;
  single: CatalogSingleEntry | undefined;
}

// ── Category icons ────────────────────────────────────────────
const categoryIcon: Record<KTCGCategory, typeof Crown> = {
  Tropas: Shield, Coronados: Crown, Realeza: Star,
  Estrategia: Scroll, "Estrategia Primigenia": Sparkles, Arroje: Crosshair,
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  }).format(n);
}

const CARDS_PER_PAGE = 9;
const KTCG_LOGO = "https://kingdom-tcg.com/kingdom-tcg-tm-logo.svg";

// ── Card Detail Modal ─────────────────────────────────────────
function CardModal({
  state,
  quantity,
  onClose,
  onSetQty,
}: {
  state: CardModalState;
  quantity: number;
  onClose: () => void;
  onSetQty: (qty: number) => void;
}) {
  const { card, single } = state;
  const Icon = categoryIcon[card.category];
  const [listType, setListType] = useState<"sale" | "trade" | "both" | null>(null);
  const [price, setPrice] = useState("");
  const [listNote, setListNote] = useState("");
  const [, startListing] = useTransition();
  const [listed, setListed] = useState(false);
  const isOwned = quantity > 0;

  function handleList() {
    if (!listType) return;
    if ((listType === "sale" || listType === "both") && !price) return;
    startListing(async () => {
      const res = await createCardListing({
        cardCode: card.code,
        listingType: listType,
        price: price ? parseFloat(price) : undefined,
        note: listNote || undefined,
      });
      if (!res.error) { setListed(true); setListType(null); }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-surface-800">
          <div className="relative h-20 w-14 rounded-lg overflow-hidden bg-surface-800 shrink-0">
            {single?.image_url ? (
              <Image src={single.image_url} alt={card.name} fill className="object-cover" sizes="56px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="h-6 w-6 text-surface-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono text-surface-500">{card.code}</p>
            <p className="text-sm font-bold text-surface-100 leading-tight">{card.name}</p>
            <p className="text-xs text-surface-400 mt-0.5">
              {card.category}{card.level != null ? ` · Nv. ${card.level}` : ""}
            </p>
            {single?.min_price != null && (
              <p className="text-xs text-primary-400 font-semibold mt-1">
                {formatARS(single.promotional_price ?? single.min_price)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-200 transition-colors p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity */}
        <div className="p-4 border-b border-surface-800">
          <p className="text-[10px] text-surface-500 mb-3 font-medium uppercase tracking-wide">Mi colección</p>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onSetQty(isOwned ? 0 : 1)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                isOwned
                  ? "bg-primary-600 border-primary-500 text-white"
                  : "bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-500"
              )}
            >
              <Check className="h-3 w-3" />
              {isOwned ? "La tengo" : "No la tengo"}
            </button>

            {isOwned && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-400 flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Copias:
                </span>
                <div className="flex items-center gap-1 bg-surface-800 border border-surface-700 rounded-lg">
                  <button
                    onClick={() => onSetQty(Math.max(1, quantity - 1))}
                    className="p-1.5 text-surface-400 hover:text-surface-200 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-surface-100">{quantity}</span>
                  <button
                    onClick={() => onSetQty(quantity + 1)}
                    className="p-1.5 text-surface-400 hover:text-surface-200 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
          {isOwned && quantity > 1 && (
            <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1">
              <Copy className="h-3 w-3" />
              Tenés {quantity - 1} cop{quantity - 1 === 1 ? "ia" : "ias"} repetida{quantity - 1 === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {/* Publish */}
        {isOwned && !listed && (
          <div className="p-4">
            <p className="text-[10px] text-surface-500 mb-3 font-medium uppercase tracking-wide">Publicar carta</p>
            {!listType ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setListType("sale")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:bg-primary-600/20 hover:border-primary-500 hover:text-primary-300 transition-all text-xs font-medium"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Vender
                </button>
                <button
                  onClick={() => setListType("trade")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:bg-violet-600/20 hover:border-violet-500 hover:text-violet-300 transition-all text-xs font-medium"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Intercambiar
                </button>
                <button
                  onClick={() => setListType("both")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:bg-accent-600/20 hover:border-accent-500 hover:text-accent-300 transition-all text-xs font-medium"
                >
                  Ambos
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400">
                    {listType === "sale" ? "Venta" : listType === "trade" ? "Intercambio" : "Venta e intercambio"}
                  </span>
                  <button onClick={() => setListType(null)} className="text-surface-500 hover:text-surface-300">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {(listType === "sale" || listType === "both") && (
                  <Input
                    placeholder="Precio (ARS)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="text-sm"
                  />
                )}
                <Input
                  placeholder="Nota opcional (condición, foil, etc.)"
                  value={listNote}
                  onChange={(e) => setListNote(e.target.value)}
                  className="text-sm"
                />
                <button
                  onClick={handleList}
                  disabled={(listType === "sale" || listType === "both") && !price}
                  className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </button>
              </div>
            )}
          </div>
        )}

        {listed && (
          <div className="p-4 text-center">
            <Check className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-surface-100">¡Publicación creada!</p>
            <p className="text-xs text-surface-400 mt-1">
              Otros usuarios pueden ver tu oferta en{" "}
              <Link href="/trades" className="text-primary-400 underline" onClick={onClose}>Intercambios</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AlbumPage (forwardRef — required by react-pageflip) ───────
interface PageProps {
  cards: KTCGCard[];
  singlesMap: Record<string, CatalogSingleEntry>;
  ownedMap: Record<string, number>;
  pendingCode: string | null;
  onCardClick: (card: KTCGCard) => void;
  pageNumber: number;
  totalPages: number;
}

const AlbumPage = forwardRef<HTMLDivElement, PageProps>(function AlbumPage(
  { cards, singlesMap, ownedMap, pendingCode, onCardClick, pageNumber, totalPages },
  ref
) {
  return (
    <div ref={ref} className="bg-surface-950 border border-surface-800 flex flex-col h-full select-none">
      <div className="flex-1 p-2 grid grid-cols-3 gap-1.5 content-start">
        {cards.map((card) => {
          const single = singlesMap[card.code];
          const qty = ownedMap[card.code] ?? 0;
          const isOwned = qty > 0;
          const isLoading = pendingCode === card.code;
          const Icon = categoryIcon[card.category];
          return (
            <button
              key={card.code}
              onClick={() => onCardClick(card)}
              disabled={isLoading}
              className={cn(
                "relative rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 text-left",
                isOwned
                  ? "border-primary-500 bg-primary-500/5 shadow-sm shadow-primary-500/20"
                  : "border-surface-700/50 bg-surface-900 opacity-50 hover:opacity-75",
                isLoading && "opacity-40 cursor-wait"
              )}
            >
              <div className="relative aspect-5/7 bg-surface-800 overflow-hidden">
                {single?.image_url ? (
                  <Image
                    src={single.image_url} alt={card.name} fill
                    className={cn("object-cover", !isOwned && "grayscale")}
                    sizes="90px"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                    <Icon className={cn("h-5 w-5 mb-1", isOwned ? "text-surface-500" : "text-surface-700")} />
                    <span className="text-[7px] text-surface-600 leading-tight line-clamp-2">{card.name}</span>
                  </div>
                )}
                <div className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded bg-surface-950/80 text-[6px] font-mono text-surface-400">
                  {card.code}
                </div>
                {isOwned && (
                  <div className="absolute top-0.5 right-0.5">
                    <span className="bg-primary-500 text-white rounded-full p-0.5 shadow flex">
                      <Check className="h-2 w-2" />
                    </span>
                  </div>
                )}
                {qty > 1 && (
                  <div className="absolute bottom-0.5 right-0.5 bg-amber-500 text-white rounded px-1 text-[7px] font-bold leading-tight">
                    ×{qty}
                  </div>
                )}
              </div>
              <div className="px-1 py-0.5">
                <p className={cn("text-[6px] font-medium leading-tight line-clamp-1", isOwned ? "text-surface-300" : "text-surface-600")}>
                  {card.name}
                </p>
              </div>
            </button>
          );
        })}
        {Array.from({ length: CARDS_PER_PAGE - cards.length }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-5/7 rounded-lg bg-surface-900/20 border border-surface-800/20" />
        ))}
      </div>
      <div className="py-1 text-center text-[8px] text-surface-700 border-t border-surface-800">
        {pageNumber} / {totalPages}
      </div>
    </div>
  );
});

// ── Cover ─────────────────────────────────────────────────────
const CoverPage = forwardRef<HTMLDivElement, { ownedCount: number; totalCards: number }>(
  function CoverPage({ ownedCount, totalCards }, ref) {
    const pct = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;
    return (
      <div ref={ref} className="bg-linear-to-br from-primary-950 via-surface-950 to-surface-950 border border-primary-800/40 flex flex-col items-center justify-center h-full select-none p-6 text-center">
        <div className="mb-5 w-36 h-16 relative">
          <Image src={KTCG_LOGO} alt="Kingdom TCG" fill className="object-contain" unoptimized />
        </div>
        <h2 className="text-base font-bold text-surface-100 mb-4">Álbum Digital</h2>
        <div className="w-full bg-surface-800 rounded-full h-1.5 mb-2">
          <div className="h-full bg-linear-to-r from-primary-600 to-accent-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-surface-400">
          <span className="text-primary-400 font-bold">{ownedCount}</span>
          {" "}de{" "}
          <span className="font-medium text-surface-300">{totalCards}</span>
          {" "}cartas{" "}
          <span className="text-accent-400 font-semibold">({pct}%)</span>
        </p>
        <p className="text-[9px] text-surface-600 mt-5">→ Pasá la página para ver tu colección</p>
      </div>
    );
  }
);

const BackCover = forwardRef<HTMLDivElement>(function BackCover(_, ref) {
  return (
    <div ref={ref} className="bg-linear-to-br from-surface-950 to-primary-950 border border-primary-900/30 flex items-center justify-center h-full select-none">
      <div className="w-28 h-14 relative opacity-15">
        <Image src={KTCG_LOGO} alt="Kingdom TCG" fill className="object-contain" unoptimized />
      </div>
    </div>
  );
});

// ── Main component ────────────────────────────────────────────
export function AlbumView({ albumMap: initialAlbumMap, singlesMap }: AlbumViewProps) {
  const [ownedMap, setOwnedMap] = useState<Record<string, number>>(initialAlbumMap);
  const [search, setSearch] = useState("");
  const [filterOwned, setFilterOwned] = useState<"all" | "owned" | "missing">("all");
  const [viewMode, setViewMode] = useState<"flip" | "grid">("flip");
  const [, startTransition] = useTransition();
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [modal, setModal] = useState<CardModalState | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null);

  const catalogCards: KTCGCard[] = allCards.filter((c) => singlesMap[c.code]);
  const ownedCount = catalogCards.filter((c) => (ownedMap[c.code] ?? 0) > 0).length;
  const totalCards = catalogCards.length;
  const percentage = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;

  const flipPages: KTCGCard[][] = [];
  for (let i = 0; i < catalogCards.length; i += CARDS_PER_PAGE) {
    flipPages.push(catalogCards.slice(i, i + CARDS_PER_PAGE));
  }
  const totalFlipPages = flipPages.length;

  const filtered = catalogCards.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
    }
    const qty = ownedMap[c.code] ?? 0;
    if (filterOwned === "owned") return qty > 0;
    if (filterOwned === "missing") return qty === 0;
    return true;
  });

  const handleCardClick = useCallback((card: KTCGCard) => {
    setModal({ card, single: singlesMap[card.code] });
  }, [singlesMap]);

  function handleSetQty(code: string, qty: number) {
    const prev = ownedMap[code] ?? 0;
    setOwnedMap((m) => {
      const next = { ...m };
      if (qty <= 0) delete next[code];
      else next[code] = qty;
      return next;
    });
    startTransition(async () => {
      const res = await setAlbumQuantity(code, qty);
      if (res.needsAuth) { window.location.href = "/login"; return; }
      if (res.error) {
        setOwnedMap((m) => {
          const next = { ...m };
          if (prev <= 0) delete next[code];
          else next[code] = prev;
          return next;
        });
      }
    });
  }

  function handleToggleFromGrid(code: string) {
    // For direct toggle from grid (without modal) — not used currently, kept for future
    const wasOwned = (ownedMap[code] ?? 0) > 0;
    setPendingCode(code);
    setOwnedMap((m) => {
      const next = { ...m };
      if (wasOwned) delete next[code];
      else next[code] = 1;
      return next;
    });
    startTransition(async () => {
      const res = await toggleAlbum(code);
      if (res.needsAuth) { window.location.href = "/login"; return; }
      if (res.error) {
        setOwnedMap((m) => {
          const next = { ...m };
          if (wasOwned) next[code] = 1;
          else delete next[code];
          return next;
        });
      }
      setPendingCode(null);
    });
  }
  void handleToggleFromGrid; // suppress unused warning

  function goToPrev() { flipBookRef.current?.pageFlip()?.flipPrev(); }
  function goToNext() { flipBookRef.current?.pageFlip()?.flipNext(); }

  return (
    <PageLayout title="Álbum Digital" description="Las cartas del catálogo que tenés en tu colección">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-primary-400">{ownedCount}</p>
          <p className="text-xs text-surface-400">Cartas en álbum</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-surface-300">{totalCards}</p>
          <p className="text-xs text-surface-400">En el catálogo</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-accent-400">{percentage}%</p>
          <p className="text-xs text-surface-400">Completado</p>
        </CardContent></Card>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-surface-400 mb-1.5">
          <span>Progreso del álbum</span>
          <span>{ownedCount} / {totalCards}</span>
        </div>
        <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* Game filter */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-surface-500">Juego:</span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium">
          <div className="h-3 w-6 relative">
            <Image src={KTCG_LOGO} alt="Kingdom TCG" fill className="object-contain" unoptimized />
          </div>
          Kingdom TCG
        </button>
        <span className="text-[10px] text-surface-600">· Más juegos próximamente</span>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-surface-500 hidden sm:block">
          Hacé clic en una carta para ver detalles, marcarla y publicarla
        </p>
        <div className="flex bg-surface-900 border border-surface-700 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("flip")}
            className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
              viewMode === "flip" ? "bg-surface-700 text-surface-100" : "text-surface-400 hover:text-surface-200")}
          >
            <BookOpen className="h-3.5 w-3.5" /> Libro
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
              viewMode === "grid" ? "bg-surface-700 text-surface-100" : "text-surface-400 hover:text-surface-200")}
          >
            <Grid3X3 className="h-3.5 w-3.5" /> Grilla
          </button>
        </div>
      </div>

      {/* ── FLIP BOOK MODE ── */}
      {viewMode === "flip" && (
        <div className="flex flex-col items-center">
          <div className="w-full overflow-hidden">
            <HTMLFlipBook
              ref={flipBookRef}
              width={320} height={450} size="stretch"
              minWidth={280} maxWidth={700} minHeight={380} maxHeight={600}
              maxShadowOpacity={0.4} showCover={true} mobileScrollSupport={true}
              onFlip={(e) => setCurrentPage(e.data)}
              className="album-flip-book mx-auto" style={{}}
              startPage={0} drawShadow={true} flippingTime={700}
              usePortrait={true} startZIndex={20} autoSize={true}
              clickEventForward={false} useMouseEvents={true} swipeDistance={30}
              showPageCorners={true} disableFlipByClick={false}
            >
              <CoverPage ownedCount={ownedCount} totalCards={totalCards} />
              {flipPages.map((pageCards, idx) => (
                <AlbumPage
                  key={idx} cards={pageCards} singlesMap={singlesMap}
                  ownedMap={ownedMap} pendingCode={pendingCode}
                  onCardClick={handleCardClick}
                  pageNumber={idx + 1} totalPages={totalFlipPages}
                />
              ))}
              <BackCover />
            </HTMLFlipBook>
          </div>
          <div className="flex items-center gap-4 mt-5">
            <button onClick={goToPrev} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700 transition-colors text-sm font-medium">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <span className="text-xs text-surface-500 min-w-20 text-center">
              {currentPage === 0 ? "Portada" : `Pág. ${currentPage} / ${totalFlipPages}`}
            </span>
            <button onClick={goToNext} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700 transition-colors text-sm font-medium">
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── GRID MODE ── */}
      {viewMode === "grid" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o código..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                rightIcon={search ? (
                  <button onClick={() => setSearch("")} className="text-surface-400 hover:text-surface-200"><X className="h-4 w-4" /></button>
                ) : undefined}
              />
            </div>
            <div className="flex gap-2">
              {(["all", "owned", "missing"] as const).map((f) => (
                <button key={f} onClick={() => setFilterOwned(f)}
                  className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    filterOwned === f ? "bg-primary-600 text-white" : "bg-surface-800 text-surface-400 hover:text-surface-200 border border-surface-700")}
                >
                  {f === "all" ? "Todas" : f === "owned" ? "Tengo" : "Me falta"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5 flex-wrap text-xs text-surface-500">
            <span className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border-2 border-primary-500 bg-primary-500/20" /> La tenés
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border-2 border-surface-700 opacity-50" /> No la tenés (gris)
            </span>
            <span className="text-amber-500 flex items-center gap-1">
              <span className="bg-amber-500 text-white rounded px-1 text-[8px] font-bold">×2</span> Repetidas
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookMarked className="h-10 w-10 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-300 font-medium">No hay cartas que mostrar</p>
              <p className="text-sm text-surface-500 mt-1">
                {filterOwned === "owned" ? (
                  <>Aún no marcaste ninguna. Hacé clic en cualquier carta para marcarla.</>
                ) : "Probá cambiando los filtros."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
              {filtered.map((card) => {
                const single = singlesMap[card.code];
                const qty = ownedMap[card.code] ?? 0;
                const isOwned = qty > 0;
                const isLoading = pendingCode === card.code;
                const Icon = categoryIcon[card.category];
                const displayPrice = single?.promotional_price ?? single?.min_price;
                return (
                  <button
                    key={card.code} onClick={() => handleCardClick(card)} disabled={isLoading}
                    className={cn(
                      "group relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                      isOwned ? "border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10"
                             : "border-surface-700/50 bg-surface-900 opacity-50 hover:opacity-80 hover:border-surface-600",
                      isLoading && "opacity-40 cursor-wait"
                    )}
                  >
                    <div className="relative aspect-5/7 bg-surface-800 overflow-hidden">
                      {single?.image_url ? (
                        <Image src={single.image_url} alt={card.name} fill
                          className={cn("object-cover transition-all", !isOwned && "grayscale")}
                          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                          <Icon className={cn("h-6 w-6 mb-1", isOwned ? "text-surface-500" : "text-surface-700")} />
                          <span className="text-[9px] text-surface-600 leading-tight line-clamp-2">{card.name}</span>
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded bg-surface-950/80 border border-surface-700/60 text-[8px] font-mono text-surface-300">
                        {card.code}
                      </div>
                      {isOwned && (
                        <div className="absolute top-1.5 right-1.5">
                          <span className="bg-primary-500 text-white rounded-full p-0.5 shadow flex">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      )}
                      {qty > 1 && (
                        <div className="absolute bottom-1.5 right-1.5 bg-amber-500 text-white rounded px-1.5 text-[9px] font-bold">
                          ×{qty}
                        </div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] font-semibold text-surface-300 leading-tight line-clamp-2 mb-0.5">{card.name}</p>
                      {displayPrice != null && (
                        <p className="text-[9px] text-primary-400 font-medium">{formatARS(displayPrice)}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      <p className="text-xs text-surface-600 text-center mt-8">
        El álbum muestra las cartas disponibles en el catálogo.
        Se actualiza automáticamente cuando se agregan cartas a la tienda.
      </p>

      {/* Card detail modal */}
      {modal && (
        <CardModal
          state={modal}
          quantity={ownedMap[modal.card.code] ?? 0}
          onClose={() => setModal(null)}
          onSetQty={(qty) => handleSetQty(modal.card.code, qty)}
        />
      )}
    </PageLayout>
  );
}
