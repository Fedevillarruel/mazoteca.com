import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  Crown,
  BookOpen,
  Layers,
  ShoppingBag,
  Star,
  Calendar,
  MessageSquare,
  Users,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Perfil de ${username}`,
    description: `Mirá el perfil, colección y mazos de ${username} en Mazoteca.`,
  };
}

const placeholderStats = [
  { label: "Cartas", value: "1.247", icon: BookOpen },
  { label: "Mazos", value: "8", icon: Layers },
  { label: "Ventas", value: "34", icon: ShoppingBag },
  { label: "Rep.", value: "4.8★", icon: Star },
];

const placeholderDecks = [
  { id: "1", name: "Fuego Agresivo", type: "combatants", likes: 12, isValid: true },
  { id: "2", name: "Control Agua", type: "strategy", likes: 8, isValid: true },
  { id: "3", name: "Tierra Defensiva", type: "combatants", likes: 5, isValid: false },
];

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <PageLayout>
      {/* Profile Header */}
      <div className="relative mb-8">
        {/* Banner */}
        <div className="h-40 sm:h-52 rounded-2xl bg-linear-to-r from-primary-900 via-primary-800 to-accent-900/40 overflow-hidden" />

        {/* Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12 sm:-mt-14 px-4 sm:px-6">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-surface-900 bg-surface-800 overflow-hidden shrink-0">
            <Image
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${username}`}
              alt={username}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 pt-2 sm:pt-14 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-surface-50">{username}</h1>
              <Badge variant="success">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            </div>
            <p className="text-sm text-surface-400 mb-3">
              Coleccionista y competidor de Kingdom TCG. Especialista en mazos de fuego.
            </p>
            <div className="flex items-center gap-4 text-xs text-surface-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Miembro desde Mar 2025
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                12 amigos
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0 sm:pt-14">
            <Button size="sm">
              <UserPlus className="h-4 w-4" />
              Agregar amigo
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {placeholderStats.map((stat) => (
          <Card key={stat.label} variant="glass">
            <CardContent className="p-4 text-center">
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary-400" />
              <p className="text-xl font-bold text-surface-50">{stat.value}</p>
              <p className="text-xs text-surface-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Decks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-400" />
                Mazos públicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {placeholderDecks.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/decks/${deck.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-surface-100">{deck.name}</p>
                    <p className="text-xs text-surface-400">
                      {deck.type === "combatants" ? "Combatientes" : "Estrategia"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {deck.isValid ? (
                      <Badge variant="success">Válido</Badge>
                    ) : (
                      <Badge variant="warning">Incompleto</Badge>
                    )}
                    <span className="text-xs text-surface-400">❤️ {deck.likes}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Activity / Badges */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent-400" />
                Logros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {["Coleccionista", "Veterano", "Campeón", "Generoso", "Social", "Explorador"].map(
                  (badge, i) => (
                    <div
                      key={badge}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-800/50"
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                          i < 3
                            ? "bg-accent-500/20 text-accent-400"
                            : "bg-surface-700 text-surface-500"
                        }`}
                      >
                        🏅
                      </div>
                      <span className="text-[10px] text-surface-400 text-center">{badge}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Publicó un mazo nuevo",
                "Añadió un nuevo amigo",
                "Completó un intercambio",
                "Subió 12 cartas físicas",
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-surface-300">{activity}</p>
                    <p className="text-xs text-surface-500">Hace {i + 1} días</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
