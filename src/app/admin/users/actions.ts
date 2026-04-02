"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/actions";

export type { UserRole };

export async function updateUserRole(userId: string, newRole: UserRole) {
  // Verify the caller is an admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return { error: "Solo los administradores pueden cambiar roles." };
  }

  // Prevent self-demotion
  if (userId === user.id && newRole !== "admin") {
    return { error: "No podés cambiar tu propio rol." };
  }

  // Use admin client to bypass RLS
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}
