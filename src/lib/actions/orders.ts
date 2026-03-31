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

/** Etiquetas legibles para los estados */
export function getStatusLabel(status: string | null): {
  label: string;
  color: string;
} {
  switch (status) {
    // payment_status
    case "paid":
      return { label: "Pagado", color: "text-green-400 bg-green-400/10 border-green-400/20" };
    case "pending":
      return { label: "Pendiente de pago", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
    case "authorized":
      return { label: "Autorizado", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
    case "voided":
      return { label: "Anulado", color: "text-surface-400 bg-surface-700/30 border-surface-600/20" };
    case "refunded":
      return { label: "Reembolsado", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" };
    case "unpaid":
      return { label: "Sin pagar", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    case "charged_back":
      return { label: "Contracargo", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    // shipping_status
    case "unshipped":
      return { label: "Sin enviar", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
    case "unpacked":
      return { label: "Sin empaquetar", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
    case "fulfilled":
      return { label: "Enviado", color: "text-green-400 bg-green-400/10 border-green-400/20" };
    case "unfulfilled":
      return { label: "Sin cumplir", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    // order status
    case "open":
      return { label: "Abierto", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
    case "closed":
      return { label: "Completado", color: "text-green-400 bg-green-400/10 border-green-400/20" };
    case "cancelled":
      return { label: "Cancelado", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    default:
      return { label: status ?? "—", color: "text-surface-400 bg-surface-700/30 border-surface-600/20" };
  }
}
