"use client";

import { useState, useOptimistic, useTransition } from "react";
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
  Gamepad2,
} from "lucide-react";
import { toggleFavorite } from "@/lib/actions/profile";

// ── Tipos ────────────────────────────────────────────────────

interface CollectionCard {
  code: string;
  name: string;
  number: string;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  owned: boolean;
  quantity: number;
  is_favorite: boolean;
  game: string;
}

// ── Juegos disponibles ───────────────────────────────────────

const GAMES = [
  { id: "all",  label: "Todos los juegos", icon: "🎮" },
  { id: "ktcg", label: "Kingdom TCG",       icon: "👑" },
] as const;

const RARITIES = [
  { id: "all",       label: "Todas" },
  { id: "common",    label: "Común" },
  { id: "rare",      label: "Rara" },
  { id: "epic",      label: "Épica" },
  { id: "legendary", label: "Legendaria" },
  { id: "mythic",    label: "Mítica" },
];

const rarityClasses: Record<string, string> = {
  common:    "border-surface-600",
  rare:      "border-blue-500",
  epic:      "border-purple-500",
  legendary: "border-amber-500",
  mythic:    "border-rose-500",
};

const placeholderCards: CollectionCard[] = Array.from({ length: 32 }, (_, i) => ({
  code:        `KT${String(i + 1).padStart(3, "0")}`,
  name:        `Carta ${i + 1}`,
  number:      String(i + 1).padStart(3, "0"),
  rarity:      (["common", "rare", "epic", "legendary", "mythic"] as const)[i % 5],
  owned:       i % 3 !== 2,
  quantity:    i % 3 !== 2 ? (i % 4) + 1 : 0,
  is_favorite: false,
  game:        "ktcg",
}));

// ── Componente ───────────────────────────────────────────────

interface CollectionPageClientProps {
  cards?: CollectionCard[];
}

export default function CollectionPage({ cards = placeholderCards }: CollectionPageClientProps) {
  const [activeTab,    setActiveTab]    = useState<"digital" | "physical">("digital");
  const [view,         setView]         = useState<"grid" | "list">("grid");
  const [search,       setSearch]       = useState("");
  const [activeRarity, setActiveRarity] = useState("all");
  const [activeGame,   setActiveGame]   = useState("all");
  const [showFavs,     setShowFavs]     = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);

  const [optimisticCards, addOptimistic] = useOptimistic(
    cards,
    (prev: CollectionCard[], update: { code: string; value: boolean }) =>
      prev.map((c) => (c.code === update.code ? { ...c, is_favorite: update.value } : c))
  );
  const [, startTransition] = useTransition();

  const ownedCount    = optimisticCards.filter((c) => c.owned).length;
  const totalCount    = optimisticCards.length;
  const favCount      = optimisticCards.filter((c) => c.owned && c.is_favorite).length;
  const completionPct = Math.round((ownedCount / totalCount) * 100);

  const filtered = optimisticCards
    .filter((c) => {
      if (activeGame !== "all" && c.game !== activeGame) return false;
      if (activeRarity !== "all" && c.rarity !== activeRarity) return false;
      if (showFavs && !c.is_favorite) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.is_favorite === b.is_favorite) return 0;
      return a.is_favorite ? -1 : 1;
    });

  function handleFavorite(card: CollectionCard) {
    if (!card.owned) return;
    startTransition(async () => {
      addOptimistic({ code: card.code, value: !card.is_favorite });
      await toggleFavorite(card.code);
    });
  }

  const clearFilters = () => {
    setSearch(""); setActiveRarity("all"); setActiveGame("all"); setShowFavs(false);
  };
  const hasFilters = search || activeRarity !== "all" || activeGame !== "all" || showFavs;

  return (
    <PageLayout
      title="Mi Colección"
      description="Administrá tu álbum digital de Kingdom TCG"
    >
      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "digital",  label: "Álbum Digital", icon: BookOpen },
          { id: "physical", label: "Álbum Físico",  icon: Grid3X3  },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "digital" | "physical")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary-600 text-white"
                : "bg-surface-800 text-surface-400 hover:text-surface-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Progreso ── */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-surface-200">
              Progreso · Kingdom TCG — Génesis
            </p>
            <div className="flex items-center gap-3">
              {favCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-rose-400">
                  <Heart className="h-3.5 w-3.5 fill-rose-400" />
                  {favCount} favoritas
                </span>
              )}
              <span className="text-sm font-bold text-accent-400">
                {ownedCount}/{totalCount} ({completionPct}%)
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Buscar carta..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex rounded-lg border border-surface-700 overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-primary-600 text-white" : "bg-surface-800 text-surface-400"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-primary-600 text-white" : "bg-surface-800 text-surface-400"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowFavs(!showFavs)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFavs
                ? "border-rose-500 bg-rose-500/10 text-rose-400"
                : "border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200"
            }`}
          >
            <Heart className={`h-4 w-4 ${showFavs ? "fill-rose-400" : ""}`} />
            {favCount > 0 ? `Favoritas (${favCount})` : "Favoritas"}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFilters
                ? "border-primary-500 bg-primary-500/10 text-primary-400"
                : "border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* ── Panel de filtros ── */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gamepad2 className="h-3.5 w-3.5" /> Juego
              </p>
              <div className="flex gap-2 flex-wrap">
                {GAMES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGame(g.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      activeGame === g.id
                        ? "border-primary-500 bg-primary-600/20 text-primary-300"
                        : "border-surface-700 bg-surface-800/50 text-surface-400 hover:text-surface-200"
                    }`}
                  >
                    <span>{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                Rareza
              </p>
              <div className="flex gap-2 flex-wrap">
                {RARITIES.map((r) => (
                  <Badge
                    key={r.id}
                    variant={activeRarity === r.id ? "primary" : "default"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => setActiveRarity(r.id)}
                  >
                    {r.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Info resultados ── */}
      <p className="text-xs text-surface-500 mb-3">
        {filtered.filter((c) => c.owned).length} obtenidas de {filtered.length}
        {hasFilters && (
          <button onClick={clearFilters} className="ml-2 text-primary-400 hover:text-primary-300 underline">
            Limpiar filtros
          </button>
        )}
      </p>

      {/* ── Grid ── */}
      {view === "grid" ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filtered.map((card) => (
            <div key={card.code} className="relative group">
              <div
                className={`relative aspect-[2.5/3.5] rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 ${
                  card.owned ? rarityClasses[card.rarity] : "border-surface-700 opacity-40 grayscale"
                }`}
              >
                <div className="w-full h-full bg-surface-700 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-surface-400">{card.code}</span>
                </div>
                {card.owned && card.quantity > 1 && (
                  <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{card.quantity}</span>
                  </div>
                )}
                {card.owned && card.is_favorite && (
                  <div className="absolute top-1 left-1">
                    <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400 drop-shadow" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1.5 py-1">
                  <p className="text-[10px] text-surface-200 truncate">#{card.number}</p>
                </div>
              </div>

              {card.owned && (
                <button
                  onClick={() => handleFavorite(card)}
                  className={`absolute -top-1.5 -left-1.5 z-10 h-6 w-6 rounded-full flex items-center justify-center transition-all shadow-md ${
                    card.is_favorite
                      ? "bg-rose-500 text-white opacity-100"
                      : "bg-surface-800 text-surface-400 opacity-0 group-hover:opacity-100"
                  }`}
                  title={card.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
                >
                  <Heart className={`h-3 w-3 ${card.is_favorite ? "fill-white" : ""}`} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── Lista ── */
        <div className="space-y-1.5">
          {filtered.map((card) => (
            <div
              key={card.code}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                card.owned ? "bg-surface-800/50 hover:bg-surface-700/50" : "bg-surface-800/20 opacity-50"
              }`}
            >
              <div className="h-10 w-7 rounded bg-surface-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-100 truncate">
                  #{card.number} — {card.name}
                </p>
                <p className="text-xs text-surface-500">
                  {card.game === "ktcg" ? "Kingdom TCG" : card.game}
                </p>
              </div>
              <Badge variant={card.rarity === "mythic" ? "mythic" : card.rarity === "legendary" ? "legendary" : card.rarity === "epic" ? "epic" : card.rarity === "rare" ? "rare" : "common"}>
                {card.rarity}
              </Badge>
              {card.owned ? (
                <span className="text-xs text-surface-400">x{card.quantity}</span>
              ) : (
                <span className="text-xs text-surface-500">No obtenida</span>
              )}
              {card.owned && (
                <button
                  onClick={() => handleFavorite(card)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    card.is_favorite
                      ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
                      : "text-surface-600 hover:text-rose-400 hover:bg-rose-500/10"
                  }`}
                  title={card.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"}
                >
                  <Heart className={`h-4 w-4 ${card.is_favorite ? "fill-rose-400" : ""}`} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-surface-400 text-sm">No se encontraron cartas con esos filtros.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-primary-400 hover:text-primary-300 text-sm underline">
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </PageLayout>
  );
}
