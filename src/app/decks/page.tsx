import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Swords } from "lucide-react";

export const metadata: Metadata = {
  title: "Mazos",
  description: "Explorá mazos de Kingdom TCG creados por la comunidad. Copiá, armá y compartí tus estrategias.",
};

// Mazos oficiales de batalla
const officialDecks = [
  {
    id: "viggo-de-fahridor",
    name: "Viggo de Fahridor™",
    type: "combatants",
    author: "Kingdom TCG Oficial",
    cards: 64,
    likes: 0,
    copies: 0,
    isValid: true,
    official: true,
    coronado: "Viggo de Fahridor",
    description: "Mazo ofensivo: golpeá primero y arrasá con el campo de batalla.",
    imageUrl: "https://kingdom-tcg.com/productos/mazos-de-batalla/mazo-de-batalla-viggo-de-fahridor.webp",
    url: "https://kingdom-tcg.com/productos/mazos-de-batalla/viggo-de-fahridor",
    edition: "Viggo & Nemea",
    cardCodes: ["KC001","KT001","KT002","KT009","KT011","KT016","KT019","KT024","KT025","KT027","KR001","KR003","KR004","KR007","KA002","KA003","KA005","KE001","KE002","KE003","KE004","KE005","KE006","KE007","KE008","KE009","KE010","KE011","KE012","KE013","KE014","KE015","KE017","KE018"],
  },
  {
    id: "nemea-de-goldinfeit",
    name: "Nemea de Goldinfeit™",
    type: "strategy",
    author: "Kingdom TCG Oficial",
    cards: 64,
    likes: 0,
    copies: 0,
    isValid: true,
    official: true,
    coronado: "Nemea de Goldinfeit",
    description: "Mazo defensivo: resistí cualquier ataque y asegurá la victoria.",
    imageUrl: "https://kingdom-tcg.com/productos/mazos-de-batalla/mazo-de-batalla-nemea-de-goldinfeit.webp",
    url: "https://kingdom-tcg.com/productos/mazos-de-batalla/nemea-de-goldinfeit",
    edition: "Viggo & Nemea",
    cardCodes: ["KC002","KT001","KT003","KT010","KT012","KT017","KT020","KT023","KT026","KT028","KR008","KR009","KR011","KR012","KA001","KA003","KA004","KE001","KE002","KE003","KE004","KE005","KE006","KE007","KE008","KE009","KE010","KE013","KE014","KE015","KE016","KE017","KE018"],
  },
  {
    id: "igno-de-estonbleiz",
    name: "Igno de Estonbleiz™",
    type: "combatants",
    author: "Kingdom TCG Oficial",
    cards: 64,
    likes: 0,
    copies: 0,
    isValid: true,
    official: true,
    coronado: "Igno de Estonbleiz",
    description: "Mazo de sacrificio y destrucción. Comanda la furia del Magmápyro.",
    imageUrl: "https://kingdom-tcg.com/productos/mazos-de-batalla/mazo-de-batalla-igno-de-estonbleiz.webp",
    url: "https://kingdom-tcg.com/productos/mazos-de-batalla/igno-de-estonbleiz",
    edition: "Igno & Erya",
    cardCodes: ["KC003","KT033","KT063","KT057","KT064","KT065","KT058","KT043","KT040","KT013","KT070","KT071","KT061","KT059","KT022","KT074","KT027","KT060","KT077","KR028","KR025","KR019","KR026","KA004","KA015","KA016","KE042","KE043","KE044","KE033","KE011","KE020","KE041","KE045","KE046","KE047","KE001","KE002","KE009","KE014","KE048"],
  },
  {
    id: "erya-de-gringud",
    name: "Erya de Gringud™",
    type: "combatants",
    author: "Kingdom TCG Oficial",
    cards: 64,
    likes: 0,
    copies: 0,
    isValid: true,
    official: true,
    coronado: "Erya de Gringud",
    description: "Convocá manadas, camuflá tus tropas y desatá la furia salvaje de Gringud.",
    imageUrl: "https://kingdom-tcg.com/productos/mazos-de-batalla/mazo-de-batalla-erya-de-gringud.webp",
    url: "https://kingdom-tcg.com/productos/mazos-de-batalla/erya-de-gringud",
    edition: "Igno & Erya",
    cardCodes: ["KC004","KT033","KT066","KT067","KT068","KT069","KT039","KT043","KT040","KT008","KT072","KT073","KT045","KT062","KT075","KT076","KT026","KT078","KT079","KR035","KR034","KR031","KR029","KA009","KA017","KA018","KE041","KE049","KE050","KE020","KE033","KE051","KE044","KE037","KE045","KE052","KE008","KE014","KE047","KE001","KE002"],
  },
];

export default function DecksPage() {
  return (
    <PageLayout
      title="Mazos"
      description="Explorá los mazos oficiales de batalla o creá el tuyo"
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="primary" className="cursor-pointer px-3 py-1">Todos</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Viggo & Nemea</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Igno & Erya</Badge>
        </div>
        <Link href="/decks/new">
          <Button>
            <Plus className="h-4 w-4" />
            Crear mazo
          </Button>
        </Link>
      </div>

      {/* Official Decks Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <Swords className="h-5 w-5 text-accent-400" />
          <h2 className="text-lg font-semibold text-surface-100">Mazos de Batalla Oficiales</h2>
          <Badge variant="accent" className="text-[10px]">Oficial</Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {officialDecks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <Card variant="interactive" className="h-full overflow-hidden">
                {/* Deck image */}
                <div className="relative h-40 bg-surface-800 overflow-hidden">
                  <Image
                    src={deck.imageUrl}
                    alt={deck.name}
                    fill
                    className="object-cover object-top"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-surface-950/80 to-transparent" />
                  <Badge variant="accent" className="absolute top-2 right-2 text-[10px]">Oficial</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-surface-50 mb-1">{deck.name}</h3>
                  <p className="text-xs text-surface-400 mb-3 line-clamp-2">{deck.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={deck.type === "combatants" ? "error" : "info"} className="text-[10px]">
                        <Swords className="h-2.5 w-2.5 mr-1" />
                        {deck.type === "combatants" ? "Ofensivo" : "Defensivo"}
                      </Badge>
                    </div>
                    <span className="text-xs text-surface-500">{deck.cards} cartas</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Create your own deck CTA */}
      <div className="text-center py-12 bg-surface-900 border border-surface-800 rounded-xl">
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
