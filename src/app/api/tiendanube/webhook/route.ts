import { NextRequest, NextResponse } from "next/server";
import { syncSingleProduct, deleteProduct } from "@/lib/services/tiendanube-sync";

/**
 * POST /api/tiendanube/webhook
 * Tiendanube sends webhooks on product create/update/delete.
 *
 * Setup in TN Admin → Apps → Your app → Webhooks:
 *   - product/created  → https://mazoteca.com/api/tiendanube/webhook
 *   - product/updated  → https://mazoteca.com/api/tiendanube/webhook
 *   - product/deleted  → https://mazoteca.com/api/tiendanube/webhook
 *
 * TN webhook payload:
 * {
 *   store_id: number,
 *   event: "product/created" | "product/updated" | "product/deleted",
 *   id: number          <- product id
 * }
 */
export async function POST(req: NextRequest) {
  // Verify TN webhook secret (optional but recommended)
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

  const { event, id: productId } = body;

  if (!event || !productId) {
    return NextResponse.json({ error: "Missing event or id" }, { status: 400 });
  }

  console.log("[TN Webhook]", event, productId);

  try {
    if (event === "product/deleted") {
      await deleteProduct(productId);
    } else if (
      event === "product/created" ||
      event === "product/updated"
    ) {
      await syncSingleProduct(productId);
    }

    return NextResponse.json({ ok: true, event, productId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[TN Webhook error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
