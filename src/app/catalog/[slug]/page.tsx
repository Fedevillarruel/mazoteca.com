import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  RefreshCw,
  Layers,
  Sparkles,
  Shield,
  Flame,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: name,
    description: `Detalles, variantes y precios de ${name} en Mazoteca.`,
  };
}

const placeholderVariants = [
  { id: "v1", finish: "Normal", condition: "Near Mint", price: 450, stock: 12 },
  { id: "v2", finish: "Foil", condition: "Near Mint", price: 1200, stock: 3 },
  { id: "v3", finish: "Full Art", condition: "Lightly Played", price: 2800, stock: 1 },
];

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cardName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

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
        <div className="relative aspect-[2.5/3.5] max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-surface-800 border border-surface-700/50 shadow-xl">
          <Image
            src="/placeholder-card.webp"
            alt={cardName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-3 right-3">
            <Badge variant="legendary" className="text-xs">Legendaria</Badge>
          </div>
        </div>

        {/* Card Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Badge variant="default" className="mb-2">Expansión: Génesis</Badge>
              <h1 className="text-3xl font-bold text-surface-50">{cardName}</h1>
              <p className="text-sm text-surface-400 mt-1">
                #042 · Combatiente · Reino de Fuego
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/80 border border-surface-700/50">
              <Flame className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-surface-200">ATK: 7</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/80 border border-surface-700/50">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-surface-200">DEF: 4</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/80 border border-surface-700/50">
              <Sparkles className="h-4 w-4 text-accent-400" />
              <span className="text-sm font-medium text-surface-200">Costo: 5</span>
            </div>
          </div>

          {/* Abilities */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Habilidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-accent-400">Llamarada Infernal</p>
                <p className="text-sm text-surface-300">
                  Inflige 3 de daño a todos los combatientes enemigos. Solo puede activarse una
                  vez por turno.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-400">Escudo de Cenizas (Pasiva)</p>
                <p className="text-sm text-surface-300">
                  Reduce el daño recibido en 1 por cada aliado de Fuego en el campo.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lore */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm italic text-surface-400">
                &ldquo;El fuego no destruye, transforma. Quien domina las llamas domina el
                destino.&rdquo; — Crónicas del Reino de Fuego, Vol. III
              </p>
            </CardContent>
          </Card>

          {/* Singles Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary-400" />
                Disponible en Singles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {placeholderVariants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 border border-surface-700/30"
                  >
                    <div>
                      <p className="text-sm font-medium text-surface-100">{v.finish}</p>
                      <p className="text-xs text-surface-400">
                        {v.condition} · {v.stock} disponibles
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-accent-400">
                        ${v.price.toLocaleString("es-AR")}
                      </p>
                      <Button size="sm">Comprar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
