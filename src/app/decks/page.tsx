import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Swords, Heart, Copy, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Mazos",
  description: "Explorá mazos de Kingdom TCG creados por la comunidad. Copiá, armá y compartí tus estrategias.",
};

// Placeholder decks
const placeholderDecks = [
  { id: "1", name: "Dragones de Fuego Aggro", type: "combatants", author: "FireMaster", cards: 34, likes: 42, copies: 15, isValid: true },
  { id: "2", name: "Control de Agua Defensivo", type: "strategy", author: "AquaKnight", cards: 30, likes: 38, copies: 22, isValid: true },
  { id: "3", name: "Tierra Midrange", type: "combatants", author: "EarthBender", cards: 34, likes: 29, copies: 8, isValid: true },
  { id: "4", name: "Combo Luz y Oscuridad", type: "strategy", author: "DualForce", cards: 28, likes: 56, copies: 31, isValid: false },
  { id: "5", name: "Aire Tokens Rush", type: "combatants", author: "WindRunner", cards: 34, likes: 19, copies: 5, isValid: true },
  { id: "6", name: "Control Oscuro Full", type: "strategy", author: "DarkLord99", cards: 30, likes: 71, copies: 44, isValid: true },
];

export default function DecksPage() {
  return (
    <PageLayout
      title="Mazos"
      description="Explorá mazos de la comunidad o creá el tuyo"
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="primary" className="cursor-pointer px-3 py-1">Todos</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Combatientes</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Estrategia</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Populares</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Recientes</Badge>
        </div>
        <Link href="/decks/new">
          <Button>
            <Plus className="h-4 w-4" />
            Crear mazo
          </Button>
        </Link>
      </div>

      {/* Decks Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {placeholderDecks.map((deck) => (
          <Link key={deck.id} href={`/decks/${deck.id}`}>
            <Card variant="interactive" className="h-full">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-surface-50 truncate">
                      {deck.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-surface-400">por {deck.author}</span>
                    </div>
                  </div>
                  {deck.isValid ? (
                    <Badge variant="success">Válido</Badge>
                  ) : (
                    <Badge variant="warning">Incompleto</Badge>
                  )}
                </div>

                {/* Card preview area */}
                <div className="relative h-32 bg-surface-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-14 h-20 bg-surface-700 rounded border border-surface-600 flex items-center justify-center"
                      >
                        <Crown className="h-4 w-4 text-surface-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type & stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={deck.type === "combatants" ? "error" : "info"}>
                      <Swords className="h-3 w-3 mr-1" />
                      {deck.type === "combatants" ? "Combatientes" : "Estrategia"}
                    </Badge>
                    <span className="text-xs text-surface-400">{deck.cards} cartas</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {deck.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Copy className="h-3.5 w-3.5" />
                      {deck.copies}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty state for "Create your first deck" */}
      <div className="mt-12 text-center py-12 bg-surface-900 border border-surface-800 rounded-xl">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4">
          <Swords className="h-8 w-8 text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-surface-100 mb-2">
          ¿Tenés una estrategia en mente?
        </h3>
        <p className="text-surface-400 mb-6 max-w-md mx-auto">
          Usá nuestro deck builder con validación automática de reglas,
          detección de cartas faltantes y sugerencias inteligentes.
        </p>
        <Link href="/decks/new">
          <Button>
            <Plus className="h-4 w-4" />
            Crear mi primer mazo
          </Button>
        </Link>
      </div>
    </PageLayout>
  );
}
