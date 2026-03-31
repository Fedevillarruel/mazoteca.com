"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ShoppingCart,
  X,
  Package,
  Crown,
  Shield,
  Star,
  Scroll,
  Sparkles,
  Crosshair,
  Tag,
  ChevronDown,
  Zap,
  Minus,
  Plus,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TNGameTree } from "@/lib/services/tiendanube";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawVariant = Record<string, any>;

type NormalizedCard = {
  name: string;
  slug: string;
  category: string;
  card_type: string;
  level: number | null;
  edition: string | null;
} | null;

type NormalizedProduct = {
  id: number | string;
  name: string;
  handle: string | null;
  published: boolean;
} | null;

type SingleVariant = {
  id: number | string;
  product_id: number | string;
  card_code: string | null;
  finish: string | null;
  condition: string | null;
  price: number | null;
  promotional_price: number | null;
  stock: number;
  image_url: string | null;
  synced_at: string;
  tiendanube_products: NormalizedProduct;
  cards: NormalizedCard;
};

function normalize(raw: RawVariant): SingleVariant {
  const tn = raw.tiendanube_products;
  const c = raw.cards;
  return {
    ...raw,
    tiendanube_products: Array.isArray(tn) ? (tn[0] ?? null) : (tn ?? null),
    cards: Array.isArray(c) ? (c[0] ?? null) : (c ?? null),
  } as SingleVariant;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any[];
  totalCount: number;
  userEmail: string | null;
  gameCategories: TNGameTree[];
}

// Íconos y colores por subcategoría conocida (se amplían sin romper nada)
const SUBCATEGORY_ICONS: Record<string, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

const SUBCATEGORY_COLORS: Record<string, string> = {
  Tropas: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Coronados: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Realeza: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  Estrategia: "text-green-400 bg-green-400/10 border-green-400/20",
  "Estrategia Primigenia": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  Arroje: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

const TN_DOMAIN = process.env.NEXT_PUBLIC_TN_STORE_DOMAIN ?? "";

// Deriva el juego de una variante comparando su cards.category
// con las subcategorías de cada juego en TN
function deriveGame(variant: SingleVariant, gameCategories: TNGameTree[]): string | null {
  if (!variant.cards?.category) return null;
  const cat = variant.cards.category;
  for (const game of gameCategories) {
    if (game.subcategories.some((s) => s.name === cat)) return game.name;
  }
  return null;
}

export function SinglesView({ initialData, totalCount, userEmail, gameCategories }: Props) {
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("Todos");
  const [selectedSub, setSelectedSub] = useState<string>("Todas");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "name_asc">("price_asc");

  const normalized: SingleVariant[] = useMemo(() => initialData.map(normalize), [initialData]);

  // Subcategorías disponibles para el juego seleccionado
  const availableSubs = useMemo(() => {
    if (selectedGame === "Todos") {
      return gameCategories.flatMap((g) => g.subcategories);
    }
    return gameCategories.find((g) => g.name === selectedGame)?.subcategories ?? [];
  }, [gameCategories, selectedGame]);

  const handleGameChange = (game: string) => {
    setSelectedGame(game);
    setSelectedSub("Todas");
  };

  const filtered = useMemo(() => {
    let items = [...normalized];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (v) =>
          v.cards?.name?.toLowerCase().includes(q) ||
          v.card_code?.toLowerCase().includes(q) ||
          v.tiendanube_products?.name?.toLowerCase().includes(q) ||
          v.finish?.toLowerCase().includes(q)
      );
    }

    if (selectedGame !== "Todos") {
      items = items.filter((v) => deriveGame(v, gameCategories) === selectedGame);
    }

    if (selectedSub !== "Todas") {
      items = items.filter((v) => v.cards?.category === selectedSub);
    }

    items.sort((a, b) => {
      if (sortBy === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      return (a.cards?.name ?? "").localeCompare(b.cards?.name ?? "");
    });

    return items;
  }, [normalized, search, selectedGame, selectedSub, sortBy, gameCategories]);

  const hasSingles = normalized.length > 0;
  const hasMultipleGames = gameCategories.length > 1;

  return (
    <div className="space-y-5">

      {/* ── Search + Sort ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-10 pl-3 pr-8 rounded-lg border border-surface-700 bg-surface-900 text-sm text-surface-200 focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
          >
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="name_asc">Nombre A–Z</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Filtros dinámicos ── */}
      <div className="space-y-2.5">

        {/* Filtro Juego — solo si hay más de uno */}
        {hasMultipleGames && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[11px] text-surface-500 uppercase tracking-wider font-medium w-10 shrink-0">Juego</span>
            <button
              onClick={() => handleGameChange("Todos")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                selectedGame === "Todos"
                  ? "bg-primary-600 border-primary-500 text-white shadow-sm shadow-primary-500/30"
                  : "bg-surface-800/60 border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-500"
              )}
            >
              <Layers className="h-3 w-3" />
              Todos
            </button>
            {gameCategories.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameChange(game.name)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  selectedGame === game.name
                    ? "bg-primary-600 border-primary-500 text-white shadow-sm shadow-primary-500/30"
                    : "bg-surface-800/60 border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-500"
                )}
              >
                {game.name}
              </button>
            ))}
          </div>
        )}

        {/* Filtro Subcategoría — siempre visible si hay subs */}
        {availableSubs.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[11px] text-surface-500 uppercase tracking-wider font-medium shrink-0">Tipo</span>
            <button
              onClick={() => setSelectedSub("Todas")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                selectedSub === "Todas"
                  ? "bg-primary-600 border-primary-500 text-white shadow-sm shadow-primary-500/30"
                  : "bg-surface-800/60 border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-500"
              )}
            >
              Todas
            </button>
            {availableSubs.map((sub) => {
              const Icon = SUBCATEGORY_ICONS[sub.name];
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSub(sub.name)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    selectedSub === sub.name
                      ? "bg-primary-600 border-primary-500 text-white shadow-sm shadow-primary-500/30"
                      : "bg-surface-800/60 border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-500"
                  )}
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Fallback: si TN API falló, derivar categorías de los datos */}
        {gameCategories.length === 0 && hasSingles && (
          <DerivedCategoryFilter
            variants={normalized}
            selectedSub={selectedSub}
            onSelect={setSelectedSub}
          />
        )}
      </div>

      {/* ── Counter ── */}
      {hasSingles && (
        <div className="flex items-center justify-between text-xs text-surface-500">
          <span>
            <span className="text-surface-300 font-medium">{filtered.length}</span>
            {" "}resultado{filtered.length !== 1 ? "s" : ""}
            {totalCount > initialData.length && (
              <span className="ml-1">de {totalCount} totales</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-green-400" />
            Stock en tiempo real
          </span>
        </div>
      )}

      {/* ── Empty state ── */}
      {!hasSingles && (
        <div className="text-center py-20">
          <Package className="h-12 w-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-200 mb-2">
            Sin singles disponibles
          </h3>
          <p className="text-sm text-surface-400 max-w-sm mx-auto">
            El stock se sincroniza desde la tienda oficial. Revisá más tarde.
          </p>
        </div>
      )}

      {/* ── No results post-filter ── */}
      {hasSingles && filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-8 w-8 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">Sin resultados para esa búsqueda</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => {
            setSearch(""); setSelectedGame("Todos"); setSelectedSub("Todas");
          }}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((variant) => (
            <SingleCard key={variant.id} variant={variant} userEmail={userEmail} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Fallback filter derivado de los datos cuando la API TN falla ─────────────

function DerivedCategoryFilter({
  variants,
  selectedSub,
  onSelect,
}: {
  variants: SingleVariant[];
  selectedSub: string;
  onSelect: (s: string) => void;
}) {
  const cats = useMemo(() => {
    const seen = new Set<string>();
    for (const v of variants) if (v.cards?.category) seen.add(v.cards.category);
    return Array.from(seen).sort();
  }, [variants]);

  if (cats.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onSelect("Todas")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
          selectedSub === "Todas"
            ? "bg-primary-600 border-primary-500 text-white"
            : "bg-surface-800/60 border-surface-700 text-surface-400 hover:text-surface-200"
        )}
      >
        Todas
      </button>
      {cats.map((cat) => {
        const Icon = SUBCATEGORY_ICONS[cat];
        return (
          <button key={cat} onClick={() => onSelect(cat)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              selectedSub === cat
                ? "bg-primary-600 border-primary-500 text-white"
                : "bg-surface-800/60 border-surface-700 text-surface-400 hover:text-surface-200"
            )}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {cat}
          </button>
        );
      })}
    </div>
  );
}

// ── Single listing card ───────────────────────────────────────

function SingleCard({ variant, userEmail }: { variant: SingleVariant; userEmail: string | null }) {
  const card = variant.cards;
  const product = variant.tiendanube_products;
  const Icon = SUBCATEGORY_ICONS[card?.category ?? ""] ?? Shield;
  const catColor = SUBCATEGORY_COLORS[card?.category ?? ""] ?? "text-surface-400 bg-surface-700/30 border-surface-600/20";
  const displayName = card?.name ?? product?.name ?? `Single #${variant.id}`;

  const currentPrice = variant.price;
  const originalPrice = variant.promotional_price;
  const hasDiscount = originalPrice != null && currentPrice != null && originalPrice > currentPrice;
  const discountPct = hasDiscount ? Math.round((1 - currentPrice! / originalPrice!) * 100) : null;

  const stockUnlimited = variant.stock >= 999;
  const maxQty = stockUnlimited ? 10 : variant.stock;
  const stockLow = !stockUnlimited && variant.stock <= 3 && variant.stock > 0;

  const [qty, setQty] = useState(1);
  const cardHref = card?.slug ? `/catalog/${card.slug}` : `/singles/${variant.product_id}`;

  return (
    <div className="group flex flex-col bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden hover:border-surface-600 hover:shadow-lg hover:shadow-black/30 transition-all duration-200">

      {/* Image */}
      <div className="relative bg-surface-800 overflow-hidden" style={{ aspectRatio: "63/88" }}>
        {variant.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={variant.image_url} alt={displayName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-linear-to-br from-surface-800 to-surface-900">
            <Icon className="h-10 w-10 text-surface-600" />
            <span className="text-xs text-surface-600 font-mono">{variant.card_code}</span>
          </div>
        )}
        {hasDiscount && discountPct != null && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold shadow">
            -{discountPct}%
          </div>
        )}
        {stockLow && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold">
            ¡Últimos {variant.stock}!
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Nombre + tags */}
        <div className="space-y-1.5">
          <Link href={cardHref} className="block hover:text-primary-300 transition-colors">
            <h3 className="font-semibold text-surface-100 leading-tight line-clamp-2 text-sm">{displayName}</h3>
          </Link>
          <div className="flex items-center gap-1.5 flex-wrap">
            {card?.category && (
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border", catColor)}>
                <Icon className="h-2.5 w-2.5" />
                {card.category}
              </span>
            )}
            {variant.finish && (
              <span className="inline-flex items-center gap-1 text-[10px] text-surface-400 px-2 py-0.5 rounded-full border border-surface-700 bg-surface-800">
                <Tag className="h-2.5 w-2.5" />
                {variant.finish}
              </span>
            )}
          </div>
        </div>

        {/* Precio (refleja la cantidad) */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-white">
            {currentPrice != null ? `$${(currentPrice * qty).toLocaleString("es-AR")}` : "Consultar"}
          </span>
          {hasDiscount && originalPrice != null && (
            <span className="text-sm text-surface-500 line-through">
              ${(originalPrice * qty).toLocaleString("es-AR")}
            </span>
          )}
        </div>

        <div className="border-t border-surface-800" />

        {/* Stock + condición */}
        <div className="flex items-center justify-between text-xs text-surface-500">
          <span>
            {stockUnlimited ? "✓ Disponible" : stockLow ? `⚠ Solo ${variant.stock} en stock` : `${variant.stock} en stock`}
          </span>
          {variant.condition && <span className="text-surface-400">{variant.condition}</span>}
        </div>

        {/* Selector de cantidad — solo si hay stock > 1 y el usuario está logueado */}
        {userEmail !== null && maxQty > 1 && (
          <div className="flex items-center justify-between bg-surface-800 rounded-lg px-3 py-2">
            <span className="text-xs text-surface-400">Cantidad</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="h-6 w-6 rounded-md bg-surface-700 hover:bg-surface-600 disabled:opacity-40 flex items-center justify-center transition-colors"
              >
                <Minus className="h-3 w-3 text-surface-300" />
              </button>
              <span className="text-sm font-semibold text-surface-100 w-5 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="h-6 w-6 rounded-md bg-surface-700 hover:bg-surface-600 disabled:opacity-40 flex items-center justify-center transition-colors"
              >
                <Plus className="h-3 w-3 text-surface-300" />
              </button>
            </div>
          </div>
        )}

        {/* CTA */}
        {userEmail === null ? (
          <a
            href="/login?redirect=/singles"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/30 hover:shadow-primary-500/40 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            Iniciá sesión para comprar
          </a>
        ) : (
          <button
            onClick={async () => {
              if (!TN_DOMAIN) return;
              const base = TN_DOMAIN.startsWith("http") ? TN_DOMAIN : `https://${TN_DOMAIN}`;
              try {
                await fetch(`${base}/carrito/agregar`, {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: `add_to_cart=${variant.id}&quantity=${qty}`,
                  mode: "no-cors",
                  credentials: "include",
                });
              } catch {
                // no-cors siempre rechaza la promise — ignoramos
              }
              window.open(`${base}/carrito`, "_blank");
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/30 hover:shadow-primary-500/40 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            {qty > 1 ? `Comprar ${qty}` : "Comprar ahora"}
          </button>
        )}
      </div>
    </div>
  );
}
