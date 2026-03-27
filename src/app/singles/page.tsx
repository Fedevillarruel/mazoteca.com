import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Store,
  Crown,
  Shield,
  Star,
  Scroll,
  Sparkles,
  Crosshair,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { allCards, type KTCGCategory } from "@/data/cards";

export const metadata: Metadata = {
  title: "Singles",
  description:
    "Comprá, vendé e intercambiá cartas físicas de Kingdom TCG con otros jugadores.",
};

const categoryIcon: Record<KTCGCategory, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

// Show a selection of real cards as "available" listings
const featuredCodes = [
  "KC001", "KC002", "KC003", "KC004",
  "KT024", "KT029", "KT045", "KT060",
  "KE005", "KE012", "KE020", "KE035",
  "KR002", "KR010", "KR025", "KR040",
  "KP001", "KP005",
  "KA003", "KA010", "KA015", "KA018",
];

const featuredCards = featuredCodes
  .map((code) => allCards.find((c) => c.code === code))
  .filter(Boolean);

export default function SinglesPage() {
  return (
    <PageLayout
      title="Singles"
      description="Comprá, vendé e intercambiá cartas de Kingdom TCG"
    >
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar singles..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <ArrowUpDown className="h-4 w-4" />
            Filtros
          </Button>
          <Link href="/singles/new">
            <Button>
              <Plus className="h-4 w-4" />
              Publicar carta
            </Button>
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Badge variant="primary" className="cursor-pointer px-3 py-1">
          Todas
        </Badge>
        <Badge variant="default" className="cursor-pointer px-3 py-1">
          Precio fijo
        </Badge>
        <Badge variant="default" className="cursor-pointer px-3 py-1">
          Recibiendo ofertas
        </Badge>
        <Badge variant="default" className="cursor-pointer px-3 py-1">
          Más recientes
        </Badge>
        <Badge variant="default" className="cursor-pointer px-3 py-1">
          Menor precio
        </Badge>
        <Badge variant="default" className="cursor-pointer px-3 py-1">
          Mayor precio
        </Badge>
      </div>

      {/* Listings Grid — using REAL cards from catalog */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {featuredCards.map((card) => {
          if (!card) return null;
          const Icon = categoryIcon[card.category] ?? Shield;
          return (
            <Link key={card.code} href={`/catalog/${card.slug}`}>
              <Card variant="interactive" className="h-full">
                <CardContent className="p-0">
                  {/* Image area */}
                  <div className="relative aspect-2.5/3.5 bg-surface-800 rounded-t-xl flex flex-col items-center justify-center p-3 text-center">
                    <Icon className="h-8 w-8 text-surface-600 mb-2" />
                    <span className="text-xs font-medium text-surface-300 leading-tight line-clamp-2">
                      {card.name}
                    </span>
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-surface-900/90 border border-surface-700 text-[10px] font-mono text-surface-300">
                      {card.code}
                    </div>
                  </div>

                  {/* Info */}
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
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Info text */}
      <p className="text-center text-sm text-surface-400 mt-8">
        Mostrando {featuredCards.length} de {allCards.length} cartas disponibles
        ·{" "}
        <Link href="/catalog" className="text-primary-400 hover:underline">
          Ver catálogo completo
        </Link>
      </p>

      {/* CTA for sellers */}
      <div className="mt-12 bg-surface-900 border border-surface-800 rounded-xl p-8 text-center">
        <Store className="h-10 w-10 text-accent-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-surface-100 mb-2">
          ¿Tenés cartas para vender?
        </h3>
        <p className="text-surface-400 mb-6 max-w-md mx-auto">
          Publicá tus cartas físicas como singles y llegá a otros jugadores. Es
          rápido, simple y seguro.
        </p>
        <Link href="/singles/new">
          <Button variant="accent">
            <Plus className="h-4 w-4" />
            Publicar mi primera carta
          </Button>
        </Link>
      </div>
    </PageLayout>
  );
}
