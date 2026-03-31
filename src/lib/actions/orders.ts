"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export interface TnOrder {
  id: number;
  status: string;
  payment_status: string | null;
  shipping_status: string | null;
  gateway: string | null;
  currency: string;
  total: number | null;
  subtotal: number | null;
  discount: number | null;
  shipping_cost: number | null;
  customer_email: string | null;
  customer_name: string | null;
  line_items: TnLineItem[];
  shipping_address: TnAddress | null;
  tracking_number: string | null;
  tracking_url: string | null;
  tn_created_at: string | null;
  tn_updated_at: string | null;
  synced_at: string;
}

export interface TnLineItem {
  id: number;
  variant_id: number | null;
  product_id: number | null;
  name: string;
  price: string;
  quantity: number;
  sku: string | null;
}

export interface TnAddress {
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zipcode: string | null;
}

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
