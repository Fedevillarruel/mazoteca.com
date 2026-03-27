"use server";

import { createClient } from "@/lib/supabase/server";
import { tradeProposalSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createTrade(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debés iniciar sesión para proponer un intercambio." };
  }

  const receiverId = formData.get("receiver_id") as string;
  const message = (formData.get("message") as string) || undefined;

  // Parse items from JSON fields
  let proposerItems: Array<{
    card_id: string;
    variant_id?: string | null;
    quantity: number;
  }> = [];
  let requestedItems: Array<{
    card_id: string;
    variant_id?: string | null;
    quantity: number;
  }> = [];

  try {
    proposerItems = JSON.parse(formData.get("proposer_items") as string);
    requestedItems = JSON.parse(formData.get("requested_items") as string);
  } catch {
    return { error: "Formato de ítems inválido." };
  }

  const raw = {
    receiver_id: receiverId,
    proposer_items: proposerItems,
    requested_items: requestedItems,
    message,
  };

  const parsed = tradeProposalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (parsed.data.receiver_id === user.id) {
    return { error: "No podés intercambiar con vos mismo." };
  }

  // Check if the receiver exists
  const { data: receiver } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", parsed.data.receiver_id)
    .single();

  if (!receiver) {
    return { error: "El usuario destinatario no existe." };
  }

  // Create the trade
  const { data: trade, error: tradeError } = await supabase
    .from("trades")
    .insert({
      proposer_id: user.id,
      receiver_id: parsed.data.receiver_id,
      status: "proposed",
      proposer_message: parsed.data.message || null,
    })
    .select("id")
    .single();

  if (tradeError || !trade) {
    console.error("[createTrade]", tradeError);
    return { error: "Error al crear el intercambio." };
  }

  // Insert trade items — proposer's offered items
  const proposerItemsData = parsed.data.proposer_items.map((item) => ({
    trade_id: trade.id,
    user_id: user.id,
    card_id: item.card_id,
    variant_id: item.variant_id || null,
    quantity: item.quantity,
  }));

  // Insert trade items — requested items from receiver
  const requestedItemsData = parsed.data.requested_items.map((item) => ({
    trade_id: trade.id,
    user_id: parsed.data.receiver_id,
    card_id: item.card_id,
    variant_id: item.variant_id || null,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("trade_items")
    .insert([...proposerItemsData, ...requestedItemsData]);

  if (itemsError) {
    console.error("[createTrade items]", itemsError);
    // Rollback trade
    await supabase.from("trades").delete().eq("id", trade.id);
    return { error: "Error al agregar los ítems del intercambio." };
  }

  // Create notification for receiver
  await supabase.from("notifications").insert({
    user_id: parsed.data.receiver_id,
    type: "trade_proposed",
    title: "Nueva propuesta de intercambio",
    message: "Recibiste una nueva propuesta de intercambio.",
    link: `/trades?id=${trade.id}`,
  });

  revalidatePath("/trades");
  return { success: true, tradeId: trade.id };
}

export async function respondToTrade(
  tradeId: string,
  action: "accepted" | "rejected" | "cancelled"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: trade } = await supabase
    .from("trades")
    .select("proposer_id, receiver_id, status")
    .eq("id", tradeId)
    .single();

  if (!trade) return { error: "Intercambio no encontrado." };

  // Validation: only proposer can cancel, only receiver can accept/reject
  if (action === "cancelled" && trade.proposer_id !== user.id) {
    return { error: "Solo el proponente puede cancelar." };
  }

  if (
    (action === "accepted" || action === "rejected") &&
    trade.receiver_id !== user.id
  ) {
    return { error: "Solo el destinatario puede aceptar o rechazar." };
  }

  if (trade.status !== "proposed" && trade.status !== "negotiating") {
    return { error: "Este intercambio ya no puede modificarse." };
  }

  const updateData: Record<string, unknown> = {
    status: action,
    updated_at: new Date().toISOString(),
  };

  if (action === "accepted") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("trades")
    .update(updateData)
    .eq("id", tradeId);

  if (error) {
    console.error("[respondToTrade]", error);
    return { error: "Error al actualizar el intercambio." };
  }

  // Notify the other party
  const notifyUserId =
    action === "cancelled" ? trade.receiver_id : trade.proposer_id;

  const actionLabel =
    action === "accepted"
      ? "aceptó"
      : action === "rejected"
        ? "rechazó"
        : "canceló";

  await supabase.from("notifications").insert({
    user_id: notifyUserId,
    type: "trade_updated",
    title: "Intercambio actualizado",
    message: `Tu intercambio fue ${actionLabel}.`,
    link: `/trades?id=${tradeId}`,
  });

  revalidatePath("/trades");
  return { success: true };
}

export async function counterTrade(
  tradeId: string,
  message: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: trade } = await supabase
    .from("trades")
    .select("proposer_id, receiver_id, status")
    .eq("id", tradeId)
    .single();

  if (!trade) return { error: "Intercambio no encontrado." };

  if (trade.receiver_id !== user.id) {
    return { error: "Solo el destinatario puede contra-ofertar." };
  }

  if (trade.status !== "proposed") {
    return { error: "Este intercambio ya no puede negociarse." };
  }

  const { error } = await supabase
    .from("trades")
    .update({
      status: "negotiating",
      receiver_message: message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tradeId);

  if (error) {
    console.error("[counterTrade]", error);
    return { error: "Error al enviar la contra-oferta." };
  }

  await supabase.from("notifications").insert({
    user_id: trade.proposer_id,
    type: "trade_updated",
    title: "Contra-oferta recibida",
    message: "Recibiste una contra-oferta en tu intercambio.",
    link: `/trades?id=${tradeId}`,
  });

  revalidatePath("/trades");
  return { success: true };
}
