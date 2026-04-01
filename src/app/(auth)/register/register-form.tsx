"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVATARS = [
  { id: "nemea", label: "Nemea", src: "/avatars/nemea.png" },
  { id: "igno", label: "Igno", src: "/avatars/igno.png" },
  { id: "viggo", label: "Viggo", src: "/avatars/viggo.png" },
];

type NicknameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time nickname availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!nickname) {
      setNicknameStatus("idle");
      return;
    }

    const isValid = /^[a-zA-Z0-9_-]{3,20}$/.test(nickname);
    if (!isValid) {
      setNicknameStatus("invalid");
      return;
    }

    setNicknameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", nickname)
        .maybeSingle();
      setNicknameStatus(data ? "taken" : "available");
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nickname]);

  async function handleSubmit(formData: FormData) {
    if (!selectedAvatar) {
      setError("Por favor elegí un avatar");
      return;
    }
    if (nicknameStatus === "taken") {
      setError("El nickname ya está en uso");
      return;
    }
    if (nicknameStatus === "invalid" || !nickname) {
      setError("Ingresá un nickname válido");
      return;
    }

    formData.set("username", nickname);
    formData.set(
      "avatarUrl",
      AVATARS.find((a) => a.id === selectedAvatar)?.src ?? ""
    );

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
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Avatar picker */}
      <div>
        <p className="text-sm font-medium text-surface-200 mb-3">
          Elegí tu avatar
        </p>
        <div className="grid grid-cols-3 gap-3">
          {AVATARS.map((avatar) => {
            const isSelected = selectedAvatar === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedAvatar(avatar.id)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none",
                  isSelected
                    ? "border-primary-500 ring-2 ring-primary-500/30 scale-[1.03]"
                    : "border-surface-700 hover:border-surface-500"
                )}
              >
                <Image
                  src={avatar.src}
                  alt={avatar.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 480px) 30vw, 120px"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary-600/20 flex items-end justify-end p-1.5">
                    <span className="bg-primary-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent pt-4 pb-1.5 px-2">
                  <p className="text-[11px] font-semibold text-white text-center leading-none">
                    {avatar.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nickname */}
      <div>
        <label className="block text-sm font-medium text-surface-200 mb-1.5">
          Nickname
        </label>
        <div className="relative">
          <input
            name="username"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.trim())}
            placeholder="tu_nickname"
            autoComplete="username"
            className={cn(
              "w-full bg-surface-800 border rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder-surface-500 outline-none transition-colors pr-9",
              nicknameStatus === "available" &&
                "border-success focus:border-success",
              nicknameStatus === "taken" && "border-error focus:border-error",
              nicknameStatus === "invalid" && "border-warning focus:border-warning",
              nicknameStatus === "checking" && "border-surface-600",
              nicknameStatus === "idle" &&
                "border-surface-700 focus:border-primary-500"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {nicknameStatus === "checking" && (
              <Loader2 className="h-4 w-4 text-surface-400 animate-spin" />
            )}
            {nicknameStatus === "available" && (
              <Check className="h-4 w-4 text-success" />
            )}
            {nicknameStatus === "taken" && (
              <AlertCircle className="h-4 w-4 text-error" />
            )}
            {nicknameStatus === "invalid" && (
              <AlertCircle className="h-4 w-4 text-warning" />
            )}
          </div>
        </div>
        <p
          className={cn(
            "text-xs mt-1",
            nicknameStatus === "available" && "text-success",
            nicknameStatus === "taken" && "text-error",
            nicknameStatus === "invalid" && "text-warning",
            nicknameStatus === "idle" || nicknameStatus === "checking"
              ? "text-surface-500"
              : ""
          )}
        >
          {nicknameStatus === "available" && "¡Nickname disponible!"}
          {nicknameStatus === "taken" && "Este nickname ya está en uso"}
          {nicknameStatus === "invalid" &&
            "3–20 caracteres: letras, números, _ o -"}
          {(nicknameStatus === "idle" || nicknameStatus === "checking") &&
            "3–20 caracteres: letras, números, _ o -"}
        </p>
      </div>

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
