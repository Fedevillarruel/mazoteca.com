"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { TnOrder, TnLineItem, TnAddress } from "@/lib/types/actions";

export type { TnOrder, TnLineItem, TnAddress };

/** Obtiene los pedidos del usuario autenticado actualmente */
export async function getMyOrders(): Promise<TnOrder[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("tn_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("tn_created_at", { ascending: false });

  if (error) {
    console.error("[getMyOrders]", error.message);
    return [];
  }

  return (data ?? []) as TnOrder[];
}

/**
 * Obtiene los pedidos de un usuario por su ID.
 * Solo accesible para admins o para el propio usuario.
 */
export async function getOrdersByUserId(userId: string): Promise<TnOrder[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("tn_orders")
    .select("*")
    .eq("user_id", userId)
    .order("tn_created_at", { ascending: false });

  if (error) {
    console.error("[getOrdersByUserId]", error.message);
    return [];
  }

  return (data ?? []) as TnOrder[];
}
