import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/tiendanube/orders
 * Recibe webhooks de TiendaNube para order/created, order/updated, order/paid.
 *
 * Payload de TN:
 * {
 *   store_id: number,
 *   event: "order/created" | "order/updated" | "order/paid",
 *   id: number   <- order id
 * }
 *
 * Al recibir el evento, buscamos el pedido completo en la API de TN
 * y lo guardamos en tn_orders, vinculándolo al usuario de la app
 * cuyo email coincida con el email del comprador.
 */

const TN_STORE_ID = process.env.TIENDANUBE_STORE_ID!;
const TN_ACCESS_TOKEN = process.env.TIENDANUBE_ACCESS_TOKEN!;
const TN_APP_ID = "28885";

const TN_HEADERS = {
  Authentication: `bearer ${TN_ACCESS_TOKEN}`,
  "User-Agent": `Mazoteca (integraciones@fedini.app) AppId/${TN_APP_ID}`,
  "Content-Type": "application/json",
};

interface TNOrderAddress {
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zipcode: string | null;
  phone: string | null;
}

interface TNOrderLineItem {
  id: number;
  variant_id: number | null;
  product_id: number | null;
  name: string;
  price: string;
  quantity: number;
  sku: string | null;
}

interface TNOrder {
  id: number;
  store_id: number;
  status: string;
  payment_status: string;
  shipping_status: string;
  gateway: string | null;
  currency: string;
  total: string;
  subtotal: string;
  discount: string;
  shipping_cost_owner: string;
  customer: {
    id: number | null;
    email: string;
    name: string | null;
  } | null;
  products: TNOrderLineItem[];
  shipping_address: TNOrderAddress | null;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
}

async function fetchTNOrder(orderId: number): Promise<TNOrder> {
  const url = `https://api.tiendanube.com/v1/${TN_STORE_ID}/orders/${orderId}`;
  const res = await fetch(url, {
    headers: TN_HEADERS,
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TN orders API ${res.status}: ${body}`);
  }
  return res.json() as Promise<TNOrder>;
}

export async function POST(req: NextRequest) {
  // Verificar webhook secret
  const tnSecret = process.env.TIENDANUBE_WEBHOOK_SECRET;
  if (tnSecret) {
    const signature = req.headers.get("x-linkedstore-token");
    if (signature !== tnSecret) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: { store_id?: number; event?: string; id?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, id: orderId } = body;
  if (!event || !orderId) {
    return NextResponse.json({ error: "Missing event or id" }, { status: 400 });
  }

  const isOrderEvent =
    event === "order/created" ||
    event === "order/updated" ||
    event === "order/paid";

  if (!isOrderEvent) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  console.log("[TN Orders Webhook]", event, orderId);

  try {
    // 1. Fetch full order from TN
    const order = await fetchTNOrder(orderId);

    const supabase = createAdminClient();

    // 2. Try to link to app user by email via auth.users
    const customerEmail = order.customer?.email ?? null;
    let userId: string | null = null;

    if (customerEmail) {
      // Use admin API to find user by email
      const { data: authData } = await supabase.auth.admin.listUsers();
      const matchingUser = authData?.users?.find(
        (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
      );
      if (matchingUser) {
        userId = matchingUser.id;
      }
    }

    // 3. Upsert order
    const { error } = await supabase.from("tn_orders").upsert(
      {
        id: order.id,
        user_id: userId,
        store_id: order.store_id,
        status: order.status,
        payment_status: order.payment_status,
        shipping_status: order.shipping_status,
        gateway: order.gateway,
        currency: order.currency,
        total: parseFloat(order.total) || null,
        subtotal: parseFloat(order.subtotal) || null,
        discount: parseFloat(order.discount) || null,
        shipping_cost: parseFloat(order.shipping_cost_owner) || null,
        customer_email: customerEmail,
        customer_name: order.customer?.name ?? null,
        line_items: order.products ?? [],
        shipping_address: order.shipping_address ?? null,
        tracking_number: order.tracking_number,
        tracking_url: order.tracking_url,
        tn_created_at: order.created_at,
        tn_updated_at: order.updated_at,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("[TN Orders Webhook] Upsert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[TN Orders Webhook] Order ${orderId} saved. User: ${userId ?? "unlinked"}`);
    return NextResponse.json({ ok: true, event, orderId, userId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[TN Orders Webhook error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
