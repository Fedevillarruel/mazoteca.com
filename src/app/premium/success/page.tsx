import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "¡Bienvenido a Premium! — Mazoteca",
};

export default function PremiumSuccessPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Animated icon */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-accent-500/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-accent-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-accent-500/30">
            <Crown className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-surface-50 mb-3">
          ¡Sos Premium! 🎉
        </h1>
        <p className="text-surface-400 mb-8 leading-relaxed">
          Tu pago fue procesado con éxito. Ya tenés acceso a todas las funciones premium de Mazoteca.
        </p>

        {/* Benefits recap */}
        <div className="bg-surface-900 border border-accent-500/20 rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            "Mazos ilimitados",
            "Sin publicidades",
            "Badge Premium exclusivo en tu perfil",
            "Acceso anticipado a nuevas expansiones",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-accent-400" />
              </div>
              <span className="text-sm text-surface-200">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/decks/new">
            <Button className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Crear mazos ilimitados
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              Ir al inicio
            </Button>
          </Link>
        </div>

        <p className="text-xs text-surface-600 mt-6">
          Si tu cuenta no refleja el estado premium en los próximos minutos,
          cerrá sesión y volvé a ingresar.
        </p>
      </div>
    </div>
  );
}
