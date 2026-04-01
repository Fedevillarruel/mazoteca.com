import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Heart,
  RefreshCw,
  Layers,
  BookOpen,
  Crown,
} from "lucide-react";
import { getCardBySlug } from "@/data/cards";
// import { getVariantsByCardCode } from "@/lib/services/tiendanube-sync"; // temporalmente oculto

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  const name = card?.name ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    title: name,
    description: `Detalles, variantes y precios de ${name} en Mazoteca.`,
  };
}

const categoryLabels: Record<string, string> = {
  tropa: "Tropa",
  coronado: "Coronado",
  realeza: "Realeza",
  estrategia: "Estrategia",
  estrategia_primigenia: "Estrategia Primigenia",
  arroje: "Arroje",
};

// CONDITION_BADGE — temporalmente oculto con la sección de singles
// const CONDITION_BADGE: Record<string, "success" | "info" | "warning" | "error" | "default"> = { ... };

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) notFound();

  const displayName = card.name;
  const typeLabel = categoryLabels[card.card_type] ?? card.card_type;

  // Variantes de Tiendanube — temporalmente oculto con la sección de singles
  // const tnVariants = await getVariantsByCardCode(card.code);

  return (
    <PageLayout>
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Card Image */}
        <div className="relative aspect-2.5/3.5 max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-surface-800 border border-surface-700/50 shadow-xl">
          <Image
            src="/placeholder-card.webp"
            alt={displayName}
            fill
            className="object-cover"
            priority
          />
          {/* code badge */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-surface-900/90 border border-surface-700 text-[11px] font-mono text-surface-300">
            {card.code}
          </div>
        </div>

        {/* Card Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex gap-2 mb-2 flex-wrap">
                <Badge variant="default">{card.category}</Badge>
                {card.level != null && <Badge variant="info">Nivel {card.level}</Badge>}
                {card.card_type === "coronado" && <Badge variant="accent">Coronado</Badge>}
                {card.edition && <Badge variant="default" className="font-mono">Ed. {card.edition}</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-surface-50">{displayName}</h1>
              <p className="text-sm text-surface-400 mt-1">
                {card.code} · {typeLabel}
                {card.crowned ? ` · ${card.crowned}` : ""}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {card.level != null && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/80 border border-surface-700/50">
                <Layers className="h-4 w-4 text-primary-400" />
                <span className="text-sm font-medium text-surface-200">Nivel {card.level}</span>
              </div>
            )}
            {card.card_type === "coronado" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/80 border border-accent-500/30">
                <Crown className="h-4 w-4 text-accent-400" />
                <span className="text-sm font-medium text-accent-300">Coronado</span>
              </div>
            )}
          </div>

          {/* Coronado finishes */}
          {card.finishes && card.finishes.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm">Versiones disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {card.finishes.map((f) => (
                    <Badge key={f} variant="default">{f}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lore / Flavor text */}
          {card.flavor_text && (
            <Card className="mb-6 border-surface-700/50">
              <CardContent className="p-4 flex gap-3">
                <BookOpen className="h-4 w-4 text-surface-500 mt-0.5 shrink-0" />
                <p className="text-sm italic text-surface-400 leading-relaxed">
                  {card.flavor_text}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Singles Variants — temporalmente oculto */}
          {/* <Card>
            <CardHeader>
              <CardTitle>
                <ShoppingBag ... />
                Disponible en Singles
              </CardTitle>
            </CardHeader>
            <CardContent>
              ... tnVariants ...
            </CardContent>
          </Card> */}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" className="flex-1">
              <Layers className="h-4 w-4" />
              Agregar a mazo
            </Button>
            <Button variant="secondary" className="flex-1">
              <RefreshCw className="h-4 w-4" />
              Ofrecer intercambio
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
