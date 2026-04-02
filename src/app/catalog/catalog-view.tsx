"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleAlbum } from "@/lib/actions/profile";
import {
  Search,
  Grid3X3,
  List,
  Filter,
  X,
  Crown,
  Shield,
  Star,
  Scroll,
  Sparkles,
  Crosshair,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { compareCards } from "@/lib/utils/card-sort";
import {
  allCards,
  cardCategories,
  factions,
  type KTCGCard,
  type KTCGCategory,
} from "@/data/cards";
import type { CatalogSingleEntry } from "@/lib/types/tiendanube";

interface CardWithSingle extends KTCGCard {
  single: CatalogSingleEntry;
}

// ── Sort options ─────────────────────────────────────────────
const sortOptions = [
  { label: "Predeterminado",  value: "default" },
  { label: "Código (asc)",    value: "code_asc" },
  { label: "Código (desc)",   value: "code_desc" },
  { label: "Nombre (A-Z)",    value: "name_asc" },
];

// ── Page size options ─────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [
  { label: "20",  value: 20 },
  { label: "50",  value: 50 },
  { label: "100", value: 100 },
  { label: "500", value: 500 },
  { label: "Todos", value: Infinity },
];

// ── Category icons ────────────────────────────────────────────
const categoryIcon: Record<KTCGCategory, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

// ── Filter option lists ───────────────────────────────────────
const categoryOptions = [
  { label: "Todas las categorías", value: "" },
  ...cardCategories.map((c) => ({ label: c, value: c })),
];

const levelOptions = [
  { label: "Todos los niveles", value: "" },
  { label: "Nivel 1", value: "1" },
  { label: "Nivel 2", value: "2" },
  { label: "Nivel 3", value: "3" },
  { label: "Nivel 4", value: "4" },
];

const factionOptions = [
  { label: "Todas las facciones", value: "" },
  ...factions.map((f) => ({ label: f, value: f.toLowerCase() })),
];

// ── Main Component ────────────────────────────────────────────

export function CatalogView({
  singlesMap,
  albumCodes = new Set(),
}: {
  singlesMap: Map<string, CatalogSingleEntry>;
  albumCodes?: Set<string>;
}) {
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("");
  const [level,       setLevel]       = useState("");
  const [faction,     setFaction]     = useState("");
  const [tcgFilter,   setTcgFilter]   = useState("");
  const [sort,        setSort]        = useState("default");
  const [viewMode,    setViewMode]    = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize,    setPageSize]    = useState(20);
  const [page,        setPage]        = useState(1);
  // Track in-album state client-side (starts from server prop)
  const [albumSet,    setAlbumSet]    = useState<Set<string>>(albumCodes);

  // Collect unique TCG/game names from the singles map
  const tcgOptions = useMemo(() => {
    const games = new Set<string>();
    for (const entry of singlesMap.values()) {
      if (entry.tn_game) games.add(entry.tn_game);
    }
    return [
      { label: "Todos los juegos", value: "" },
      ...[...games].sort().map((g) => ({ label: g, value: g })),
    ];
  }, [singlesMap]);

  const activeFilterCount = [category, level, faction, tcgFilter].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setCategory("");
    setLevel("");
    setFaction("");
    setTcgFilter("");
    setSearch("");
    setPage(1);
  }, []);

  // Only cards present in singlesMap (uploaded to TiendaNube)
  const catalogCards = useMemo<CardWithSingle[]>(() => {
    return allCards
      .filter((c) => singlesMap.has(c.code))
      .map((c) => ({ ...c, single: singlesMap.get(c.code)! }));
  }, [singlesMap]);

  // Filter + sort
  const filtered = useMemo(() => {
    let cards = [...catalogCards];

    if (search) {
      const q = search.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.slug.includes(q)
      );
    }
    if (category) cards = cards.filter((c) => c.category === category);
    if (level) {
      const lv = Number(level);
      cards = cards.filter((c) => c.level === lv);
    }
    if (faction) {
      const fl = faction.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.name.toLowerCase().includes(fl) ||
          (c.crowned && c.crowned.toLowerCase().includes(fl))
      );
    }
    if (tcgFilter) {
      cards = cards.filter((c) => c.single.tn_game === tcgFilter);
    }

    cards.sort((a, b) => {
      switch (sort) {
        case "default":   return compareCards(a, b);
        case "code_asc":  return a.code.localeCompare(b.code);
        case "code_desc": return b.code.localeCompare(a.code);
        case "name_asc":  return a.name.localeCompare(b.name);
        default:          return compareCards(a, b);
      }
    });

    return cards;
  }, [catalogCards, search, category, level, faction, tcgFilter, sort]);

  // Pagination
  const effectivePageSize = pageSize === Infinity ? filtered.length : pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / effectivePageSize));
  const safePage   = Math.min(page, totalPages);
  const visible    = filtered.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleFilter(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  async function handleToggleAlbum(code: string) {
    const wasIn = albumSet.has(code);
    // Optimistic update
    setAlbumSet((prev) => {
      const next = new Set(prev);
      if (wasIn) { next.delete(code); } else { next.add(code); }
      return next;
    });
    const res = await toggleAlbum(code);
    if (res.needsAuth) { window.location.href = "/login"; return; }
    // Revert on error
    if (res.error) {
      setAlbumSet((prev) => {
        const next = new Set(prev);
        if (wasIn) { next.add(code); } else { next.delete(code); }
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Search & Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o código (ej: KT001, Viggo)..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              search ? (
                <button onClick={() => handleSearch("")} className="text-surface-400 hover:text-surface-200">
                  <X className="h-4 w-4" />
                </button>
              ) : undefined
            }
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} className="relative">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <div className="flex bg-surface-900 border border-surface-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2.5 transition-colors", viewMode === "grid" ? "bg-surface-700 text-surface-100" : "text-surface-400 hover:text-surface-200")}
              aria-label="Vista grilla"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2.5 transition-colors", viewMode === "list" ? "bg-surface-700 text-surface-100" : "text-surface-400 hover:text-surface-200")}
              aria-label="Vista lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="flex text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5 items-center gap-1">
                <Gamepad2 className="h-3.5 w-3.5" /> TCG
              </label>
              <select
                value={tcgFilter}
                onChange={handleFilter(setTcgFilter)}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 focus:outline-none focus:border-primary-500"
              >
                {tcgOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <Select label="Categoría" options={categoryOptions} value={category} onChange={handleFilter(setCategory)} />
            <Select label="Nivel"     options={levelOptions}    value={level}    onChange={handleFilter(setLevel)} />
            <Select label="Facción"   options={factionOptions}  value={faction}  onChange={handleFilter(setFaction)} />
            <Select label="Ordenar"   options={sortOptions}     value={sort}     onChange={(e) => setSort(e.target.value)} />
          </div>
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-800">
              <div className="flex flex-wrap gap-2">
                {tcgFilter && <Badge variant="primary">{tcgFilter}<button onClick={() => { setTcgFilter(""); setPage(1); }} className="ml-1"><X className="h-3 w-3" /></button></Badge>}
                {category  && <Badge variant="primary">{category}<button onClick={() => { setCategory(""); setPage(1); }} className="ml-1"><X className="h-3 w-3" /></button></Badge>}
                {level     && <Badge variant="primary">Nivel {level}<button onClick={() => { setLevel(""); setPage(1); }} className="ml-1"><X className="h-3 w-3" /></button></Badge>}
                {faction   && <Badge variant="primary">{factionOptions.find((o) => o.value === faction)?.label}<button onClick={() => { setFaction(""); setPage(1); }} className="ml-1"><X className="h-3 w-3" /></button></Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>Limpiar filtros</Button>
            </div>
          )}
        </div>
      )}

      {/* ── Results info + page size selector ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-surface-400">
          <span className="text-surface-200 font-medium">{filtered.length}</span> cartas
          {filtered.length !== catalogCards.length && (
            <> · filtradas de <span className="text-surface-200 font-medium">{catalogCards.length}</span></>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500">Mostrar:</span>
          <div className="flex rounded-lg border border-surface-700 overflow-hidden">
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setPageSize(opt.value); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  pageSize === opt.value
                    ? "bg-primary-600 text-white"
                    : "bg-surface-800 text-surface-400 hover:text-surface-200"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card Grid ── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-4 gap-3">
          {visible.map((card) => (
            <CatalogCard
              key={card.code}
              card={card}
              inAlbum={albumSet.has(card.code)}
              onToggleAlbum={handleToggleAlbum}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((card) => (
            <CatalogListItem
              key={card.code}
              card={card}
              inAlbum={albumSet.has(card.code)}
              onToggleAlbum={handleToggleAlbum}
            />
          ))}
        </div>
      )}

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">No se encontraron cartas</p>
          <p className="text-sm text-surface-500 mt-1">Probá cambiando los filtros o el texto de búsqueda</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>Limpiar filtros</Button>
        </div>
      )}

      {/* ── Pagination ── */}
      {filtered.length > 0 && pageSize !== Infinity && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 disabled:opacity-30 hover:text-surface-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((item, i) =>
              item === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-surface-500 text-sm">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item as number)}
                  className={cn(
                    "h-9 min-w-9 px-3 rounded-lg text-sm font-medium border transition-colors",
                    safePage === item
                      ? "bg-primary-600 border-primary-500 text-white"
                      : "bg-surface-800 border-surface-700 text-surface-400 hover:text-surface-200"
                  )}
                >
                  {item}
                </button>
              )
            )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 disabled:opacity-30 hover:text-surface-200 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Current page info */}
      {filtered.length > 0 && pageSize !== Infinity && totalPages > 1 && (
        <p className="text-center text-xs text-surface-500">
          Página {safePage} de {totalPages} · {visible.length} cartas
        </p>
      )}
    </div>
  );
}

// ── Grid Card ─────────────────────────────────────────────────

function CatalogCard({
  card,
  inAlbum,
  onToggleAlbum,
}: {
  card: CardWithSingle;
  inAlbum: boolean;
  onToggleAlbum: (code: string) => void;
}) {
  const Icon = categoryIcon[card.category] ?? Shield;
  const { single } = card;
  const hasDiscount = single.promotional_price != null && single.min_price != null && single.promotional_price < single.min_price;

  return (
    <div className="group relative bg-surface-900 border border-surface-800 rounded-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5">
      {/* Image */}
      <Link href={`/catalog/${card.slug}`} className="block">
        <div className="relative aspect-5/7 bg-surface-800 overflow-hidden">
          {single.image_url ? (
            <Image
              src={single.image_url}
              alt={card.name}
              fill
              className={cn(
                "object-cover transition-all duration-300",
                // B&W unless in album, then always color; hover always color
                inAlbum
                  ? "grayscale-0"
                  : "grayscale group-hover:grayscale-0"
              )}
              sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
              <Icon className="h-8 w-8 text-surface-600 mb-2" />
              <span className="text-xs font-medium text-surface-400 leading-tight line-clamp-2">{card.name}</span>
            </div>
          )}

          {/* Code badge */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-950/80 border border-surface-700/60 text-[10px] font-mono text-surface-300">
            {card.code}
          </div>

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold">
              -{Math.round((1 - single.promotional_price! / single.min_price!) * 100)}%
            </div>
          )}

          {/* In album indicator */}
          {inAlbum && (
            <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center shadow">
              <BookMarked className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link
          href={`/catalog/${card.slug}`}
          className="text-xs font-semibold text-surface-200 leading-tight line-clamp-2 hover:text-primary-300 transition-colors"
        >
          {card.name}
        </Link>

        <div className="mt-auto">
          <button
            onClick={() => onToggleAlbum(card.code)}
            title={inAlbum ? "Quitar del álbum digital" : "Agregar al álbum digital"}
            className={cn(
              "w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all duration-200 border",
              inAlbum
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-surface-800 border-surface-700 text-surface-400 hover:bg-violet-900/40 hover:text-violet-300 hover:border-violet-600"
            )}
          >
            <BookMarked className="h-3 w-3" />
            <span>{inAlbum ? "En álbum" : "Álbum"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── List Item ─────────────────────────────────────────────────

function CatalogListItem({
  card,
  inAlbum,
  onToggleAlbum,
}: {
  card: CardWithSingle;
  inAlbum: boolean;
  onToggleAlbum: (code: string) => void;
}) {
  const Icon = categoryIcon[card.category] ?? Shield;
  const { single } = card;

  return (
    <div className="flex items-center gap-4 bg-surface-900 border border-surface-800 rounded-xl p-4 hover:border-surface-700 transition-colors">
      {/* Thumbnail */}
      <Link href={`/catalog/${card.slug}`} className="h-20 w-14 bg-surface-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative group/thumb">
        {single.image_url ? (
          <Image
            src={single.image_url}
            alt={card.name}
            fill
            className={cn(
              "object-cover transition-all duration-300",
              inAlbum ? "grayscale-0" : "grayscale group-hover/thumb:grayscale-0"
            )}
            sizes="56px"
          />
        ) : (
          <Icon className="h-6 w-6 text-surface-600" />
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/catalog/${card.slug}`} className="text-sm font-semibold text-surface-100 truncate block hover:text-primary-300 transition-colors">{card.name}</Link>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="default">{card.category}</Badge>
          {card.level != null && <Badge variant="info">Nv. {card.level}</Badge>}
          <span className="text-xs text-surface-400 font-mono">{card.code}</span>
          {card.edition && <span className="text-xs text-surface-500">Ed. {card.edition}</span>}
          {single.tn_game && <span className="text-xs text-surface-500">{single.tn_game}</span>}
        </div>
      </div>

      {/* Button */}
      <div className="shrink-0">
        <button
          onClick={() => onToggleAlbum(card.code)}
          title={inAlbum ? "Quitar del álbum digital" : "Agregar al álbum digital"}
          className={cn(
            "flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 border shrink-0",
            inAlbum
              ? "bg-violet-600 border-violet-500 text-white"
              : "bg-surface-800 border-surface-700 text-surface-400 hover:bg-violet-900/40 hover:text-violet-300 hover:border-violet-600"
          )}
        >
          <BookMarked className="h-3.5 w-3.5" />
          <span>{inAlbum ? "En álbum" : "Álbum"}</span>
        </button>
      </div>
    </div>
  );
}
