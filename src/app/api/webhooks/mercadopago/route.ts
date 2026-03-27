import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, getSubscription, mapMPStatus } from "@/lib/services/mercadopago";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature") || "";
    const requestId = request.headers.get("x-request-id") || "";

    // Verify webhook signature
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[MP Webhook] Missing MP_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const payload = JSON.parse(body);
    const dataId = payload.data?.id;

    if (!verifyWebhookSignature(signature, requestId, dataId, secret)) {
      console.error("[MP Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { type, action } = payload;

    // Only handle subscription (preapproval) events
    if (type !== "subscription_preapproval") {
      return NextResponse.json({ ok: true });
    }

    console.log(`[MP Webhook] ${type}.${action} — ID: ${dataId}`);

    // Fetch subscription details from MercadoPago
    const mpSubscription = await getSubscription(dataId);
    if (!mpSubscription) {
      console.error("[MP Webhook] Could not fetch subscription from MP");
      return NextResponse.json({ error: "Could not fetch MP subscription" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const status = mapMPStatus(mpSubscription.status);

    // Find our subscription record by mp_preapproval_id
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, profile_id")
      .eq("mp_preapproval_id", dataId)
      .single();

    if (!subscription) {
      console.error("[MP Webhook] No subscription found for preapproval:", dataId);
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Update subscription status
    await supabase
      .from("subscriptions")
      .update({
        status,
        mp_payer_id: mpSubscription.payer_id?.toString(),
        current_period_start: mpSubscription.date_created,
        current_period_end: mpSubscription.next_payment_date,
        ...(status === "cancelled" ? { cancelled_at: new Date().toISOString() } : {}),
      })
      .eq("id", subscription.id);

    // Update profile premium status
    const isPremium = status === "active";
    await supabase
      .from("profiles")
      .update({ is_premium: isPremium })
      .eq("id", subscription.profile_id);

    // Log the event
    await supabase.from("subscription_events").insert({
      subscription_id: subscription.id,
      event_type: `${type}.${action}`,
      mp_data: payload,
    });

    console.log(
      `[MP Webhook] Subscription ${subscription.id} updated: status=${status}, premium=${isPremium}`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[MP Webhook] Unhandled error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// MercadoPago sometimes sends GET for verification
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
