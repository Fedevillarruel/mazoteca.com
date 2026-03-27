import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  ShoppingBag,
  Shield,
  Star,
  MapPin,
  Calendar,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Publicación #${id} — Singles`,
    description: "Detalle de publicación en singles de Mazoteca.",
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <PageLayout>
      <Link
        href="/singles"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a singles
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-surface-800 border border-surface-700/50 mb-3">
            <Image
              src="/placeholder-card.webp"
              alt="Carta"
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg bg-surface-800 border cursor-pointer ${
                  i === 0 ? "border-primary-500" : "border-surface-700 hover:border-surface-500"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="legendary">Legendaria</Badge>
            <Badge variant="success">Disponible</Badge>
          </div>

          <h1 className="text-3xl font-bold text-surface-50 mb-1">Fénix Ancestral</h1>
          <p className="text-sm text-surface-400 mb-4">#042 · Génesis · Combatiente</p>

          <div className="flex items-center gap-4 mb-6 text-sm text-surface-400">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              127 vistas
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              18 favoritos
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Publicado hace 2 días
            </span>
          </div>

          {/* Price */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-400">Precio</p>
                  <p className="text-3xl font-bold text-accent-400">$2.800</p>
                  <p className="text-xs text-surface-500">Near Mint · Foil</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button>
                    <ShoppingBag className="h-4 w-4" />
                    Comprar ahora
                  </Button>
                  <Button variant="secondary">
                    <MessageSquare className="h-4 w-4" />
                    Hacer oferta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Make Offer */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Hacer una oferta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Tu oferta en ARS"
                  className="flex-1"
                />
                <Button>Enviar oferta</Button>
              </div>
              <p className="text-xs text-surface-400 mt-2">
                El vendedor puede aceptar, rechazar o contraofertarte.
              </p>
            </CardContent>
          </Card>

          {/* Seller */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-surface-200 mb-3">Vendedor</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-surface-700">
                  <Image
                    src="https://api.dicebear.com/7.x/identicon/svg?seed=DragonMaster99"
                    alt="DragonMaster99"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href="/profile/DragonMaster99"
                    className="text-sm font-medium text-surface-100 hover:text-primary-400"
                  >
                    DragonMaster99
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-accent-400" />
                      4.9 (34 ventas)
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Buenos Aires
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-green-400" />
                      Verificado
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Ver perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-surface-200 mb-2">Descripción</h3>
              <p className="text-sm text-surface-400 leading-relaxed">
                Carta en excelente estado, sacada directamente del sobre. Viene con protector
                individual. Envío a todo el país por correo argentino. También acepto retiro
                en persona por zona CABA.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
