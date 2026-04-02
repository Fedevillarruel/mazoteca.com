"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function resolveReport(reportId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    return { success: false, error: "Sin permisos" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("reports")
    .update({ status: "resolved", resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function dismissReport(reportId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    return { success: false, error: "Sin permisos" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("reports")
    .update({ status: "dismissed", resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/reports");
  return { success: true };
}
