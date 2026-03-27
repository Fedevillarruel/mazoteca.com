import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
  BarChart3,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Mazo #${id}`,
    description: "Detalle de mazo de Kingdom TCG en Mazoteca.",
  };
}

const placeholderDeckCards = Array.from({ length: 12 }, (_, i) => ({
  id: `dc-${i}`,
  name: `Carta ${i + 1}`,
  quantity: (i % 3) + 1,
  rarity: (["common", "rare", "epic", "legendary"] as const)[i % 4],
  cost: (i % 6) + 1,
}));

const costDistribution = [
  { cost: 1, count: 4 },
  { cost: 2, count: 6 },
  { cost: 3, count: 8 },
  { cost: 4, count: 7 },
  { cost: 5, count: 5 },
  { cost: 6, count: 3 },
];
const maxCount = 8;

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  const totalCards = placeholderDeckCards.reduce((s, c) => s + c.quantity, 0);

  return (
    <PageLayout>
      <Link
        href="/decks"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mazos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">
              <CheckCircle className="h-3 w-3" />
              Válido
            </Badge>
            <Badge variant="default">Combatientes</Badge>
          </div>
          <h1 className="text-3xl font-bold text-surface-50 mb-1">Fuego Agresivo</h1>
          <p className="text-sm text-surface-400">
            Por{" "}
            <Link href="/profile/DragonMaster99" className="text-primary-400 hover:underline">
              DragonMaster99
            </Link>{" "}
            · Creado hace 5 días · {totalCards} cartas
          </p>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card List */}
        <div className="lg:col-span-2">
          {/* Crowned */}
          <Card className="mb-4 border-accent-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-accent-400" />
                <div className="h-12 w-9 rounded bg-surface-700 relative overflow-hidden shrink-0">
                  <Image
                    src="/placeholder-card.webp"
                    alt="Crowned"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-accent-300">Fénix Ancestral</p>
                  <p className="text-xs text-surface-400">Coronado · Legendaria</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-400" />
                Cartas del mazo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {placeholderDeckCards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/catalog/carta-${card.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-800/50 transition-colors"
                  >
                    <span className="text-xs text-surface-400 w-6 text-center font-mono">
                      {card.quantity}x
                    </span>
                    <div className="h-8 w-6 rounded bg-surface-700 shrink-0 relative overflow-hidden">
                      <Image
                        src="/placeholder-card.webp"
                        alt={card.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="flex-1 text-sm text-surface-200">{card.name}</span>
                    <Badge
                      variant={
                        card.rarity === "legendary"
                          ? "legendary"
                          : card.rarity === "epic"
                            ? "epic"
                            : card.rarity === "rare"
                              ? "rare"
                              : "common"
                      }
                      className="text-[10px]"
                    >
                      {card.rarity}
                    </Badge>
                    <span className="text-xs text-surface-500">Costo: {card.cost}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          {/* Mana Curve */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-primary-400" />
                Curva de maná
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-1 h-32 px-2">
                {costDistribution.map((bar) => (
                  <div key={bar.cost} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-surface-400">{bar.count}</span>
                    <div
                      className="w-full rounded-t bg-primary-500/50"
                      style={{ height: `${(bar.count / maxCount) * 100}%` }}
                    />
                    <span className="text-[10px] text-surface-500">{bar.cost}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rarity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Distribución de rareza</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Común", count: 12, color: "bg-surface-500" },
                { label: "Rara", count: 10, color: "bg-blue-500" },
                { label: "Épica", count: 7, color: "bg-purple-500" },
                { label: "Legendaria", count: 4, color: "bg-amber-500" },
              ].map((rarity) => (
                <div key={rarity.label} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${rarity.color}`} />
                  <span className="text-xs text-surface-300 flex-1">{rarity.label}</span>
                  <span className="text-xs text-surface-400">{rarity.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-400 leading-relaxed">
                Mazo agresivo centrado en combatientes de fuego. La idea es presionar
                desde el turno 2 con criaturas de bajo costo y cerrar con el combo
                de Fénix Ancestral + Llamarada Infernal en turno 5-6.
              </p>
            </CardContent>
          </Card>

          {/* Estimated Cost */}
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-surface-400 mb-1">Costo estimado del mazo</p>
              <p className="text-2xl font-bold text-accent-400">$8.450</p>
              <p className="text-xs text-surface-500">Según precios de singles</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
