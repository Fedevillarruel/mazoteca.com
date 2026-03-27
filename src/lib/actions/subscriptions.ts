"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createSubscription as mpCreateSubscription,
  cancelSubscription as mpCancelSubscription,
  pauseSubscription as mpPauseSubscription,
} from "@/lib/services/mercadopago";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

export async function subscribeToPremium() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  // Check for existing active subscription
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("profile_id", user.id)
    .in("status", ["active", "paused"])
    .single();

  if (existingSub) {
    return { error: "Ya tenés una suscripción activa." };
  }

  const planId = process.env.MP_PREAPPROVAL_PLAN_ID;
  if (!planId) {
    console.error("[subscribeToPremium] Missing MP_PREAPPROVAL_PLAN_ID");
    return { error: "Configuración de pago no disponible." };
  }

  const idempotencyKey = `sub-${user.id}-${Date.now()}`;

  try {
    const mpResult = await mpCreateSubscription(
      {
        preapproval_plan_id: planId,
        payer_email: user.email || "",
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?status=callback`,
        reason: `${siteConfig.name} Premium`,
        external_reference: user.id,
      },
      idempotencyKey
    );

    // Create our subscription record
    await supabase.from("subscriptions").insert({
      profile_id: user.id,
      plan_id: "premium_monthly",
      mp_preapproval_id: mpResult.id,
      status: "pending",
    });

    // Redirect to MercadoPago checkout
    const initPoint = mpResult.init_point;
    if (initPoint) {
      redirect(initPoint);
    }

    return { error: "No se pudo generar el enlace de pago." };
  } catch (error) {
    console.error("[subscribeToPremium]", error);
    return { error: "Error al procesar la suscripción." };
  }
}

export async function cancelPremium() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, mp_preapproval_id, status")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .single();

  if (!subscription) {
    return { error: "No se encontró una suscripción activa." };
  }

  try {
    if (subscription.mp_preapproval_id) {
      await mpCancelSubscription(subscription.mp_preapproval_id);
    }

    await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    // Keep premium until current period ends (handled by webhook)
    // But update UI state
    revalidatePath("/premium");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("[cancelPremium]", error);
    return { error: "Error al cancelar la suscripción." };
  }
}

export async function pausePremium() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, mp_preapproval_id")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .single();

  if (!subscription) {
    return { error: "No se encontró una suscripción activa." };
  }

  try {
    if (subscription.mp_preapproval_id) {
      await mpPauseSubscription(subscription.mp_preapproval_id);
    }

    await supabase
      .from("subscriptions")
      .update({ status: "paused" })
      .eq("id", subscription.id);

    revalidatePath("/premium");
    return { success: true };
  } catch (error) {
    console.error("[pausePremium]", error);
    return { error: "Error al pausar la suscripción." };
  }
}

export async function resumePremium() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, mp_preapproval_id")
    .eq("profile_id", user.id)
    .eq("status", "paused")
    .single();

  if (!subscription) {
    return { error: "No se encontró una suscripción pausada." };
  }

  // Re-activating via MercadoPago API would require creating a new subscription
  // For now, update local status — the webhook will sync
  await supabase
    .from("subscriptions")
    .update({ status: "active" })
    .eq("id", subscription.id);

  revalidatePath("/premium");
  return { success: true };
}
