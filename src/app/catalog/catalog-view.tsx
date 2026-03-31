"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Heart,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  allCards,
  cardCategories,
  factions,
  type KTCGCard,
  type KTCGCategory,
} from "@/data/cards";

// ---- Filter Options ----

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
  ...factions.map((f) => {
    if (f === "Gringud") return { label: "Gringud (incluye Kaihat, Daihat, Gukhal)", value: f.toLowerCase() };
    return { label: f, value: f.toLowerCase() };
  }),
];

const sortOptions = [
  { label: "Código (asc)", value: "code_asc" },
  { label: "Código (desc)", value: "code_desc" },
  { label: "Nombre (A-Z)", value: "name_asc" },
  { label: "Nombre (Z-A)", value: "name_desc" },
  { label: "Nivel (menor)", value: "level_asc" },
  { label: "Nivel (mayor)", value: "level_desc" },
];

const PAGE_SIZE = 48;

const categoryIcon: Record<KTCGCategory, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

// ---- Main Component ----

export function CatalogView({ codesInStore = new Set() }: { codesInStore?: Set<string> }) {
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

  // Filter + sort + paginate
  const filtered = useMemo(() => {
    let cards = [...allCards];

    // Search
    if (search) {
      const q = search.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.slug.includes(q)
      );
    }

    // Category
    if (category) {
      cards = cards.filter((c) => c.category === category);
    }

    // Level
    if (level) {
      const lv = Number(level);
      cards = cards.filter((c) => c.level === lv);
    }

    // Faction
    if (faction) {
      const fl = faction.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.name.toLowerCase().includes(fl) ||
          (c.crowned && c.crowned.toLowerCase().includes(fl))
      );
    }

    // Sort
    cards.sort((a, b) => {
      switch (sort) {
        case "code_asc":
          return a.code.localeCompare(b.code);
        case "code_desc":
          return b.code.localeCompare(a.code);
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "level_asc":
          return (a.level ?? 0) - (b.level ?? 0);
        case "level_desc":
          return (b.level ?? 0) - (a.level ?? 0);
        default:
          return 0;
      }
    });

    return cards;
  }, [search, category, level, faction, sort]);

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
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
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
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "grid"
                  ? "bg-surface-700 text-surface-100"
                  : "text-surface-400 hover:text-surface-200"
              )}
              aria-label="Vista grilla"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "list"
                  ? "bg-surface-700 text-surface-100"
                  : "text-surface-400 hover:text-surface-200"
              )}
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
            <Select
              label="Categoría"
              options={categoryOptions}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            />
            <Select
              label="Nivel"
              options={levelOptions}
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            />
            <Select
              label="Facción"
              options={factionOptions}
              value={faction}
              onChange={(e) => {
                setFaction(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            />
            <Select
              label="Ordenar por"
              options={sortOptions}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-800">
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge variant="primary">
                    {category}
                    <button onClick={() => setCategory("")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {level && (
                  <Badge variant="primary">
                    Nivel {level}
                    <button onClick={() => setLevel("")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {faction && (
                  <Badge variant="primary">
                    {factionOptions.find((o) => o.value === faction)?.label}
                    <button onClick={() => setFaction("")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ---- Results count ---- */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-400">
          Mostrando{" "}
          <span className="text-surface-200 font-medium">
            {visible.length}
          </span>{" "}
          de{" "}
          <span className="text-surface-200 font-medium">
            {filtered.length}
          </span>{" "}
          cartas
        </p>
      </div>

      {/* ---- Card Grid ---- */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {visible.map((card) => (
            <CatalogCard key={card.code} card={card} inStore={codesInStore.has(card.code)} />
          ))}
        </div>
      ) : (
        <div className="space-y-7">
          {visible.map((card) => (
            <CatalogListItem key={card.code} card={card} inStore={codesInStore.has(card.code)} />
          ))}
        </div>
      )}

      {/* ---- No results ---- */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-10 w-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">No se encontraron cartas</p>
          <p className="text-sm text-surface-500 mt-1">
            Probá cambiando los filtros o el texto de búsqueda
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* ---- Load More ---- */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
          >
            Cargar más cartas ({filtered.length - visibleCount} restantes)
          </Button>
        </div>
      )}
    </div>
  );
}

// ---- Grid Card Component ----

function CatalogCard({ card, inStore = false }: { card: KTCGCard; inStore?: boolean }) {
  const Icon = categoryIcon[card.category] ?? Shield;

  return (
    <Link href={`/catalog/${card.slug}`}>
      <div className="group relative bg-surface-900 border border-surface-800 rounded-xl overflow-hidden transition-transform hover:-translate-y-1">
  {/* Card Image Placeholder */}
  <div className="relative aspect-2.5/3.5 bg-surface-800 flex flex-col items-center justify-center p-3 text-center">
          <Icon className="h-8 w-8 text-surface-600 mb-2" />
          <span className="text-xs font-medium text-surface-300 leading-tight line-clamp-2">
            {card.name}
          </span>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-surface-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              className="p-2 bg-surface-800 rounded-lg hover:bg-surface-700 text-surface-200 transition-colors"
              title="Agregar a wishlist"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              className="p-2 bg-surface-800 rounded-lg hover:bg-surface-700 text-surface-200 transition-colors"
              title="Agregar a mazo"
              onClick={(e) => e.preventDefault()}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              className="p-2 bg-surface-800 rounded-lg hover:bg-surface-700 text-surface-200 transition-colors"
              title="Ver en singles"
              onClick={(e) => e.preventDefault()}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>

          {/* Code badge */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-900/90 border border-surface-700 text-[10px] font-mono text-surface-300">
            {card.code}
          </div>

          {/* Singles badge */}
          {inStore && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-primary-500/20 border border-primary-500/40 text-[10px] font-medium text-primary-300">
              Singles
            </div>
          )}
        </div>

        {/* Card Info */}
  <div className="p-3">
          <p className="text-sm font-medium text-surface-200 truncate">
            {card.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge variant="default">{card.category}</Badge>
            {card.level != null && (
              <Badge variant="info">Nv. {card.level}</Badge>
            )}
            {card.card_type === "coronado" && (
              <Badge variant="accent">Coronado</Badge>
            )}
          </div>
          {card.edition && (
            <p className="text-[10px] text-surface-500 mt-1.5">
              Ed. {card.edition}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ---- List Item Component ----

function CatalogListItem({ card, inStore = false }: { card: KTCGCard; inStore?: boolean }) {
  const Icon = categoryIcon[card.category] ?? Shield;

  return (
    <Link href={`/catalog/${card.slug}`}>
      <Card variant="interactive">
        <CardContent className="p-5 sm:p-6 flex items-center gap-6">
          {/* Thumbnail */}
          <div className="h-24 w-16 bg-surface-800 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden">
            <Icon className="h-7 w-7 text-surface-600" />
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-100 truncate">
              {card.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="default">{card.category}</Badge>
              {card.level != null && (
                <Badge variant="info">Nv. {card.level}</Badge>
              )}
              <span className="text-xs text-surface-400 font-mono">
                {card.code}
              </span>
              {card.edition && (
                <span className="text-xs text-surface-500">
                  Ed. {card.edition}
                </span>
              )}
              {inStore && (
                <Badge variant="primary">Singles</Badge>
              )}
            </div>
            {card.flavor_text && (
              <p className="text-xs text-surface-500 italic mt-2 line-clamp-1">
                {card.flavor_text}
              </p>
            )}
          </div>
          {/* Crowned info */}
          {card.crowned && (
            <div className="hidden sm:block text-xs text-surface-400 text-right shrink-0">
              <p className="text-surface-500">Coronado</p>
              <p className="text-surface-300">{card.crowned}</p>
            </div>
          )}
          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            <button
              className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
