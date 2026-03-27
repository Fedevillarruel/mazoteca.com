"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Crown,
  Heart,
  Copy,
  Share2,
  CheckCircle,
  Layers,
  Swords,
  ExternalLink,
  BookPlus,
  CheckCheck,
  Plus,
} from "lucide-react";
import { getCardByCode } from "@/data/cards";
import type { KTCGCard } from "@/data/cards";

// ─── Official Decks Data ──────────────────────────────────────────────────────

const officialDecks = [
  {
    id: "viggo-de-fahridor",
    name: "Viggo de Fahridor™",
    type: "combatants" as const,
    coronado: "Viggo de Fahridor",
    coronadoCode: "KC001",
    description:
      "Mazo ofensivo: golpeá primero y arrasá con el campo de batalla. Viggo lidera tropas agresivas de Fahridor con el apoyo de estrategias de bajo costo.",
    imageUrl:
      "https://kingdom-tcg.com/productos/mazos-de-batalla/mazo-de-batalla-viggo-de-fahridor.webp",
    url: "https://kingdom-tcg.com/productos/mazos-de-batalla/viggo-de-fahridor",
    edition: "Viggo & Nemea",
    cardCodes: [
      "KC001","KT001","KT002","KT009","KT011","KT016","KT019","KT024","KT025","KT027",
      "KR001","KR003","KR004","KR007","KA002","KA003","KA005",
      "KE001","KE002","KE003","KE004","KE005","KE006","KE007","KE008","KE009",
      "KE010","KE011","KE012","KE013","KE014","KE015","KE017","KE018",
    ],
  },
  {
    id: "nemea-de-goldinfeit",
    name: "Nemea de Goldinfeit™",
    type: "strategy" as const,
    coronado: "Nemea de Goldinfeit",
    coronadoCode: "KC002",
    description:
      "Mazo defensivo: resistí cualquier ataque y asegurá la victoria. Nemea lleva la defensa de Goldinfeit con templarios y clérigos que sostienen el campo.",
    imageUrl:
      "https://kingdom-tcg.com/productos/mazos-de-batalla/mazo-de-batalla-nemea-de-goldinfeit.webp",
    url: "https://kingdom-tcg.com/productos/mazos-de-batalla/nemea-de-goldinfeit",
    edition: "Viggo & Nemea",
    cardCodes: [
      "KC002","KT001","KT003","KT010","KT012","KT017","KT020","KT023","KT026","KT028",
      "KR008","KR009","KR011","KR012","KA001","KA003","KA004",
      "KE001","KE002","KE003","KE004","KE005","KE006","KE007","KE008","KE009",
      "KE010","KE013","KE014","KE015","KE016","KE017","KE018",
    ],
  },
  {
    id: "igno-de-estonbleiz",
    name: "Igno de Estonbleiz™",
    type: "combatants" as const,
    coronado: "Igno de Estonbleiz",
    coronadoCode: "KC003",
    description:
      "Mazo de sacrificio y destrucción. Comanda la furia del Magmápyro con tropas de fuego y estrategias de eliminación masiva.",
    imageUrl:
      "https://kingdom-tcg.com/productos/mazos-de-batalla/mazo-de-batalla-igno-de-estonbleiz.webp",
    url: "https://kingdom-tcg.com/productos/mazos-de-batalla/igno-de-estonbleiz",
    edition: "Igno & Erya",
    cardCodes: [
      "KC003","KT033","KT063","KT057","KT064","KT065","KT058","KT043","KT040","KT013",
      "KT070","KT071","KT061","KT059","KT022","KT074","KT027","KT060","KT077",
      "KR028","KR025","KR019","KR026","KA004","KA015","KA016",
      "KE042","KE043","KE044","KE033","KE011","KE020","KE041","KE045","KE046","KE047",
      "KE001","KE002","KE009","KE014","KE048",
    ],
  },
  {
    id: "erya-de-gringud",
    name: "Erya de Gringud™",
    type: "combatants" as const,
    coronado: "Erya de Gringud",
    coronadoCode: "KC004",
    description:
      "Convocá manadas, camuflá tus tropas y desatá la furia salvaje de Gringud. Erya lidera bestias y guerreros del bosque con estrategias de emboscada.",
    imageUrl:
      "https://kingdom-tcg.com/productos/mazos-de-batalla/mazo-de-batalla-erya-de-gringud.webp",
    url: "https://kingdom-tcg.com/productos/mazos-de-batalla/erya-de-gringud",
    edition: "Igno & Erya",
    cardCodes: [
      "KC004","KT033","KT066","KT067","KT068","KT069","KT039","KT043","KT040","KT008",
      "KT072","KT073","KT045","KT062","KT075","KT076","KT026","KT078","KT079",
      "KR035","KR034","KR031","KR029","KA009","KA017","KA018",
      "KE041","KE049","KE050","KE020","KE033","KE051","KE044","KE037","KE045","KE052",
      "KE008","KE014","KE047","KE001","KE002",
    ],
  },
];

// ─── Category helpers ─────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  Coronados: "text-accent-400",
  Tropas: "text-primary-400",
  Realeza: "text-purple-400",
  Estrategia: "text-blue-400",
  "Estrategia Primigenia": "text-emerald-400",
  Arroje: "text-orange-400",
};

const categoryOrder = [
  "Coronados",
  "Tropas",
  "Realeza",
  "Estrategia",
  "Estrategia Primigenia",
  "Arroje",
];

// ─── Card row ─────────────────────────────────────────────────────────────────

function CardRow({
  card,
  added,
  onAdd,
}: {
  card: KTCGCard;
  added: boolean;
  onAdd: (code: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-800/50 transition-colors group">
      <div className="h-9 w-7 rounded bg-surface-700 shrink-0 flex items-center justify-center">
        <span className="text-[8px] text-surface-500 font-mono leading-tight text-center px-0.5">
          {card.code}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/catalog/${card.slug}`}
          className="text-sm text-surface-200 hover:text-primary-300 transition-colors font-medium line-clamp-1"
        >
          {card.name}
        </Link>
        <p className={`text-[10px] ${categoryColors[card.category] ?? "text-surface-500"}`}>
          {card.category}
          {card.level ? ` · Nivel ${card.level}` : ""}
          {card.cost != null ? ` · Costo ${card.cost}` : ""}
        </p>
      </div>
      <button
        onClick={() => onAdd(card.code)}
        title={added ? "Ya en tu colección" : "Agregar a mi colección"}
        className={`shrink-0 flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-all
          ${added
            ? "bg-emerald-500/20 text-emerald-400 cursor-default"
            : "bg-surface-700 text-surface-300 hover:bg-primary-500/20 hover:text-primary-300 opacity-0 group-hover:opacity-100"
          }`}
      >
        {added ? (
          <><CheckCheck className="h-3 w-3" /><span>Agregada</span></>
        ) : (
          <><Plus className="h-3 w-3" /><span>Colección</span></>
        )}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const officialDeck = officialDecks.find((d) => d.id === id);

  const [addedCodes, setAddedCodes] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  function handleAddCard(code: string) {
    setAddedCodes((prev) => new Set(prev).add(code));
    // TODO: server action physical_inventory / digital_inventory
  }

  async function handleAddAll() {
    if (!officialDeck) return;
    setBulkLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setAddedCodes(new Set(officialDeck.cardCodes));
    setBulkLoading(false);
  }

  // ── Official Deck ───────────────────────────────────────────────────────────
  if (officialDeck) {
    const resolvedCards = officialDeck.cardCodes
      .map((code) => getCardByCode(code))
      .filter((c): c is KTCGCard => c !== undefined);

    const coronadoCard = getCardByCode(officialDeck.coronadoCode);

    const grouped: Record<string, KTCGCard[]> = {};
    for (const cat of categoryOrder) grouped[cat] = [];
    for (const card of resolvedCards) {
      if (!grouped[card.category]) grouped[card.category] = [];
      grouped[card.category].push(card);
    }

    const totalAdded = addedCodes.size;
    const totalCards = resolvedCards.length;

    return (
      <PageLayout>
        <Link
          href="/decks"
          className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mazos
        </Link>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-surface-900 border border-surface-800">
          <div className="relative h-48 sm:h-64">
            <Image
              src={officialDeck.imageUrl}
              alt={officialDeck.name}
              fill
              className="object-cover object-top"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-t from-surface-950 via-surface-950/60 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="accent" className="text-[10px]">Oficial</Badge>
              <Badge variant={officialDeck.type === "combatants" ? "error" : "info"} className="text-[10px]">
                <Swords className="h-2.5 w-2.5 mr-1" />
                {officialDeck.type === "combatants" ? "Ofensivo" : "Defensivo"}
              </Badge>
              <Badge variant="default" className="text-[10px]">{officialDeck.edition}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-50 mb-1">
              {officialDeck.name}
            </h1>
            <p className="text-sm text-surface-300 max-w-xl">{officialDeck.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-400">{totalCards} cartas únicas</span>
            {totalAdded > 0 && (
              <span className="text-sm text-emerald-400 font-medium">
                {totalAdded}/{totalCards} en tu colección
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddAll}
              disabled={bulkLoading || totalAdded === totalCards}
            >
              {bulkLoading ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
              ) : totalAdded === totalCards ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <BookPlus className="h-3.5 w-3.5" />
              )}
              {totalAdded === totalCards ? "Todo agregado" : "Agregar todo al álbum"}
            </Button>
            <a href={officialDeck.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3.5 w-3.5" />
                Ver en Kingdom TCG
              </Button>
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Card list */}
          <div className="lg:col-span-2 space-y-4">

            {/* Coronado destacado */}
            {coronadoCard && (
              <Card className="border-accent-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-accent-400 shrink-0" />
                      <div className="h-12 w-9 rounded bg-surface-700 shrink-0 flex items-center justify-center">
                        <span className="text-[8px] text-surface-500 font-mono text-center px-0.5">
                          {coronadoCard.code}
                        </span>
                      </div>
                      <div>
                        <Link
                          href={`/catalog/${coronadoCard.slug}`}
                          className="text-sm font-semibold text-accent-300 hover:text-accent-200 transition-colors"
                        >
                          {coronadoCard.name}
                        </Link>
                        <p className="text-xs text-surface-400">Coronado · {officialDeck.edition}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddCard(coronadoCard.code)}
                      className={`flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded transition-all
                        ${addedCodes.has(coronadoCard.code)
                          ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                          : "bg-surface-700 text-surface-300 hover:bg-primary-500/20 hover:text-primary-300"
                        }`}
                    >
                      {addedCodes.has(coronadoCard.code) ? (
                        <><CheckCheck className="h-3 w-3" /><span>Agregada</span></>
                      ) : (
                        <><Plus className="h-3 w-3" /><span>Colección</span></>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Por categoría */}
            {categoryOrder.map((cat) => {
              const cards = grouped[cat];
              if (!cards || cards.length === 0) return null;
              const allCatAdded = cards.every((c) => addedCodes.has(c.code));
              return (
                <Card key={cat}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className={`flex items-center gap-2 ${categoryColors[cat] ?? "text-surface-200"}`}>
                        <Layers className="h-4 w-4" />
                        {cat}
                        <span className="text-surface-500 font-normal text-xs">({cards.length})</span>
                      </span>
                      <button
                        onClick={() => cards.forEach((c) => handleAddCard(c.code))}
                        disabled={allCatAdded}
                        className={`text-[10px] px-2 py-1 rounded transition-all
                          ${allCatAdded
                            ? "text-emerald-400 cursor-default"
                            : "text-surface-400 hover:text-primary-300 hover:bg-primary-500/10"
                          }`}
                      >
                        {allCatAdded ? "✓ Todas agregadas" : "+ Agregar sección"}
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="divide-y divide-surface-800/50">
                      {cards.map((card) => (
                        <CardRow
                          key={card.code}
                          card={card}
                          added={addedCodes.has(card.code)}
                          onAdd={handleAddCard}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progreso */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Mi progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-surface-50">{totalAdded}</span>
                  <span className="text-surface-400 text-sm mb-1">/ {totalCards}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-800 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.round((totalAdded / totalCards) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-surface-400">
                  {totalAdded === 0
                    ? "Hacé clic en + Colección para registrar tus cartas"
                    : totalAdded === totalCards
                    ? "🎉 ¡Tenés el mazo completo!"
                    : `Te faltan ${totalCards - totalAdded} cartas de este mazo`}
                </p>
              </CardContent>
            </Card>

            {/* Composición */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Composición del mazo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryOrder.map((cat) => {
                  const count = grouped[cat]?.length ?? 0;
                  if (count === 0) return null;
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${categoryColors[cat]?.replace("text-", "bg-") ?? "bg-surface-500"}`} />
                      <span className="text-xs text-surface-300 flex-1">{cat}</span>
                      <span className="text-xs text-surface-400 tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Accesos rápidos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Accesos rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/collection" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-start text-xs">
                    <CheckCheck className="h-3.5 w-3.5" />
                    Ver mi colección
                  </Button>
                </Link>
                <Link href="/album" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-start text-xs">
                    <BookPlus className="h-3.5 w-3.5" />
                    Abrir mi álbum
                  </Button>
                </Link>
                <Link href="/singles" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-start text-xs">
                    <Heart className="h-3.5 w-3.5" />
                    Conseguir en Singles
                  </Button>
                </Link>
                <a href={officialDeck.url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Comprar mazo oficial
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── Community Deck (placeholder) ───────────────────────────────────────────
  return (
    <PageLayout>
      <Link
        href="/decks"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mazos
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">
              <CheckCircle className="h-3 w-3" />
              Válido
            </Badge>
            <Badge variant="default">Combatientes</Badge>
          </div>
          <h1 className="text-3xl font-bold text-surface-50 mb-1">Mazo #{id}</h1>
          <p className="text-sm text-surface-400">Mazo de la comunidad</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Heart className="h-4 w-4" />
            12
          </Button>
          <Button variant="ghost" size="sm">
            <Copy className="h-4 w-4" />
            Copiar
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-center py-16 text-surface-400">
        <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>Este mazo de comunidad estará disponible próximamente.</p>
      </div>
    </PageLayout>
  );
}
