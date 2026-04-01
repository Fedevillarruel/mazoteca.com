"use client";

import {
  useState,
  useTransition,
  forwardRef,
  useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";
import HTMLFlipBook from "react-pageflip";
import { allCards, type KTCGCard, type KTCGCategory } from "@/data/cards";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Crown,
  Shield,
  Star,
  Scroll,
  Sparkles,
  Crosshair,
  BookMarked,
  Search,
  X,
  Check,
  Grid3X3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleAlbum } from "@/lib/actions/profile";
import type { CatalogSingleEntry } from "@/lib/services/tiendanube-sync";

// ---- Types ----
export interface AlbumViewProps {
  albumSet: string[];
  singlesMap: Record<string, CatalogSingleEntry>;
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

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

// Cards per page in flip book
const CARDS_PER_PAGE = 9; // 3×3 grid

// ── Page component (react-pageflip requires forwardRef) ───────
interface PageProps {
  cards: KTCGCard[];
  singlesMap: Record<string, CatalogSingleEntry>;
  owned: Set<string>;
  pendingCode: string | null;
  onToggle: (code: string) => void;
  pageNumber: number;
  totalPages: number;
}

const AlbumPage = forwardRef<HTMLDivElement, PageProps>(function AlbumPage(
  { cards, singlesMap, owned, pendingCode, onToggle, pageNumber, totalPages },
  ref
) {
  return (
    <div
      ref={ref}
      className="bg-surface-950 border border-surface-800 flex flex-col h-full select-none"
    >
      {/* Page inner padding */}
      <div className="flex-1 p-3 grid grid-cols-3 gap-2 content-start">
        {cards.map((card) => {
          const single = singlesMap[card.code];
          const isOwned = owned.has(card.code);
          const isLoading = pendingCode === card.code;
          const Icon = categoryIcon[card.category];

          return (
            <button
              key={card.code}
              onClick={() => onToggle(card.code)}
              disabled={isLoading}
              title={
                isOwned
                  ? `Quitar ${card.name} del álbum`
                  : `Marcar ${card.name} como obtenida`
              }
              className={cn(
                "relative rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 text-left",
                isOwned
                  ? "border-primary-500 bg-primary-500/5 shadow-sm shadow-primary-500/20"
                  : "border-surface-700/50 bg-surface-900 opacity-55 hover:opacity-80 hover:border-surface-600",
                isLoading && "opacity-40 cursor-wait"
              )}
            >
              <div className="relative aspect-5/7 bg-surface-800 overflow-hidden">
                {single?.image_url ? (
                  <Image
                    src={single.image_url}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                    <Icon className="h-5 w-5 text-surface-600 mb-1" />
                    <span className="text-[8px] text-surface-500 leading-tight line-clamp-2">
                      {card.name}
                    </span>
                  </div>
                )}
                {/* Code badge */}
                <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-surface-950/80 text-[7px] font-mono text-surface-300">
                  {card.code}
                </div>
                {/* Owned checkmark */}
                {isOwned && (
                  <div className="absolute inset-0 bg-primary-600/10 flex items-start justify-end p-1">
                    <span className="bg-primary-500 text-white rounded-full p-0.5 shadow">
                      <Check className="h-2 w-2" />
                    </span>
                  </div>
                )}
              </div>
              <div className="px-1 py-0.5">
                <p className="text-[7px] font-semibold text-surface-300 leading-tight line-clamp-1">
                  {card.name}
                </p>
              </div>
            </button>
          );
        })}
        {/* Fill empty slots so grid stays consistent */}
        {Array.from({ length: CARDS_PER_PAGE - cards.length }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-5/7 rounded-lg bg-surface-900/30 border border-surface-800/30" />
        ))}
      </div>
      {/* Page number */}
      <div className="py-1.5 text-center text-[9px] text-surface-600 border-t border-surface-800">
        {pageNumber} / {totalPages}
      </div>
    </div>
  );
});

// ── Cover page ────────────────────────────────────────────────
const CoverPage = forwardRef<HTMLDivElement, { ownedCount: number; totalCards: number }>(
  function CoverPage({ ownedCount, totalCards }, ref) {
    const percentage = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;
    return (
      <div
        ref={ref}
        className="bg-linear-to-br from-primary-900 via-surface-950 to-surface-950 border border-primary-800/60 flex flex-col items-center justify-center h-full select-none p-6 text-center"
      >
        <BookOpen className="h-12 w-12 text-primary-400 mb-4" />
        <h2 className="text-lg font-bold text-surface-100 mb-1">Álbum Digital</h2>
        <p className="text-xs text-surface-400 mb-5">Kingdom TCG</p>
        <div className="w-full bg-surface-800 rounded-full h-1.5 mb-2">
          <div
            className="h-full bg-linear-to-r from-primary-600 to-accent-500 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-surface-400">
          <span className="text-primary-400 font-bold">{ownedCount}</span> de{" "}
          <span className="font-medium text-surface-300">{totalCards}</span> cartas{" "}
          <span className="text-accent-400 font-semibold">({percentage}%)</span>
        </p>
        <p className="text-[10px] text-surface-600 mt-6">→ Pasá la página para ver tu colección</p>
      </div>
    );
  }
);

// ── Main component ────────────────────────────────────────────
export function AlbumView({ albumSet, singlesMap }: AlbumViewProps) {
  const [owned, setOwned] = useState<Set<string>>(new Set(albumSet));
  const [search, setSearch] = useState("");
  const [filterOwned, setFilterOwned] = useState<"all" | "owned" | "missing">("all");
  const [viewMode, setViewMode] = useState<"flip" | "grid">("flip");
  const [, startTransition] = useTransition();
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null);

  // Only cards present in singlesMap (same universe as catalog)
  const catalogCards: KTCGCard[] = allCards.filter((c) => singlesMap[c.code]);

  const ownedCount = catalogCards.filter((c) => owned.has(c.code)).length;
  const totalCards = catalogCards.length;
  const percentage = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;

  // For flip book: all catalog cards split into pages (no filter)
  const flipPages: KTCGCard[][] = [];
  for (let i = 0; i < catalogCards.length; i += CARDS_PER_PAGE) {
    flipPages.push(catalogCards.slice(i, i + CARDS_PER_PAGE));
  }
  const totalFlipPages = flipPages.length;

  // For grid: filtered
  const filtered = catalogCards.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
    }
    if (filterOwned === "owned") return owned.has(c.code);
    if (filterOwned === "missing") return !owned.has(c.code);
    return true;
  });

  function handleToggle(code: string) {
    if (pendingCode === code) return;
    setPendingCode(code);
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
    startTransition(async () => {
      const res = await toggleAlbum(code);
      if (res.needsAuth) {
        window.location.href = "/login";
        return;
      }
      if (res.error) {
        setOwned((prev) => {
          const next = new Set(prev);
          if (next.has(code)) next.delete(code);
          else next.add(code);
          return next;
        });
      }
      setPendingCode(null);
    });
  }

  function goToPrev() {
    flipBookRef.current?.pageFlip()?.flipPrev();
  }
  function goToNext() {
    flipBookRef.current?.pageFlip()?.flipNext();
  }

  return (
    <PageLayout
      title="Álbum Digital"
      description="Las cartas del catálogo que tenés en tu colección"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary-400">{ownedCount}</p>
            <p className="text-xs text-surface-400">Cartas en álbum</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-surface-300">{totalCards}</p>
            <p className="text-xs text-surface-400">En el catálogo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-accent-400">{percentage}%</p>
            <p className="text-xs text-surface-400">Completado</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-surface-400 mb-1.5">
          <span>Progreso del álbum</span>
          <span>{ownedCount} / {totalCards}</span>
        </div>
        <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-surface-500">
          {viewMode === "flip"
            ? "Tocá las cartas para marcarlas • Usá las flechas para pasar páginas"
            : "Tocá una carta para marcarla/desmarcarla"}
        </p>
        <div className="flex bg-surface-900 border border-surface-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("flip")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
              viewMode === "flip"
                ? "bg-surface-700 text-surface-100"
                : "text-surface-400 hover:text-surface-200"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Libro
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
              viewMode === "grid"
                ? "bg-surface-700 text-surface-100"
                : "text-surface-400 hover:text-surface-200"
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            Grilla
          </button>
        </div>
      </div>

      {/* ── FLIP BOOK MODE ── */}
      {viewMode === "flip" && (
        <div className="flex flex-col items-center">
          <div className="w-full overflow-hidden">
            <HTMLFlipBook
              ref={flipBookRef}
              width={320}
              height={450}
              size="stretch"
              minWidth={280}
              maxWidth={700}
              minHeight={380}
              maxHeight={600}
              maxShadowOpacity={0.4}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={(e) => setCurrentPage(e.data)}
              className="album-flip-book mx-auto"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={700}
              usePortrait={true}
              startZIndex={20}
              autoSize={true}
              clickEventForward={false}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={true}
              disableFlipByClick={false}
            >
              {/* Cover */}
              <CoverPage ownedCount={ownedCount} totalCards={totalCards} />

              {/* Card pages */}
              {flipPages.map((pageCards, idx) => (
                <AlbumPage
                  key={idx}
                  cards={pageCards}
                  singlesMap={singlesMap}
                  owned={owned}
                  pendingCode={pendingCode}
                  onToggle={handleToggle}
                  pageNumber={idx + 1}
                  totalPages={totalFlipPages}
                />
              ))}

              {/* Back cover */}
              <div className="bg-linear-to-br from-surface-950 to-primary-950 border border-primary-900/40 flex flex-col items-center justify-center h-full select-none">
                <BookOpen className="h-10 w-10 text-primary-800" />
              </div>
            </HTMLFlipBook>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={goToPrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <span className="text-xs text-surface-500 min-w-20 text-center">
              {currentPage === 0 ? "Portada" : `Pág. ${currentPage} / ${totalFlipPages}`}
            </span>
            <button
              onClick={goToNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-700 transition-colors text-sm font-medium"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── GRID MODE ── */}
      {viewMode === "grid" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                rightIcon={
                  search ? (
                    <button
                      onClick={() => setSearch("")}
                      className="text-surface-400 hover:text-surface-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : undefined
                }
              />
            </div>
            <div className="flex gap-2">
              {(["all", "owned", "missing"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterOwned(f)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    filterOwned === f
                      ? "bg-primary-600 text-white"
                      : "bg-surface-800 text-surface-400 hover:text-surface-200 border border-surface-700"
                  )}
                >
                  {f === "all" ? "Todas" : f === "owned" ? "Tengo" : "Me falta"}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mb-5 flex-wrap text-xs text-surface-500">
            <span className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border-2 border-primary-500 bg-primary-500/20" />
              La tenés
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border-2 border-surface-700" />
              No la tenés
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookMarked className="h-10 w-10 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-300 font-medium">No hay cartas que mostrar</p>
              <p className="text-sm text-surface-500 mt-1">
                {filterOwned === "owned" ? (
                  <>
                    Aún no marcaste ninguna carta. Agregá desde el{" "}
                    <Link href="/catalog" className="text-primary-400 underline">
                      catálogo
                    </Link>
                    .
                  </>
                ) : (
                  "Probá cambiando los filtros."
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
              {filtered.map((card) => {
                const single = singlesMap[card.code];
                const isOwned = owned.has(card.code);
                const isLoading = pendingCode === card.code;
                const Icon = categoryIcon[card.category];
                const displayPrice = single?.promotional_price ?? single?.min_price;

                return (
                  <button
                    key={card.code}
                    onClick={() => handleToggle(card.code)}
                    disabled={isLoading}
                    title={
                      isOwned
                        ? `Quitar ${card.name} del álbum`
                        : `Marcar ${card.name} como obtenida`
                    }
                    className={cn(
                      "group relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                      isOwned
                        ? "border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10"
                        : "border-surface-700/50 bg-surface-900 opacity-60 hover:opacity-90 hover:border-surface-600",
                      isLoading && "opacity-50 cursor-wait"
                    )}
                  >
                    <div className="relative aspect-5/7 bg-surface-800 overflow-hidden">
                      {single?.image_url ? (
                        <Image
                          src={single.image_url}
                          alt={card.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                          <Icon className="h-6 w-6 text-surface-600 mb-1" />
                          <span className="text-[9px] text-surface-500 leading-tight line-clamp-2">
                            {card.name}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded bg-surface-950/80 border border-surface-700/60 text-[8px] font-mono text-surface-300">
                        {card.code}
                      </div>
                      {isOwned && (
                        <div className="absolute inset-0 bg-primary-600/10 flex items-start justify-end p-1.5">
                          <span className="bg-primary-500 text-white rounded-full p-0.5 shadow">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-[9px] font-semibold text-surface-300 leading-tight line-clamp-2 mb-0.5">
                        {card.name}
                      </p>
                      {displayPrice != null && (
                        <p className="text-[9px] text-primary-400 font-medium">
                          {formatARS(displayPrice)}
                        </p>
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
        El álbum muestra las cartas disponibles en el catálogo. Se actualiza
        automáticamente cuando se agregan cartas a la tienda.
      </p>
    </PageLayout>
  );
}
