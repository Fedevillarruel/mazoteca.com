"use client";

import Link from "next/link";
import { BookOpen, Star, Package, Monitor, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AlbumGate() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex h-20 w-20 rounded-2xl bg-primary-500/10 items-center justify-center mb-6 mx-auto">
          <BookOpen className="h-10 w-10 text-primary-400" />
        </div>
        <h1 className="text-4xl font-bold text-surface-50 mb-4">
          Tu <span className="text-primary-400">Álbum</span> de Kingdom TCG
        </h1>
        <p className="text-lg text-surface-300 mb-2">
          Registrá cada carta que tenés. Físicas o digitales. Repetidas o únicas.
        </p>
        <p className="text-surface-500 text-sm">
          Mostrá tu colección al mundo, armá tu wishlist y encontrá quién tiene lo que te falta.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full mx-auto mb-12">
        {[
          {
            icon: Package,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            title: "Álbum Físico",
            desc: "Registrá tus cartas físicas reales. Repetidas, Near Mint, dañadas — todo.",
          },
          {
            icon: Monitor,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            title: "Álbum Digital",
            desc: "Llevá el control de tus cartas en versión digital separado de las físicas.",
          },
          {
            icon: Heart,
            color: "text-pink-400",
            bg: "bg-pink-500/10",
            title: "Wishlist Pública",
            desc: "Publicá las cartas que buscás. Otros usuarios podrán ofrecerte lo que necesitás.",
          },
          {
            icon: Star,
            color: "text-accent-400",
            bg: "bg-accent-500/10",
            title: "Libro Animado",
            desc: "Pasá las páginas de tu colección con animación de libro real, 3 cartas por fila.",
          },
        ].map((feat) => {
          const Icon = feat.icon;
          return (
            <Card key={feat.title} className="border-surface-800">
              <CardContent className="p-5">
                <div className={`inline-flex h-10 w-10 rounded-xl ${feat.bg} items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${feat.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-surface-100 mb-1">{feat.title}</h3>
                <p className="text-xs text-surface-400 leading-relaxed">{feat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center bg-surface-900 border border-surface-800 rounded-2xl p-8 max-w-md w-full mx-auto">
        <p className="text-surface-300 mb-6 text-sm leading-relaxed">
          Para acceder a tu álbum necesitás una cuenta en Mazoteca.
          ¡Es gratis y solo toma unos segundos!
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/register" className="flex-1">
            <Button className="w-full" variant="primary">
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button className="w-full" variant="secondary">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
