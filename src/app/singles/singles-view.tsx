"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingBag,
  ExternalLink,
  Filter,
  X,
  Package,
  RefreshCw,
  Crown,
  Shield,
  Star,
  Scroll,
  Sparkles,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  // Accept raw Supabase response (joins can be arrays or objects)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any[];
  totalCount: number;
}

const CATEGORY_ICONS: Record<string, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

const CONDITION_BADGE: Record<string, "success" | "info" | "warning" | "error" | "default"> = {
  "Near Mint": "success",
  "Lightly Played": "info",
  "Moderately Played": "warning",
  "Heavily Played": "error",
  Damaged: "error",
};

const CATEGORIES = ["Todas", "Tropas", "Coronados", "Realeza", "Estrategia", "Estrategia Primigenia", "Arroje"];

export function SinglesView({ initialData, totalCount }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "name_asc">("price_asc");

  // Normalise Supabase join arrays → objects
  const normalized: SingleVariant[] = useMemo(() => initialData.map(normalize), [initialData]);

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

    if (category !== "Todas") {
      items = items.filter((v) => v.cards?.category === category);
    }

    items.sort((a, b) => {
      if (sortBy === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
      return (a.cards?.name ?? "").localeCompare(b.cards?.name ?? "");
    });

    return items;
  }, [normalized, search, category, sortBy]);

  const hasSingles = normalized.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Search + Filters bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar carta, código, acabado..."
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
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-10 px-3 rounded-lg border border-surface-700 bg-surface-900 text-sm text-surface-200 focus:outline-none focus:border-primary-500"
          >
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="name_asc">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              category === cat
                ? "bg-primary-600 text-white"
                : "bg-surface-800 text-surface-400 hover:text-surface-200 hover:bg-surface-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Filters panel ── */}
      {showFilters && (
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <p className="text-sm text-surface-400">
            Los filtros avanzados se aplican después de la sincronización con Tiendanube.
            Podés filtrar por categoría en las tabs de arriba.
          </p>
        </div>
      )}

      {/* ── Results count ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-400">
          Mostrando{" "}
          <span className="text-surface-200 font-medium">{filtered.length}</span>
          {" "}de{" "}
          <span className="text-surface-200 font-medium">{initialData.length}</span>
          {" "}singles disponibles
          {totalCount > initialData.length && (
            <span className="ml-1 text-surface-500">
              ({totalCount} en total)
            </span>
          )}
        </p>
        <p className="text-xs text-surface-500 flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Stock en tiempo real desde Tiendanube
        </p>
      </div>

      {/* ── No singles state ── */}
      {!hasSingles && (
        <div className="text-center py-20">
          <Package className="h-12 w-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-200 mb-2">
            Sin singles disponibles ahora
          </h3>
          <p className="text-sm text-surface-400 max-w-sm mx-auto mb-6">
            El stock se sincroniza desde nuestra tienda oficial. Revisá más tarde
            o seguinos en redes para saber cuándo hay novedades.
          </p>
          <a
            href={`https://www.tiendanube.com/tienda/${process.env.NEXT_PUBLIC_TN_STORE_SLUG ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="accent">
              <ExternalLink className="h-4 w-4" />
              Ver tienda oficial
            </Button>
          </a>
        </div>
      )}

      {/* ── No results (post-filter) ── */}
      {hasSingles && filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-8 w-8 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">No se encontraron cartas</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearch(""); setCategory("Todas"); }}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* ── Singles Grid ── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((variant) => (
            <SingleCard key={variant.id} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single card tile ──────────────────────────────────────────

function SingleCard({ variant }: { variant: SingleVariant }) {
  const card = variant.cards;
  const product = variant.tiendanube_products;
  const Icon = CATEGORY_ICONS[card?.category ?? ""] ?? Shield;

  const displayPrice = variant.promotional_price ?? variant.price;
  const hasDiscount = variant.promotional_price != null && variant.price != null
    && variant.promotional_price < variant.price;

  // Link to catalog detail or TN product
  const cardHref = card?.slug ? `/catalog/${card.slug}` : `/singles/${variant.product_id}`;
  const buyHref = product?.handle
    ? `https://www.tiendanube.com/${product.handle}`
    : null;

  return (
    <div className="group relative bg-surface-900 border border-surface-800 rounded-xl overflow-hidden transition-transform hover:-translate-y-1 hover:border-surface-600">
      {/* Image / placeholder */}
      <div className="relative aspect-63/88 bg-surface-800 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
        {variant.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={variant.image_url}
            alt={card?.name ?? "Carta"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Icon className="h-8 w-8 text-surface-600 mb-2" />
        )}

        {/* Code badge */}
        {variant.card_code && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-900/90 border border-surface-700 text-[10px] font-mono text-surface-300 z-10">
            {variant.card_code}
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-surface-900/80 text-[10px] text-surface-400 z-10">
          ×{variant.stock}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-surface-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20">
          <Link href={cardHref}>
            <Button size="sm" variant="secondary" className="text-xs">
              Ver carta
            </Button>
          </Link>
          {buyHref && (
            <a href={buyHref} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="text-xs">
                <ShoppingBag className="h-3 w-3" />
                Comprar
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-surface-200 truncate">
          {card?.name ?? product?.name ?? `Single #${variant.id}`}
        </p>

        {/* Finish */}
        {variant.finish && variant.finish !== "Estándar" && (
          <p className="text-xs text-surface-400 truncate mt-0.5">{variant.finish}</p>
        )}

        {/* Condition */}
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {variant.condition && (
            <Badge variant={CONDITION_BADGE[variant.condition] ?? "default"} className="text-[10px] px-1.5 py-0.5">
              {variant.condition}
            </Badge>
          )}
          {card?.category && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0.5">
              {card.category}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-accent-400">
            {displayPrice != null
              ? `$${displayPrice.toLocaleString("es-AR")}`
              : "Consultar"}
          </span>
          {hasDiscount && variant.price != null && (
            <span className="text-xs text-surface-500 line-through">
              ${variant.price.toLocaleString("es-AR")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
