"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addToAlbum } from "@/lib/actions/profile";
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
  ShoppingCart,
  Check,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allCards,
  cardCategories,
  factions,
  type KTCGCard,
  type KTCGCategory,
} from "@/data/cards";
import type { CatalogSingleEntry } from "@/lib/services/tiendanube-sync";
import { useCartStore } from "@/lib/stores";

// ── TN domain (for buy links) ────────────────────────────────
// (usado solo para imagen de fallback de tienda si es necesario)

interface CardWithSingle extends KTCGCard {
  single: CatalogSingleEntry;
}

// ── Sort options ─────────────────────────────────────────────
const sortOptions = [
  { label: "Código (asc)", value: "code_asc" },
  { label: "Código (desc)", value: "code_desc" },
  { label: "Nombre (A-Z)", value: "name_asc" },
  { label: "Precio (menor)", value: "price_asc" },
  { label: "Precio (mayor)", value: "price_desc" },
  { label: "Stock (mayor)", value: "stock_desc" },
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

const PAGE_SIZE = 48;

// ── Price helpers ─────────────────────────────────────────────
function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

// ---- Main Component ----

export function CatalogView({ singlesMap }: { singlesMap: Map<string, CatalogSingleEntry> }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [faction, setFaction] = useState("");
  const [sort, setSort] = useState("code_asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const activeFilterCount = [category, level, faction].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setCategory("");
    setLevel("");
    setFaction("");
    setSearch("");
  }, []);

  // Only cards present in singlesMap (uploaded to TiendaNube)
  const catalogCards = useMemo<CardWithSingle[]>(() => {
    return allCards
      .filter((c) => singlesMap.has(c.code))
      .map((c) => ({ ...c, single: singlesMap.get(c.code)! }));
  }, [singlesMap]);

  // Filter + sort + paginate
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

    cards.sort((a, b) => {
      switch (sort) {
        case "code_asc": return a.code.localeCompare(b.code);
        case "code_desc": return b.code.localeCompare(a.code);
        case "name_asc": return a.name.localeCompare(b.name);
        case "price_asc": return (a.single.min_price ?? 0) - (b.single.min_price ?? 0);
        case "price_desc": return (b.single.min_price ?? 0) - (a.single.min_price ?? 0);
        case "stock_desc": return b.single.total_stock - a.single.total_stock;
        default: return 0;
      }
    });

    return cards;
  }, [catalogCards, search, category, level, faction, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-6">
      {/* ---- Search & Controls Bar ---- */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o código (ej: KT001, Viggo)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              search ? (
                <button onClick={() => setSearch("")} className="text-surface-400 hover:text-surface-200">
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

      {/* ---- Filters Panel ---- */}
      {showFilters && (
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Categoría" options={categoryOptions} value={category} onChange={(e) => { setCategory(e.target.value); setVisibleCount(PAGE_SIZE); }} />
            <Select label="Nivel" options={levelOptions} value={level} onChange={(e) => { setLevel(e.target.value); setVisibleCount(PAGE_SIZE); }} />
            <Select label="Facción" options={factionOptions} value={faction} onChange={(e) => { setFaction(e.target.value); setVisibleCount(PAGE_SIZE); }} />
            <Select label="Ordenar por" options={sortOptions} value={sort} onChange={(e) => setSort(e.target.value)} />
          </div>
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-800">
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge variant="primary">{category}<button onClick={() => setCategory("")} className="ml-1"><X className="h-3 w-3" /></button></Badge>
                )}
                {level && (
                  <Badge variant="primary">Nivel {level}<button onClick={() => setLevel("")} className="ml-1"><X className="h-3 w-3" /></button></Badge>
                )}
                {faction && (
                  <Badge variant="primary">
                    {factionOptions.find((o) => o.value === faction)?.label}
                    <button onClick={() => setFaction("")} className="ml-1"><X className="h-3 w-3" /></button>
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>Limpiar filtros</Button>
            </div>
          )}
        </div>
      )}

      {/* ---- Results count ---- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-400">
          Mostrando <span className="text-surface-200 font-medium">{visible.length}</span>{" "}
          de <span className="text-surface-200 font-medium">{filtered.length}</span> cartas en venta
        </p>
      </div>

      {/* ---- Card Grid ---- */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {visible.map((card) => (
            <CatalogCard key={card.code} card={card} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((card) => (
            <CatalogListItem key={card.code} card={card} />
          ))}
        </div>
      )}

      {/* ---- No results ---- */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">No se encontraron cartas</p>
          <p className="text-sm text-surface-500 mt-1">Probá cambiando los filtros o el texto de búsqueda</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>Limpiar filtros</Button>
        </div>
      )}

      {/* ---- Load More ---- */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
            Cargar más ({filtered.length - visibleCount} restantes)
          </Button>
        </div>
      )}
    </div>
  );
}

// ---- Grid Card Component ----

function CatalogCard({ card }: { card: CardWithSingle }) {
  const Icon = categoryIcon[card.category] ?? Shield;
  const { single } = card;
  const hasDiscount = single.promotional_price != null && single.min_price != null && single.promotional_price < single.min_price;
  const displayPrice = single.promotional_price ?? single.min_price;
  const originalPrice = hasDiscount ? single.min_price : null;
  const outOfStock = single.total_stock === 0;
  const lowStock = !outOfStock && single.total_stock <= 3;

  const { addItem, items } = useCartStore();
  const variantId = single.variant_ids[0];
  const inCart = variantId != null && items.some((i) => i.variantId === variantId);
  const [added, setAdded] = useState(false);
  const [addedAlbum, setAddedAlbum] = useState(false);

  function handleAddToCart() {
    if (!variantId || outOfStock) return;
    addItem({
      variantId,
      productId: variantId,
      name: card.name,
      subtitle: card.category + (card.level != null ? ` · Nv.${card.level}` : ""),
      imageUrl: single.image_url ?? undefined,
      price: displayPrice ?? 0,
      maxStock: Math.min(single.total_stock, 10),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  async function handleAddToAlbum() {
    const res = await addToAlbum(card.code);
    if (res.needsAuth) { window.location.href = "/login"; return; }
    if (res.success) { setAddedAlbum(true); setTimeout(() => setAddedAlbum(false), 2000); }
  }

  return (
    <div className="group relative bg-surface-900 border border-surface-800 rounded-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5">
      {/* Image — clickable → detail page */}
      <Link href={`/catalog/${card.slug}`} className="block">
        <div className="relative aspect-5/7 bg-surface-800 overflow-hidden">
          {single.image_url ? (
            <Image
              src={single.image_url}
              alt={card.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-surface-950/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-surface-300 uppercase tracking-widest bg-surface-900/80 px-2 py-1 rounded">Sin stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link href={`/catalog/${card.slug}`} className="text-xs font-semibold text-surface-200 leading-tight line-clamp-2 hover:text-primary-300 transition-colors">{card.name}</Link>

        {/* Price */}
        {displayPrice != null && (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-primary-400">{formatARS(displayPrice)}</span>
            {originalPrice != null && (
              <span className="text-[11px] text-surface-500 line-through">{formatARS(originalPrice)}</span>
            )}
          </div>
        )}

        {/* Stock */}
        <div className="flex items-center gap-1">
          {outOfStock ? (
            <span className="text-[10px] text-surface-500">Sin stock</span>
          ) : lowStock ? (
            <span className="text-[10px] text-amber-400 font-medium">¡Solo {single.total_stock}!</span>
          ) : (
            <span className="text-[10px] text-surface-500">{single.total_stock} disponibles</span>
          )}
        </div>

        {/* Buttons row */}
        <div className="mt-auto flex gap-1.5">
          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            title="Agregar al carrito"
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all duration-200",
              outOfStock
                ? "bg-surface-800 text-surface-500 cursor-not-allowed"
                : added || inCart
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-primary-600 hover:bg-primary-500 text-white"
            )}
          >
            {added ? (
              <><Check className="h-3 w-3" />¡Listo!</>
            ) : inCart ? (
              <><Check className="h-3 w-3" />En carrito</>
            ) : outOfStock ? (
              "Sin stock"
            ) : (
              <><ShoppingCart className="h-3 w-3" />Comprar</>
            )}
          </button>

          {/* Add to album */}
          <button
            onClick={handleAddToAlbum}
            title="Agregar al álbum"
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all duration-200 border",
              addedAlbum
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-surface-800 border-surface-700 text-surface-300 hover:bg-surface-700 hover:text-primary-300 hover:border-primary-500"
            )}
          >
            {addedAlbum ? <Check className="h-3 w-3" /> : <BookMarked className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- List Item Component ----

function CatalogListItem({ card }: { card: CardWithSingle }) {
  const Icon = categoryIcon[card.category] ?? Shield;
  const { single } = card;
  const hasDiscount = single.promotional_price != null && single.min_price != null && single.promotional_price < single.min_price;
  const displayPrice = single.promotional_price ?? single.min_price;
  const originalPrice = hasDiscount ? single.min_price : null;
  const outOfStock = single.total_stock === 0;
  const lowStock = !outOfStock && single.total_stock <= 3;

  const { addItem, items } = useCartStore();
  const variantId = single.variant_ids[0];
  const inCart = variantId != null && items.some((i) => i.variantId === variantId);
  const [added, setAdded] = useState(false);
  const [addedAlbum, setAddedAlbum] = useState(false);

  function handleAddToCart() {
    if (!variantId || outOfStock) return;
    addItem({
      variantId,
      productId: variantId,
      name: card.name,
      subtitle: card.category + (card.level != null ? ` · Nv.${card.level}` : ""),
      imageUrl: single.image_url ?? undefined,
      price: displayPrice ?? 0,
      maxStock: Math.min(single.total_stock, 10),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  async function handleAddToAlbum() {
    const res = await addToAlbum(card.code);
    if (res.needsAuth) { window.location.href = "/login"; return; }
    if (res.success) { setAddedAlbum(true); setTimeout(() => setAddedAlbum(false), 2000); }
  }

  return (
    <div className="flex items-center gap-4 bg-surface-900 border border-surface-800 rounded-xl p-4 hover:border-surface-700 transition-colors">
      {/* Thumbnail — clickable */}
      <Link href={`/catalog/${card.slug}`} className="h-20 w-14 bg-surface-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
        {single.image_url ? (
          <Image src={single.image_url} alt={card.name} fill className="object-cover" sizes="56px" />
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
        </div>
        {/* Stock */}
        <p className="text-xs mt-1.5">
          {outOfStock ? (
            <span className="text-surface-500">Sin stock</span>
          ) : lowStock ? (
            <span className="text-amber-400 font-medium">¡Solo {single.total_stock} disponibles!</span>
          ) : (
            <span className="text-surface-400">{single.total_stock} disponibles</span>
          )}
        </p>
      </div>

      {/* Price + buttons */}
      <div className="shrink-0 text-right flex flex-col items-end gap-2">
        {displayPrice != null && (
          <div className="flex flex-col items-end">
            <span className="text-base font-bold text-primary-400">{formatARS(displayPrice)}</span>
            {originalPrice != null && (
              <span className="text-xs text-surface-500 line-through">{formatARS(originalPrice)}</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={cn(
              "flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200",
              outOfStock
                ? "bg-surface-800 text-surface-500 cursor-not-allowed"
                : added || inCart
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-primary-600 hover:bg-primary-500 text-white"
            )}
          >
            {added ? (
              <><Check className="h-3.5 w-3.5" />¡Listo!</>
            ) : inCart ? (
              <><Check className="h-3.5 w-3.5" />En carrito</>
            ) : outOfStock ? (
              "Sin stock"
            ) : (
              <><ShoppingCart className="h-3.5 w-3.5" />Comprar</>
            )}
          </button>

          {/* Add to album */}
          <button
            onClick={handleAddToAlbum}
            title="Agregar al álbum"
            className={cn(
              "flex items-center justify-center py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 border",
              addedAlbum
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-surface-800 border-surface-700 text-surface-300 hover:bg-surface-700 hover:text-primary-300 hover:border-primary-500"
            )}
          >
            {addedAlbum ? <Check className="h-3.5 w-3.5" /> : <BookMarked className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
