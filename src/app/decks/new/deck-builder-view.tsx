"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  X,
  Save,
  Crown,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowLeft,
  Globe,
  Lock,
  Heart,
  Swords,
  BookOpen,
} from "lucide-react";
import { allCards } from "@/data/cards";
import { getFavorites } from "@/lib/actions/profile";

// ─── Constants ──────────────────────────────────────────────────────────────

const DECK_TYPES = [
  {
    id: "combatants",
    label: "Combatientes",
    max: 33,
    hasCrowned: true,
    description: "33 tropas + 1 coronado",
    hint: "Nv1×12 · Nv2×12 · Nv3×6 · Nv4×3",
  },
  {
    id: "strategy",
    label: "Estrategia",
    max: 30,
    hasCrowned: false,
    description: "30 cartas exactas",
    maxCopies: 2,
    hint: "Estrategia (mín 15) · Realeza (máx 5, 1 de cada) · Arroje (máx 10)",
  },
] as const;

type DeckType = (typeof DECK_TYPES)[number]["id"];

// Slot limits per level for combatant decks
const LEVEL_LIMITS: Record<number, number> = { 1: 12, 2: 12, 3: 6, 4: 3 };

const CORONADOS = [
  { id: "all",   label: "Todos",  fullName: null,                  code: null },
  { id: "viggo", label: "Viggo",  fullName: "Viggo de Fahridor",   code: "KC001" },
  { id: "nemea", label: "Nemea",  fullName: "Nemea de Goldinfeit", code: "KC002" },
  { id: "igno",  label: "Igno",   fullName: "Igno de Estonbleiz",  code: "KC003" },
  { id: "erya",  label: "Erya",   fullName: "Erya de Gringud",     code: "KC004" },
] as const;

type CoronadoId = (typeof CORONADOS)[number]["id"];

interface DeckEntry {
  cardId: string;
  quantity: number;
}

interface Props {
  /** code → image_url from TiendaNube */
  imageMap: Record<string, string | null>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DeckBuilderView({ imageMap }: Props) {
  const [deckName,       setDeckName]       = useState("");
  const [deckType,       setDeckType]       = useState<DeckType>("combatants");
  const [isPublic,       setIsPublic]       = useState(true);
  const [search,         setSearch]         = useState("");
  const [deckCards,      setDeckCards]      = useState<DeckEntry[]>([]);
  const [crownedId,      setCrownedId]      = useState<string | null>(null);
  const [activeCoronado, setActiveCoronado] = useState<CoronadoId>("all");
  const [favCodes,       setFavCodes]       = useState<Set<string>>(new Set());
  // "combatants" | "strategy" pool tab (only relevant for combatant deck type)
  const [poolTab,        setPoolTab]        = useState<"combatants" | "strategy">("combatants");
  // Track last-added card for stack animation
  const [lastAdded,      setLastAdded]      = useState<string | null>(null);

  // Load favorites once on mount
  useEffect(() => {
    getFavorites().then((codes) => {
      if (codes) setFavCodes(new Set(codes));
    });
  }, []);

  const deckConfig   = DECK_TYPES.find((t) => t.id === deckType)!;
  const totalCards   = deckCards.reduce((sum, e) => sum + e.quantity, 0);
  const maxCards     = deckConfig.max;
  const getCardById  = useCallback((id: string) => allCards.find((c) => c.code === id), []);

  // Per-level slot usage (combatant decks only)
  const levelCount = useCallback(
    (level: number) =>
      deckCards
        .filter((e) => getCardById(e.cardId)?.level === level)
        .reduce((sum, e) => sum + e.quantity, 0),
    [deckCards, getCardById],
  );

  // Can we add one more copy of this card?
  const canAddCard = useCallback(
    (cardId: string): boolean => {
      const card = getCardById(cardId);
      if (!card) return false;
      if (deckType === "combatants") {
        // Tropas: unlimited copies per card, but level slot cap
        if (card.card_type === "tropa") {
          const lim = LEVEL_LIMITS[card.level ?? 0];
          if (lim !== undefined && levelCount(card.level!) >= lim) return false;
          // total cap
          return totalCards < maxCards;
        }
        // Non-tropas (should not be addable in combatants tab)
        return false;
      } else {
        // Strategy deck: max 2 copies per card, total cap
        const existing = deckCards.find((e) => e.cardId === cardId);
        if (existing && existing.quantity >= 2) return false;
        return totalCards < maxCards;
      }
    },
    [deckCards, deckType, getCardById, levelCount, maxCards, totalCards],
  );

  const addCard = (cardId: string) => {
    if (!canAddCard(cardId)) return;
    setDeckCards((prev) => {
      const existing = prev.find((e) => e.cardId === cardId);
      if (existing) {
        return prev.map((e) => (e.cardId === cardId ? { ...e, quantity: e.quantity + 1 } : e));
      }
      return [...prev, { cardId, quantity: 1 }];
    });
    // Trigger stack animation
    setLastAdded(cardId);
    setTimeout(() => setLastAdded(null), 400);
  };

  const removeCard = (cardId: string) => {
    setDeckCards((prev) => {
      const existing = prev.find((e) => e.cardId === cardId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((e) => e.cardId !== cardId);
      return prev.map((e) => (e.cardId === cardId ? { ...e, quantity: e.quantity - 1 } : e));
    });
    if (crownedId === cardId) setCrownedId(null);
  };

  // Select coronado filter + auto-populate crowned slot
  const selectCoronado = (cr: (typeof CORONADOS)[number]) => {
    setActiveCoronado(cr.id);
    if (cr.id !== "all" && cr.code) {
      setCrownedId(cr.code);
    } else if (cr.id === "all") {
      // Don't clear crowned when going back to "all"
    }
  };

  // Validation
  const levelBreakdown = [1, 2, 3, 4].map((lv) => ({
    lv,
    count: levelCount(lv),
    max: LEVEL_LIMITS[lv],
  }));

  const isValid =
    deckConfig.hasCrowned
      ? totalCards === maxCards && crownedId !== null
      : totalCards === maxCards;

  // ── Pool cards ──────────────────────────────────────────────────────────

  const poolCards = allCards
    .filter((c) => {
      // Pool tab filter
      if (deckType === "combatants") {
        if (poolTab === "combatants") {
          if (c.card_type !== "tropa") return false;
        } else {
          // strategy tab: non-tropa, non-coronado
          if (c.card_type === "tropa" || c.card_type === "coronado") return false;
        }
      } else {
        // Strategy deck: exclude tropas and coronados
        if (c.card_type === "tropa" || c.card_type === "coronado") return false;
      }

      // Coronado filter (only filter tropas by coronado)
      if (activeCoronado !== "all") {
        const coronado = CORONADOS.find((cr) => cr.id === activeCoronado);
        if (coronado?.fullName && c.card_type === "tropa") {
          // All tropas still pass through — no filtering by coronado affiliation
        }
      }

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.code.toLowerCase().includes(q) &&
          !c.category.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aFav = favCodes.has(a.code);
      const bFav = favCodes.has(b.code);
      if (aFav !== bFav) return aFav ? -1 : 1;
      if (a.level !== b.level) return (a.level ?? 99) - (b.level ?? 99);
      return a.name.localeCompare(b.name);
    });

  // ── Deck list grouped by level (for combatants) ──────────────────────────

  const deckGroups =
    deckType === "combatants"
      ? [1, 2, 3, 4].map((lv) => ({
          label: `Nivel ${lv}`,
          limit: LEVEL_LIMITS[lv],
          entries: deckCards.filter((e) => getCardById(e.cardId)?.level === lv),
        })).filter((g) => g.entries.length > 0)
      : null;

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/decks"
            className="flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-surface-50">Nuevo Mazo</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={!isValid || !deckName.trim()}>
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Deck Config */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Input
          label="Nombre del mazo"
          placeholder="Ej: Fuego Agresivo"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-1.5">
            Tipo de mazo
          </label>
          <div className="flex gap-2">
            {DECK_TYPES.map((dt) => (
              <button
                key={dt.id}
                onClick={() => {
                  setDeckType(dt.id);
                  setDeckCards([]);
                  setCrownedId(null);
                  setPoolTab(dt.id === "combatants" ? "combatants" : "strategy");
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left ${
                  deckType === dt.id
                    ? "border-primary-500 bg-primary-600/20 text-primary-300"
                    : "border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200"
                }`}
              >
                {dt.label}
                <span className="block text-xs opacity-70">{dt.description}</span>
                <span className="block text-[10px] opacity-50 mt-0.5">{dt.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-200 mb-1.5">
            Visibilidad
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPublic(true)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                isPublic
                  ? "border-primary-500 bg-primary-600/20 text-primary-300"
                  : "border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200"
              }`}
            >
              <Globe className="h-4 w-4" />
              Público
            </button>
            <button
              onClick={() => setIsPublic(false)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                !isPublic
                  ? "border-primary-500 bg-primary-600/20 text-primary-300"
                  : "border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200"
              }`}
            >
              <Lock className="h-4 w-4" />
              Privado
            </button>
          </div>
          <p className="text-xs text-surface-500 mt-1.5">
            {isPublic ? "Visible en la comunidad y tu perfil" : "Solo vos podés verlo"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card Pool */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary-400" />
                  Pool de Cartas
                </CardTitle>
                {favCodes.size > 0 && (
                  <span className="flex items-center gap-1 text-xs text-rose-400">
                    <Heart className="h-3.5 w-3.5 fill-rose-400" />
                    {favCodes.size} favoritas
                  </span>
                )}
              </div>

              {/* Pool type tabs (visible when building a combatant deck) */}
              {deckType === "combatants" && (
                <div className="flex gap-1 mt-3 p-1 rounded-lg bg-surface-900 w-fit">
                  <button
                    onClick={() => setPoolTab("combatants")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      poolTab === "combatants"
                        ? "bg-surface-700 text-surface-100"
                        : "text-surface-400 hover:text-surface-200"
                    }`}
                  >
                    <Swords className="h-3.5 w-3.5" />
                    Combatientes
                  </button>
                  <button
                    onClick={() => setPoolTab("strategy")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      poolTab === "strategy"
                        ? "bg-surface-700 text-surface-100"
                        : "text-surface-400 hover:text-surface-200"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Estrategia
                  </button>
                </div>
              )}

              {/* Search */}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <Input
                  placeholder="Buscar carta..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Coronado filter */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Coronado
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {CORONADOS.map((cr) => (
                    <button
                      key={cr.id}
                      onClick={() => selectCoronado(cr)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        activeCoronado === cr.id
                          ? "border-accent-500 bg-accent-500/20 text-accent-300"
                          : "border-surface-700 bg-surface-800/50 text-surface-400 hover:text-surface-200"
                      }`}
                    >
                      {cr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level slot indicators (combatant deck only) */}
              {deckType === "combatants" && poolTab === "combatants" && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {levelBreakdown.map(({ lv, count, max }) => (
                    <div
                      key={lv}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${
                        count >= max
                          ? "border-green-500/50 bg-green-500/10 text-green-400"
                          : "border-surface-700 bg-surface-800/50 text-surface-400"
                      }`}
                    >
                      <span className="font-medium">Nv{lv}</span>
                      <span>
                        {count}/{max}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {poolCards.map((card) => {
                  const inDeck  = deckCards.find((e) => e.cardId === card.code);
                  const isFav   = favCodes.has(card.code);
                  const canAdd  = canAddCard(card.code);
                  const imgUrl  = imageMap[card.code] ?? null;
                  const isJustAdded = lastAdded === card.code;
                  return (
                    <button
                      key={card.code}
                      onClick={() => addCard(card.code)}
                      disabled={!canAdd && !inDeck}
                      className={`relative p-2 rounded-lg border text-left transition-all ${
                        inDeck
                          ? "border-primary-500 bg-primary-600/10"
                          : "border-surface-700 bg-surface-800/50 hover:border-surface-600"
                      } disabled:opacity-30`}
                    >
                      {/* Card image */}
                      <div className="aspect-2/3 w-full rounded bg-surface-700 mb-2 relative overflow-hidden flex items-center justify-center">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={card.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            unoptimized
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-surface-400">{card.code}</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-surface-100 truncate">{card.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="default" className="text-[9px]">
                          {card.category}
                        </Badge>
                        {card.level != null && (
                          <span className="text-[10px] text-surface-400">Nv. {card.level}</span>
                        )}
                      </div>
                      {/* Quantity badge */}
                      {inDeck && (
                        <div
                          className={`absolute top-1 right-1 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center ${
                            isJustAdded ? "animate-card-stack" : ""
                          }`}
                        >
                          <span className="text-[10px] font-bold text-white">{inDeck.quantity}</span>
                        </div>
                      )}
                      {isFav && !inDeck && (
                        <Heart className="absolute top-1 left-1 h-3.5 w-3.5 fill-rose-400 text-rose-400 drop-shadow" />
                      )}
                    </button>
                  );
                })}
              </div>
              {poolCards.length === 0 && (
                <p className="text-center text-sm text-surface-400 py-8">
                  Sin resultados. Probá cambiando los filtros.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deck Sidebar */}
        <div className="space-y-4">
          {/* Validation Status */}
          <Card variant={isValid ? "bordered" : "default"}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                )}
                <span className={`text-sm font-semibold ${isValid ? "text-green-400" : "text-amber-400"}`}>
                  {isValid ? "Mazo válido" : "Mazo incompleto"}
                </span>
              </div>
              <div className="flex justify-between text-xs text-surface-400">
                <span>Cartas: {totalCards}/{maxCards}</span>
                {deckConfig.hasCrowned && (
                  <span>Coronado: {crownedId ? "✓" : "Falta"}</span>
                )}
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-700 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isValid ? "bg-green-500" : "bg-primary-500"}`}
                  style={{ width: `${Math.min((totalCards / maxCards) * 100, 100)}%` }}
                />
              </div>
              {/* Per-level breakdown for combatants */}
              {deckType === "combatants" && (
                <div className="mt-3 grid grid-cols-4 gap-1">
                  {levelBreakdown.map(({ lv, count, max }) => (
                    <div key={lv} className="text-center">
                      <div
                        className={`h-1 w-full rounded-full mb-0.5 ${
                          count >= max ? "bg-green-500" : "bg-surface-600"
                        }`}
                      />
                      <span className={`text-[10px] ${count >= max ? "text-green-400" : "text-surface-500"}`}>
                        N{lv} {count}/{max}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crowned Slot */}
          {deckConfig.hasCrowned && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-accent-400" />
                  Coronado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {crownedId ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-accent-500/10 border border-accent-500/30">
                    <div className="flex items-center gap-2">
                      {imageMap[crownedId] && (
                        <div className="relative h-8 w-6 rounded overflow-hidden shrink-0">
                          <Image
                            src={imageMap[crownedId]!}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <span className="text-sm text-accent-300">
                        {getCardById(crownedId)?.name}
                      </span>
                    </div>
                    <button onClick={() => setCrownedId(null)} className="text-surface-400 hover:text-surface-200">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-surface-400 text-center py-3">
                    Seleccioná un Coronado usando el filtro de arriba
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deck List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cartas en el mazo ({totalCards})</CardTitle>
            </CardHeader>
            <CardContent>
              {deckCards.length === 0 ? (
                <div className="text-center py-8">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-surface-600" />
                  <p className="text-sm text-surface-400">
                    Hacé click en las cartas del pool para agregarlas
                  </p>
                </div>
              ) : deckGroups ? (
                /* Combatant deck: grouped by level */
                <div className="space-y-3">
                  {deckGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                        {group.label} ({group.entries.reduce((s, e) => s + e.quantity, 0)}/{group.limit})
                      </p>
                      <div className="space-y-1">
                        {group.entries.map((entry) => {
                          const card = getCardById(entry.cardId);
                          if (!card) return null;
                          const isFav = favCodes.has(entry.cardId);
                          const isAnimating = lastAdded === entry.cardId;
                          return (
                            <div
                              key={entry.cardId}
                              className={`flex items-center gap-2 p-1.5 rounded-lg bg-surface-800/50 group ${
                                isAnimating ? "animate-card-stack" : ""
                              }`}
                            >
                              <span className="text-xs text-surface-400 w-5 text-center font-mono">{entry.quantity}×</span>
                              {isFav && <Heart className="h-3 w-3 fill-rose-400 text-rose-400 shrink-0" />}
                              <span className="flex-1 text-xs text-surface-200 truncate">{card.name}</span>
                              <button
                                onClick={() => removeCard(card.code)}
                                className="text-surface-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Strategy deck: flat list */
                <div className="space-y-1.5">
                  {deckCards.map((entry) => {
                    const card = getCardById(entry.cardId);
                    if (!card) return null;
                    const isFav = favCodes.has(entry.cardId);
                    const isAnimating = lastAdded === entry.cardId;
                    return (
                      <div
                        key={entry.cardId}
                        className={`flex items-center gap-2 p-2 rounded-lg bg-surface-800/50 group ${
                          isAnimating ? "animate-card-stack" : ""
                        }`}
                      >
                        <span className="text-xs text-surface-400 w-5 text-center">{entry.quantity}×</span>
                        {isFav && <Heart className="h-3 w-3 fill-rose-400 text-rose-400 shrink-0" />}
                        <span className="flex-1 text-sm text-surface-200 truncate">{card.name}</span>
                        <Badge variant="default" className="text-[9px] shrink-0">{card.category}</Badge>
                        <button
                          onClick={() => removeCard(card.code)}
                          className="text-surface-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
