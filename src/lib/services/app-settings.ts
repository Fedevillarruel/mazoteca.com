"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

// ── Tipos ────────────────────────────────────────────────────

export interface AppSettings {
  singles_enabled: boolean;
  cart_enabled: boolean;
  prices_enabled: boolean;
  trades_enabled: boolean;
  forum_enabled: boolean;
  decks_enabled: boolean;
  album_enabled: boolean;
  premium_enabled: boolean;
}

const DEFAULTS: AppSettings = {
  singles_enabled: true,
  cart_enabled: false,
  prices_enabled: false,
  trades_enabled: true,
  forum_enabled: true,
  decks_enabled: true,
  album_enabled: true,
  premium_enabled: true,
};

// ── Lectura pública (sin auth) ───────────────────────────────

/**
 * Lee todas las feature flags de Supabase.
 * Si la tabla no existe devuelve los defaults para no bloquear el build.
 * Usa el cliente anon para que lo pueda leer el layout.
 */
export async function getAppSettings(): Promise<AppSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("key, value");

    if (error || !data) return DEFAULTS;

    const result: AppSettings = { ...DEFAULTS };
    for (const row of data) {
      const key = row.key as keyof AppSettings;
      if (key in DEFAULTS) {
        result[key] = Boolean(row.value);
      }
    }
    return result;
  } catch {
    return DEFAULTS;
  }
}

/**
 * Obtiene un único flag por su key.
 */
export async function getFlag(key: keyof AppSettings): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (data === null || data === undefined) return DEFAULTS[key];
    return Boolean(data.value);
  } catch {
    return DEFAULTS[key];
  }
}

// ── Escritura (solo admin) ───────────────────────────────────

export interface UpdateSettingResult {
  success: boolean;
  error?: string;
}

/**
 * Actualiza un feature flag. Solo admins pueden llamar esto.
 */
export async function updateAppSetting(
  key: keyof AppSettings,
  value: boolean
): Promise<UpdateSettingResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "No autenticado" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Solo los admins pueden modificar la configuración" };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("app_settings")
      .upsert(
        { key, value, updated_by: user.id },
        { onConflict: "key" }
      );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
