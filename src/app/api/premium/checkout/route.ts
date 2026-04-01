import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBlueDolarRate } from "@/lib/services/dolarapi";

const MP_BASE_URL = "https://api.mercadopago.com";
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!;
const PRICE_USD = Number(process.env.PREMIUM_PRICE_USD ?? 12);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mazoteca.com";

export async function POST() {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 2. Check if already premium
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, email")
      .eq("id", user.id)
      .single();

    if (profile?.is_premium) {
      return NextResponse.json({ error: "Ya sos usuario Premium" }, { status: 400 });
    }

    const email = profile?.email ?? user.email ?? "";

    // 3. Get blue dollar rate
    const blueRate = await getBlueDolarRate();
    const priceARS = Math.ceil(PRICE_USD * blueRate);

    // 4. Create Checkout Pro preference (one-time payment)
    const idempotencyKey = `premium-${user.id}-${Date.now()}`;

    const preferenceBody = {
      items: [
        {
          id: "premium-lifetime",
          title: "Mazoteca Premium — Pago único",
          description: `Acceso premium para siempre. Cotización dólar blue del día: $${blueRate} ARS/USD`,
          quantity: 1,
          unit_price: priceARS,
          currency_id: "ARS",
        },
      ],
      payer: { email },
      external_reference: user.id,
      back_urls: {
        success: `${APP_URL}/premium/success`,
        failure: `${APP_URL}/premium?error=payment_failed`,
        pending: `${APP_URL}/premium?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${APP_URL}/api/webhooks/mercadopago`,
      metadata: {
        user_id: user.id,
        type: "premium_lifetime",
        price_usd: PRICE_USD,
        blue_rate: blueRate,
        price_ars: priceARS,
      },
    };

    const mpRes = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(preferenceBody),
    });

    if (!mpRes.ok) {
      const err = await mpRes.json();
      console.error("[MP Checkout] Error creating preference:", err);
      return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 });
    }

    const preference = await mpRes.json();

    return NextResponse.json({
      preferenceId: preference.id,
      checkoutUrl: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
      priceARS,
      blueRate,
      priceUSD: PRICE_USD,
    });
  } catch (err) {
    console.error("[MP Checkout] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
