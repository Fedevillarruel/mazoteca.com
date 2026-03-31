import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { AdBanner } from "@/components/ads/ad-banner";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Iniciá sesión en Mazoteca para gestionar tu colección, mazos y más.",
};

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-primary-400">Mazoteca</span>
          </Link>
          <h1 className="text-3xl font-bold text-surface-50 mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-surface-400">
            Iniciá sesión para acceder a tu cuenta
          </p>
        </div>

        {/* Ad banner top */}
        <div className="mb-5">
          <AdBanner slot="login-top" format="horizontal" className="min-h-22.5" />
        </div>

        {/* Form Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 sm:p-8">
          <LoginForm />
        </div>

        {/* Register link */}
        <p className="text-center mt-6 text-sm text-surface-400">
          ¿No tenés cuenta?{" "}
          <a
            href="/register"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Registrate gratis
          </a>
        </p>

        {/* Ad banner bottom */}
        <div className="mt-5">
          <AdBanner slot="login-bottom" format="horizontal" className="min-h-22.5" />
        </div>
      </div>
    </div>
  );
}
