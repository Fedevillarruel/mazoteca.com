"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown, Check, Zap, Shield, Layers, ShoppingBag,
  RefreshCw, Star, Sparkles, ExternalLink, Loader2,
  TrendingUp, Lock,
} from "lucide-react";

const features = [
  { icon: Layers,      title: "Mazos",           free: "Hasta 2 mazos",       premium: "Mazos ilimitados" },
  { icon: ShoppingBag, title: "Singles",          free: "Hasta 5 publicaciones", premium: "Publicaciones ilimitadas" },
  { icon: RefreshCw,   title: "Intercambios",     free: "3 por día",           premium: "Ilimitados" },
  { icon: Shield,      title: "Sin publicidades", free: "Con publicidades",    premium: "Sin publicidades" },
  { icon: Star,        title: "Badge Premium",    free: "—",                   premium: "Badge exclusivo en tu perfil" },
  { icon: Zap,         title: "Acceso anticipado",free: "—",                   premium: "Nuevas expansiones antes que nadie" },
];

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  priceUSD: number;
  priceARS: number;
  blueRate: number;
}

export function PremiumPageClient({ priceUSD, priceARS, blueRate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/premium/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al iniciar el pago");
        return;
      }
      // Redirect to Checkout Pro
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      {/* Hero */}
      <div className="text-center mb-12">
        {reason === "deck_limit" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-5">
            <Lock className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-amber-300">Alcanzaste el límite de 2 mazos del plan gratuito</span>
          </div>
        )}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6">
          <Crown className="h-5 w-5 text-accent-400" />
          <span className="text-sm font-semibold text-accent-400">Mazoteca Premium</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-surface-50 mb-4">
          Llevá tu experiencia al{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-400 to-primary-400">
            siguiente nivel
          </span>
        </h1>
        <p className="text-lg text-surface-400 max-w-2xl mx-auto">
          Mazos ilimitados, sin publicidades, acceso anticipado y mucho más.
          Un solo pago, para siempre.
        </p>
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-2 max-w-3xl mx-auto gap-6 mb-16">
        {/* Free */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="text-lg">Gratis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-surface-100 mb-1">$0</p>
            <p className="text-sm text-surface-400 mb-6">Para siempre</p>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f.title} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-surface-500 mt-0.5 shrink-0" />
                  <span className="text-surface-400">{f.free}</span>
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="w-full mt-6" disabled>
              Tu plan actual
            </Button>
          </CardContent>
        </Card>

        {/* Premium */}
        <Card className="relative border-accent-500/40 shadow-lg shadow-accent-500/5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="accent" className="px-4 py-1">
              <Sparkles className="h-3 w-3" />
              Pago único
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-lg text-accent-400">Premium</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Price block */}
            <div className="mb-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-surface-100">
                  USD {priceUSD}
                </span>
                <span className="text-sm text-surface-400">· pago único</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-surface-300">
                <TrendingUp className="h-3.5 w-3.5 text-accent-400" />
                <span>{formatARS(priceARS)}</span>
                <span className="text-surface-500 text-xs">
                  (dólar blue hoy: ${blueRate.toLocaleString("es-AR")})
                </span>
              </div>
              <p className="text-[11px] text-surface-500 mt-1">
                El precio en ARS se actualiza al día de pago según la cotización del dólar blue.
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {features.map((f) => (
                <li key={f.title} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent-400 mt-0.5 shrink-0" />
                  <span className="text-surface-200">{f.premium}</span>
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-sm text-red-400 mb-3 text-center">{error}</p>
            )}

            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
              ) : (
                <><Crown className="h-4 w-4" /> Pagar con Mercado Pago <ExternalLink className="h-3 w-3" /></>
              )}
            </Button>

            <p className="text-[10px] text-surface-500 text-center mt-3">
              Serás redirigido a Mercado Pago de forma segura.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-surface-100 text-center mb-6">Comparación detallada</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="text-left p-4 text-surface-300 font-medium">Característica</th>
                    <th className="text-center p-4 text-surface-300 font-medium">Gratis</th>
                    <th className="text-center p-4 text-accent-400 font-medium">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f, i) => (
                    <tr key={f.title} className={i < features.length - 1 ? "border-b border-surface-800" : ""}>
                      <td className="p-4 text-surface-200 flex items-center gap-2">
                        <f.icon className="h-4 w-4 text-surface-400" />{f.title}
                      </td>
                      <td className="p-4 text-center text-surface-400">{f.free}</td>
                      <td className="p-4 text-center text-surface-200">{f.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-xl font-bold text-surface-100 text-center mb-6">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {[
            {
              q: "¿Cómo funciona el pago?",
              a: "Procesamos los pagos de forma segura a través de Mercado Pago. Podés pagar con tarjeta de crédito, débito o dinero en cuenta.",
            },
            {
              q: "¿Cómo se calcula el precio en pesos?",
              a: `El precio base es USD ${priceUSD}. Al momento de pagar, se toma la cotización del dólar blue del día (hoy: $${blueRate.toLocaleString("es-AR")}) para convertirlo a ARS.`,
            },
            {
              q: "¿Es un pago único o mensual?",
              a: "Es un pago único, de por vida. Pagás una sola vez y tenés acceso premium para siempre.",
            },
            {
              q: "¿Qué pasa con mis mazos si no tengo premium?",
              a: "Podés tener hasta 2 mazos sin premium. Si ya tenés más de 2, los existentes se conservan pero no podés crear nuevos hasta tener premium.",
            },
          ].map((faq) => (
            <Card key={faq.q}>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-surface-100 mb-1">{faq.q}</p>
                <p className="text-sm text-surface-400">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-xs text-surface-600">
          ¿Problemas con tu pago?{" "}
          <Link href="/contact" className="text-primary-400 hover:underline">Contactanos</Link>
        </p>
      </div>
    </PageLayout>
  );
}
