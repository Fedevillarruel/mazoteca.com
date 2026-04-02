"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginSchema, registerSchema } from "@/lib/validations";
import type { AuthActionResult } from "@/lib/types/actions";

export async function signInWithGoogle(): Promise<AuthActionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: "Error al iniciar sesión con Google" };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "No se pudo obtener la URL de autenticación" };
}

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    avatarUrl: (formData.get("avatarUrl") as string) || null,
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Check username availability
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", parsed.data.username)
    .single();

  if (existingUser) {
    return { error: "El nombre de usuario ya está en uso" };
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
          username: parsed.data.username,
          avatar_url: rawData.avatarUrl || null,
        },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Este email ya está registrado" };
    }
    return { error: error.message };
  }

  // Create profile row immediately (no email verification required)
  if (signUpData.user) {
    await supabase.from("profiles").upsert({
      id: signUpData.user.id,
      username: parsed.data.username,
      avatar_url: rawData.avatarUrl || null,
    });
  }

  return { success: true };
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email o contraseña incorrectos" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPassword(
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email requerido" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: "Error al enviar email de recuperación" };
  }

  return { success: true };
}

export async function resetPassword(
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get("password") as string;

  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: "Error al actualizar contraseña" };
  }

  redirect("/login");
}

/**
 * Get the current user and profile.
 * Returns null if not authenticated.
 * Auto-creates the profile row if it doesn't exist yet (e.g. after OAuth).
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Auto-create profile if missing (e.g. after Google OAuth or manual DB setup)
  if (!profile) {
    const username =
      user.user_metadata?.username ||
      user.user_metadata?.full_name?.replace(/\s+/g, "").toLowerCase() ||
      user.email?.split("@")[0] ||
      `user_${user.id.slice(0, 8)}`;

    const { data: created } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        display_name: user.user_metadata?.full_name ?? null,
      })
      .select("*")
      .single();

    profile = created;
  }

  return {
    user,
    profile,
  };
}
