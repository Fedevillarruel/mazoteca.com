"use client";

import { useState } from "react";
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
} from "lucide-react";

const DECK_TYPES = [
  { id: "combatants", label: "Combatientes", max: 33, hasCrowned: true, description: "33 cartas + 1 coronado" },
  { id: "strategy", label: "Estrategia", max: 30, hasCrowned: false, description: "30 cartas exactas" },
] as const;

type DeckType = (typeof DECK_TYPES)[number]["id"];

const placeholderPool = Array.from({ length: 20 }, (_, i) => ({
  id: `pool-${i}`,
  name: `Carta ${i + 1}`,
  number: String(i + 1).padStart(3, "0"),
  rarity: (["common", "rare", "epic", "legendary", "mythic"] as const)[i % 5],
  type: i % 3 === 0 ? "combatant" : i % 3 === 1 ? "strategy" : "crowned",
  cost: (i % 6) + 1,
}));

interface DeckEntry {
  cardId: string;
  quantity: number;
}

export default function DeckBuilderPage() {
  const [deckName, setDeckName] = useState("");
  const [deckType, setDeckType] = useState<DeckType>("combatants");
  const [isPublic, setIsPublic] = useState(true);
  const [search, setSearch] = useState("");
  const [deckCards, setDeckCards] = useState<DeckEntry[]>([]);
  const [crownedId, setCrownedId] = useState<string | null>(null);

  const deckConfig = DECK_TYPES.find((t) => t.id === deckType)!;
  const totalCards = deckCards.reduce((sum, e) => sum + e.quantity, 0);
  const maxCards = deckConfig.max;
  const isValid = deckConfig.hasCrowned
    ? totalCards === maxCards && crownedId !== null
    : totalCards === maxCards;

  const addCard = (cardId: string) => {
    setDeckCards((prev) => {
      const existing = prev.find((e) => e.cardId === cardId);
      if (existing) {
        if (existing.quantity >= 3) return prev;
        return prev.map((e) => (e.cardId === cardId ? { ...e, quantity: e.quantity + 1 } : e));
      }
      return [...prev, { cardId, quantity: 1 }];
    });
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

  const getCardById = (id: string) => placeholderPool.find((c) => c.id === id);

  return (
    <PageLayout>
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
          <Button variant="secondary" size="sm" disabled={!isValid}>
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
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  deckType === dt.id
                    ? "border-primary-500 bg-primary-600/20 text-primary-300"
                    : "border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200"
                }`}
              >
                {dt.label}
                <span className="block text-xs opacity-70">{dt.description}</span>
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
            {isPublic
              ? "Visible para todos y tus amigos"
              : "Solo vos podés verlo"}
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
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <Input
                  placeholder="Buscar carta..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {placeholderPool
                  .filter((c) =>
                    search ? c.name.toLowerCase().includes(search.toLowerCase()) : true
                  )
                  .map((card) => {
                    const inDeck = deckCards.find((e) => e.cardId === card.id);
                    return (
                      <button
                        key={card.id}
                        onClick={() => addCard(card.id)}
                        disabled={totalCards >= maxCards && !inDeck}
                        className={`relative p-3 rounded-lg border text-left transition-all ${
                          inDeck
                            ? "border-primary-500 bg-primary-600/10"
                            : "border-surface-700 bg-surface-800/50 hover:border-surface-600"
                        } disabled:opacity-30`}
                      >
                        <div className="h-16 w-full rounded bg-surface-700 mb-2 relative overflow-hidden">
                          <Image
                            src="/placeholder-card.webp"
                            alt={card.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="text-xs font-medium text-surface-100 truncate">{card.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge
                            variant={
                              card.rarity === "mythic"
                                ? "mythic"
                                : card.rarity === "legendary"
                                  ? "legendary"
                                  : card.rarity === "epic"
                                    ? "epic"
                                    : card.rarity === "rare"
                                      ? "rare"
                                      : "common"
                            }
                            className="text-[9px]"
                          >
                            {card.rarity}
                          </Badge>
                          <span className="text-[10px] text-surface-400">Costo: {card.cost}</span>
                        </div>
                        {inDeck && (
                          <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {inDeck.quantity}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
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
                <span
                  className={`text-sm font-semibold ${isValid ? "text-green-400" : "text-amber-400"}`}
                >
                  {isValid ? "Mazo válido" : "Mazo incompleto"}
                </span>
              </div>
              <div className="flex justify-between text-xs text-surface-400">
                <span>Cartas: {totalCards}/{maxCards}</span>
                {deckConfig.hasCrowned && (
                  <span>
                    Coronado: {crownedId ? "✓" : "Falta"}
                  </span>
                )}
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-700 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isValid ? "bg-green-500" : "bg-primary-500"
                  }`}
                  style={{ width: `${Math.min((totalCards / maxCards) * 100, 100)}%` }}
                />
              </div>
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
                    <span className="text-sm text-accent-300">
                      {getCardById(crownedId)?.name}
                    </span>
                    <button
                      onClick={() => setCrownedId(null)}
                      className="text-surface-400 hover:text-surface-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-surface-400 text-center py-3">
                    Arrastrá una carta aquí o hacé click en &ldquo;Coronar&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deck List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Cartas en el mazo ({totalCards})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deckCards.length === 0 ? (
                <div className="text-center py-8">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-surface-600" />
                  <p className="text-sm text-surface-400">
                    Hacé click en las cartas del pool para agregarlas
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {deckCards.map((entry) => {
                    const card = getCardById(entry.cardId);
                    if (!card) return null;
                    return (
                      <div
                        key={entry.cardId}
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/50 group"
                      >
                        <span className="text-xs text-surface-400 w-5 text-center">
                          {entry.quantity}x
                        </span>
                        <span className="flex-1 text-sm text-surface-200 truncate">
                          {card.name}
                        </span>
                        {deckConfig.hasCrowned && crownedId !== card.id && (
                          <button
                            onClick={() => setCrownedId(card.id)}
                            className="text-accent-500/50 hover:text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Coronar"
                          >
                            <Crown className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {crownedId === card.id && (
                          <Crown className="h-3.5 w-3.5 text-accent-400" />
                        )}
                        <button
                          onClick={() => removeCard(card.id)}
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
