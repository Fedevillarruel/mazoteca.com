import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Crown,
  Check,
  Zap,
  Shield,
  Layers,
  ShoppingBag,
  RefreshCw,
  Star,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Premium",
  description: "Desbloqueá todas las funciones de Mazoteca con una suscripción premium.",
};

const features = [
  {
    icon: Layers,
    title: "Mazos ilimitados",
    free: "Hasta 2 mazos",
    premium: "Mazos ilimitados",
  },
  {
    icon: ShoppingBag,
    title: "Publicaciones en Singles",
    free: "Hasta 5 publicaciones",
    premium: "Publicaciones ilimitadas",
  },
  {
    icon: RefreshCw,
    title: "Intercambios diarios",
    free: "3 por día",
    premium: "Ilimitados",
  },
  {
    icon: Shield,
    title: "Sin publicidades",
    free: "Con publicidades",
    premium: "Sin publicidades",
  },
  {
    icon: Star,
    title: "Badge Premium",
    free: "—",
    premium: "Badge exclusivo en tu perfil",
  },
  {
    icon: Zap,
    title: "Acceso anticipado",
    free: "—",
    premium: "Nuevas expansiones antes que nadie",
  },
];

export default function PremiumPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <div className="text-center mb-12">
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
          Mazos ilimitados, sin publicidades, acceso anticipado a expansiones y mucho más.
          Todo por menos que un café al mes.
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
              Recomendado
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-lg text-accent-400">Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="text-3xl font-bold text-surface-100">$2.999</p>
              <span className="text-sm text-surface-400">ARS/mes</span>
            </div>
            <p className="text-sm text-surface-400 mb-6">Cancelá cuando quieras</p>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f.title} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent-400 mt-0.5 shrink-0" />
                  <span className="text-surface-200">{f.premium}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full mt-6">
              <Crown className="h-4 w-4" />
              Suscribirme a Premium
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-surface-100 text-center mb-6">
          Comparación detallada
        </h2>
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
                    <tr
                      key={f.title}
                      className={i < features.length - 1 ? "border-b border-surface-800" : ""}
                    >
                      <td className="p-4 text-surface-200 flex items-center gap-2">
                        <f.icon className="h-4 w-4 text-surface-400" />
                        {f.title}
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
        <h2 className="text-xl font-bold text-surface-100 text-center mb-6">
          Preguntas frecuentes
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "¿Cómo funciona el pago?",
              a: "Procesamos los pagos de forma segura a través de MercadoPago. Podés pagar con tarjeta de crédito, débito o dinero en cuenta.",
            },
            {
              q: "¿Puedo cancelar en cualquier momento?",
              a: "Sí, podés cancelar tu suscripción cuando quieras. Seguirás teniendo acceso premium hasta el final del período pagado.",
            },
            {
              q: "¿Qué pasa con mis mazos si cancelo?",
              a: "Tus mazos se conservan, pero si tenés más de 2, solo podrás editar los 2 más recientes hasta que renueves.",
            },
            {
              q: "¿Hay descuento por pago anual?",
              a: "Próximamente ofreceremos un plan anual con descuento. ¡Mantenete atento!",
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
    </PageLayout>
  );
}
