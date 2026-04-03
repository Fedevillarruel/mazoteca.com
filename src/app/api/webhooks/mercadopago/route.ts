import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, getSubscription, mapMPStatus } from "@/lib/services/mercadopago";
import { createAdminClient } from "@/lib/supabase/server";

const MP_BASE_URL = "https://api.mercadopago.com";

async function getPayment(paymentId: string) {
  const res = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature") || "";
    const requestId = request.headers.get("x-request-id") || "";

    const payload = JSON.parse(body);
    const dataId = payload.data?.id;
    const { type, action } = payload;

    // Verify webhook signature — required if MP_WEBHOOK_SECRET is set (strongly recommended)
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (secret) {
      if (!dataId || !verifyWebhookSignature(signature, requestId, dataId, secret)) {
        console.error("[MP Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const supabase = createAdminClient();

    // ── Handle one-time PAYMENT (premium lifetime) ──────────────
    if (type === "payment") {
      console.log(`[MP Webhook] payment.${action} — ID: ${dataId}`);

      const payment = await getPayment(dataId);
      if (!payment) {
        console.error("[MP Webhook] Could not fetch payment:", dataId);
        return NextResponse.json({ ok: true }); // don't retry
      }

      // Only process approved payments for premium_lifetime
      // Strict check: metadata.type must explicitly be "premium_lifetime"
      const isPremiumPayment = payment.metadata?.type === "premium_lifetime";

      if (payment.status === "approved" && isPremiumPayment) {
        const userId = payment.metadata?.user_id ?? payment.external_reference;
        if (userId) {
          await supabase
            .from("profiles")
            .update({ is_premium: true })
            .eq("id", userId);

          // Log the payment
          await supabase.from("premium_payments").upsert({
            profile_id: userId,
            mp_payment_id: dataId.toString(),
            amount_ars: payment.transaction_amount,
            blue_rate: payment.metadata?.blue_rate,
            price_usd: payment.metadata?.price_usd,
            status: "approved",
            paid_at: payment.date_approved ?? new Date().toISOString(),
          }, { onConflict: "mp_payment_id" });

          console.log(`[MP Webhook] User ${userId} upgraded to Premium ✓`);
        }
      }

      return NextResponse.json({ ok: true });
    }

    // ── Handle SUBSCRIPTION (preapproval) events ─────────────────
    if (type !== "subscription_preapproval") {
      return NextResponse.json({ ok: true });
    }

    console.log(`[MP Webhook] ${type}.${action} — ID: ${dataId}`);

    const mpSubscription = await getSubscription(dataId);
    if (!mpSubscription) {
      console.error("[MP Webhook] Could not fetch subscription from MP");
      return NextResponse.json({ error: "Could not fetch MP subscription" }, { status: 400 });
    }

    const status = mapMPStatus(mpSubscription.status);

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, profile_id")
      .eq("mp_preapproval_id", dataId)
      .single();

    if (!subscription) {
      console.error("[MP Webhook] No subscription found for preapproval:", dataId);
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

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

    const isPremium = status === "active";
    await supabase
      .from("profiles")
      .update({ is_premium: isPremium })
      .eq("id", subscription.profile_id);

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