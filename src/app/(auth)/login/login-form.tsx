"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithGoogle } from "@/lib/actions/auth";
import { Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const supabase = createClient();
      console.log("[Login] llamando signInWithPassword...");
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("[Login] resultado:", { user: data?.user?.email ?? null, error: signInError?.message ?? null });

      if (signInError) {
        setError("Email o contraseña incorrectos");
        return;
      }

      console.log("[Login] éxito, redirigiendo a /...");
      // El onAuthStateChange en AuthProvider detecta el SIGNED_IN automáticamente.
      // Full reload para que el servidor también lea la sesión fresca.
      window.location.href = "/";
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Error al conectar con Google");
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Google OAuth */}
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
      >
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-700" />
        <span className="text-xs text-surface-500">o con tu cuenta</span>
        <div className="flex-1 h-px bg-surface-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
        />

        <Input
          name="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Iniciar Sesión
        </Button>
      </form>
    </div>
  );
}
