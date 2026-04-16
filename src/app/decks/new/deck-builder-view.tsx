"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  MessageSquare,
} from "lucide-react";
import { allCards } from "@/data/cards";
import { getFavorites } from "@/lib/actions/profile";
import { createDeckFromBuilder } from "@/lib/actions/decks";
import { publishDeckToForum } from "@/lib/actions/trading";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CoronadoId = (typeof CORONADOS)[number]["id"];

interface DeckEntry {
  cardId: string;
  quantity: number;
}

interface Props {
  /** code → primary image_url from TiendaNube */
  imageMap: Record<string, string | null>;
  /** code → all image URLs (for multi-version cards) */
  allImagesMap: Record<string, string[]>;
  /** code → quantity owned (empty = not logged in, show all) */
  albumMap: Record<string, number>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DeckBuilderView({ imageMap, allImagesMap, albumMap }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [deckName,       setDeckName]       = useState("");
  const [deckType,       setDeckType]       = useState<DeckType>("combatants");
  const [isPublic,       setIsPublic]       = useState(true);
  const [search,         setSearch]         = useState("");
  const [deckCards,      setDeckCards]      = useState<DeckEntry[]>([]);
  const [crownedId,      setCrownedId]      = useState<string | null>(null);
  const [crownedFinish,  setCrownedFinish]  = useState<string | null>(null);
  const [favCodes,       setFavCodes]       = useState<Set<string>>(new Set());
  const [poolTab,        setPoolTab]        = useState<"combatants" | "strategy">("combatants");
  const [lastAdded,      setLastAdded]      = useState<string | null>(null);
  const [savedDeckId,    setSavedDeckId]    = useState<string | null>(null);
  const [saveError,      setSaveError]      = useState<string | null>(null);
  const [publishing,     setPublishing]     = useState(false);

  // Whether we have a real album to filter by
  const hasAlbum = Object.keys(albumMap).length > 0;

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

  // Each "pool item" represents one displayable version of a card.
  // Cards with multiple images (Arte 1, Arte 2, ...) appear side-by-side.
  interface PoolItem {
    card: (typeof allCards)[number];
    imageUrl: string | null;
    versionIndex: number; // 0 = primary art, 1 = Arte 2, etc.
    versionLabel: string; // "Arte 1", "Arte 2", etc.
  }

  const poolItems: PoolItem[] = allCards
    .filter((c) => {
      // Pool tab filter
      if (deckType === "combatants") {
        if (poolTab === "combatants") {
          if (c.card_type !== "tropa") return false;
        } else {
          if (c.card_type === "tropa" || c.card_type === "coronado") return false;
        }
      } else {
        if (c.card_type === "tropa" || c.card_type === "coronado") return false;
      }

      // Only show owned cards if album is loaded
      if (hasAlbum && !albumMap[c.code]) return false;

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
    })
    .flatMap((card) => {
      const images = allImagesMap[card.code] ?? [];
      if (images.length <= 1) {
        return [{ card, imageUrl: imageMap[card.code] ?? null, versionIndex: 0, versionLabel: "Arte 1" }];
      }
      // Multiple images → one item per image, placed adjacent
      return images.map((imgUrl, idx) => ({
        card,
        imageUrl: imgUrl,
        versionIndex: idx,
        versionLabel: idx === 0 ? "Arte 1" : `Arte ${idx + 1}`,
      }));
    });

  // Legacy poolCards alias kept for deck-list / level breakdown (same unique cards)

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
    <PageLayout showAds={false}>
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
          <Button
            variant="secondary"
            size="sm"
            disabled={!deckName.trim() || totalCards === 0 || isPending}
            onClick={() => {
              setSaveError(null);
              startTransition(async () => {
                const res = await createDeckFromBuilder({
                  name: deckName,
                  deckType,
                  isPublic,
                  crownedCode: crownedId,
                  cards: deckCards,
                });
                if (res.error) { setSaveError(res.error); return; }
                setSavedDeckId(res.id ?? null);
              });
            }}
          >
            <Save className="h-4 w-4" />
            {isPending ? "Guardando..." : savedDeckId ? "Guardado ✓" : "Guardar"}
          </Button>
          {savedDeckId && (
            <Button
              size="sm"
              disabled={publishing}
              onClick={() => {
                setPublishing(true);
                startTransition(async () => {
                  await publishDeckToForum({
                    deckId: savedDeckId,
                    deckName,
                    deckType,
                  });
                  setPublishing(false);
                  router.push("/forum?tab=general");
                });
              }}
            >
              <MessageSquare className="h-4 w-4" />
              {publishing ? "Publicando..." : "Publicar en comunidad"}
            </Button>
          )}
          {saveError && (
            <span className="text-xs text-red-400 flex items-center gap-1 self-center">
              <AlertCircle className="h-3.5 w-3.5" /> {saveError}
            </span>
          )}
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
              {hasAlbum && poolItems.length === 0 && (
                <p className="text-center text-sm text-surface-400 py-8">
                  No tenés cartas de este tipo en tu colección. Agregá cartas en{" "}
                  <Link href="/album" className="text-primary-400 underline">tu álbum</Link>.
                </p>
              )}
              {!hasAlbum && (
                <p className="text-center text-sm text-amber-400 py-2 mb-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  Iniciá sesión y completá tu álbum para ver solo las cartas que tenés.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {poolItems.map((item) => {
                  const { card, imageUrl, versionIndex, versionLabel } = item;
                  const inDeck  = deckCards.find((e) => e.cardId === card.code);
                  const isFav   = favCodes.has(card.code);
                  const canAdd  = canAddCard(card.code);
                  const isJustAdded = lastAdded === card.code;
                  const multiVersion = (allImagesMap[card.code]?.length ?? 0) > 1;
                  return (
                    <button
                      key={`${card.code}-v${versionIndex}`}
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
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={card.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            unoptimized
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-surface-400">{card.code}</span>
                        )}
                        {multiVersion && (
                          <span className="absolute bottom-0.5 left-0.5 bg-surface-900/80 text-surface-300 text-[7px] px-1 rounded leading-tight">
                            {versionLabel}
                          </span>
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
              {poolItems.length === 0 && hasAlbum && (
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
              <CardContent className="space-y-3">
                {/* Coronado picker */}
                <div className="flex gap-1.5 flex-wrap">
                  {CORONADOS.filter((cr) => cr.id !== "all").map((cr) => (
                    <button
                      key={cr.id}
                      onClick={() => {
                        setCrownedId(cr.code ?? null);
                        setCrownedFinish(null);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        crownedId === cr.code
                          ? "border-accent-500 bg-accent-500/20 text-accent-300"
                          : "border-surface-700 bg-surface-800/50 text-surface-400 hover:text-surface-200"
                      }`}
                    >
                      {cr.label}
                    </button>
                  ))}
                  {crownedId && (
                    <button
                      onClick={() => { setCrownedId(null); setCrownedFinish(null); }}
                      className="px-2 py-1 rounded-full text-xs border border-surface-700 text-surface-500 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Selected coronado preview + finish */}
                {crownedId && (() => {
                  const coronadoCard = getCardById(crownedId);
                  const finishes = coronadoCard?.finishes ?? [];
                  const primaryImg = imageMap[crownedId];
                  const allImgs = allImagesMap[crownedId] ?? [];
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-accent-500/10 border border-accent-500/30">
                        {primaryImg && (
                          <div className="relative h-10 w-7 rounded overflow-hidden shrink-0">
                            <Image src={primaryImg} alt="" fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-accent-300 truncate">{coronadoCard?.name}</p>
                          {crownedFinish && (
                            <p className="text-[10px] text-surface-400">{crownedFinish}</p>
                          )}
                        </div>
                      </div>

                      {/* Finish selector */}
                      {finishes.length > 0 && (
                        <div>
                          <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1.5 font-semibold">Versión / Acabado</p>
                          <div className="flex gap-1 flex-wrap">
                            {finishes.map((finish, idx) => {
                              const finishImg = allImgs[idx] ?? primaryImg;
                              return (
                                <button
                                  key={finish}
                                  onClick={() => setCrownedFinish(crownedFinish === finish ? null : finish)}
                                  title={finish}
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition-all ${
                                    crownedFinish === finish
                                      ? "border-accent-400 bg-accent-500/20 text-accent-300"
                                      : "border-surface-700 bg-surface-800/50 text-surface-400 hover:text-surface-200"
                                  }`}
                                >
                                  {finishImg && (
                                    <div className="relative h-4 w-3 rounded overflow-hidden shrink-0">
                                      <Image src={finishImg} alt="" fill className="object-cover" unoptimized />
                                    </div>
                                  )}
                                  {finish}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {!crownedId && (
                  <p className="text-xs text-surface-400 text-center py-2">
                    Seleccioná un Coronado
                  </p>
                )}
              </CardContent>
            </Card>
          )}


          {/* Card Stack Visual */}
          {deckCards.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-surface-400 mb-3 font-medium">Vista del mazo</p>
                {/* Stacked card images */}
                <div className="relative h-28 flex items-end justify-center mb-2">
                  {(() => {
                    // Flatten entries into individual cards (respecting quantity) up to 12 visible
                    const flat: string[] = [];
                    for (const entry of deckCards) {
                      for (let i = 0; i < entry.quantity && flat.length < 12; i++) {
                        flat.push(entry.cardId);
                      }
                    }
                    const visible = flat.slice(0, 12);
                    return visible.map((cid, idx) => {
                      const img = imageMap[cid];
                      const isTop = idx === visible.length - 1;
                      const isNew = isTop && lastAdded === cid;
                      const offset = idx * 3; // px offset per card
                      return (
                        <div
                          key={`${cid}-${idx}`}
                          className={`absolute rounded-md overflow-hidden shadow-md border border-surface-700 transition-all duration-300 ${
                            isNew ? "animate-card-stack" : ""
                          }`}
                          style={{
                            width: 52,
                            height: 74,
                            bottom: offset,
                            left: `calc(50% - 26px)`,
                            zIndex: idx + 1,
                            transform: `rotate(${(idx % 3 === 0 ? -1 : idx % 3 === 1 ? 0 : 1) * 1.5}deg)`,
                          }}
                        >
                          {img ? (
                            <Image
                              src={img}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-surface-800 flex items-center justify-center">
                              <Layers className="h-5 w-5 text-surface-600" />
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
                <p className="text-center text-[10px] text-surface-500 mt-1">
                  {totalCards} carta{totalCards !== 1 ? "s" : ""} · {deckCards.length} tipo{deckCards.length !== 1 ? "s" : ""}
                </p>
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
                          const imgUrl = imageMap[entry.cardId];
                          const isFav = favCodes.has(entry.cardId);
                          const isAnimating = lastAdded === entry.cardId;
                          return (
                            <div
                              key={entry.cardId}
                              className={`flex items-center gap-2 p-1.5 rounded-lg bg-surface-800/50 group ${
                                isAnimating ? "animate-card-stack" : ""
                              }`}
                            >
                              {imgUrl ? (
                                <div className="relative h-8 w-5 rounded overflow-hidden shrink-0">
                                  <Image src={imgUrl} alt="" fill className="object-cover" unoptimized />
                                </div>
                              ) : (
                                <span className="text-xs text-surface-400 w-5 text-center font-mono shrink-0">{entry.quantity}×</span>
                              )}
                              {imgUrl && <span className="text-[10px] text-surface-400 font-mono shrink-0">{entry.quantity}×</span>}
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
                    const imgUrl = imageMap[entry.cardId];
                    const isFav = favCodes.has(entry.cardId);
                    const isAnimating = lastAdded === entry.cardId;
                    return (
                      <div
                        key={entry.cardId}
                        className={`flex items-center gap-2 p-1.5 rounded-lg bg-surface-800/50 group ${
                          isAnimating ? "animate-card-stack" : ""
                        }`}
                      >
                        {imgUrl ? (
                          <div className="relative h-8 w-5 rounded overflow-hidden shrink-0">
                            <Image src={imgUrl} alt="" fill className="object-cover" unoptimized />
                          </div>
                        ) : null}
                        <span className="text-[10px] text-surface-400 font-mono shrink-0">{entry.quantity}×</span>
                        {isFav && <Heart className="h-3 w-3 fill-rose-400 text-rose-400 shrink-0" />}
                        <span className="flex-1 text-xs text-surface-200 truncate">{card.name}</span>
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
