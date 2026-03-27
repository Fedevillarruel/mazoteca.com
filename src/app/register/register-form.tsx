"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/actions/auth";
import { Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle className="h-6 w-6 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-surface-50 mb-2">
          ¡Cuenta creada!
        </h2>
        <p className="text-sm text-surface-400 mb-4">
          Tu cuenta fue creada exitosamente. Ya podés iniciar sesión.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
        >
          Iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

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
        name="username"
        type="text"
        label="Nickname"
        placeholder="tu_nickname"
        required
        autoComplete="username"
        hint="3-20 caracteres. Letras, números, guiones y guiones bajos."
        leftIcon={<User className="h-4 w-4" />}
      />

      <Input
        name="password"
        type="password"
        label="Contraseña"
        placeholder="••••••••"
        required
        autoComplete="new-password"
        hint="Mínimo 8 caracteres, una mayúscula y un número."
        leftIcon={<Lock className="h-4 w-4" />}
      />

      <Input
        name="confirmPassword"
        type="password"
        label="Confirmar contraseña"
        placeholder="••••••••"
        required
        autoComplete="new-password"
        leftIcon={<Lock className="h-4 w-4" />}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Crear cuenta
      </Button>

      <p className="text-xs text-surface-500 text-center">
        Al registrarte, aceptás nuestros{" "}
        <a href="/terms" className="text-primary-400 hover:underline">
          Términos de uso
        </a>{" "}
        y{" "}
        <a href="/privacy" className="text-primary-400 hover:underline">
          Política de privacidad
        </a>
        .
      </p>
    </form>
  );
}
