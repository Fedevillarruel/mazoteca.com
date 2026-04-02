"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AppSettings, UpdateSettingResult } from "@/lib/types/app-settings";
import { SETTINGS_DEFAULTS } from "@/lib/types/app-settings";

// ── Lectura pública (sin auth) ───────────────────────────────

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("key, value");

    if (error || !data) return SETTINGS_DEFAULTS;

    const result: AppSettings = { ...SETTINGS_DEFAULTS };
    for (const row of data) {
      const key = row.key as keyof AppSettings;
      if (key in SETTINGS_DEFAULTS) {
        result[key] = row.value === true || row.value === "true";
      }
    }
    return result;
  } catch {
    return SETTINGS_DEFAULTS;
  }
}

export async function getFlag(key: keyof AppSettings): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (!data) return SETTINGS_DEFAULTS[key];
    return data.value === true || data.value === "true";
  } catch {
    return SETTINGS_DEFAULTS[key];
  }
}

// ── Escritura (solo admin) ───────────────────────────────────

export async function updateAppSetting(
  key: keyof AppSettings,
  value: boolean
): Promise<UpdateSettingResult> {
  try {
    // Verificar autenticación con cliente de usuario
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado. Recargá la página." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "No se pudo verificar tu rol." };
    }

    if (profile.role !== "admin") {
      return { success: false, error: "Solo los admins pueden modificar esta configuración." };
    }

    // Escribir con admin client (bypasea RLS)
    const admin = createAdminClient();
    const { error: upsertError } = await admin
      .from("app_settings")
      .upsert(
        {
          key,
          value: value,   // boolean → jsonb (Supabase lo convierte automáticamente)
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (upsertError) {
      return { success: false, error: upsertError.message };
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: `Error inesperado: ${String(e)}` };
  }
}
