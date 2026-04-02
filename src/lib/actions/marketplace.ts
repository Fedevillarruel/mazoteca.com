"use server";

import { createClient } from "@/lib/supabase/server";
import { listingSchema, offerSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendNotification } from "./notifications";

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debés iniciar sesión para publicar." };
  }

  const raw = {
    card_id: formData.get("card_id"),
    variant_id: formData.get("variant_id") || undefined,
    condition: formData.get("condition"),
    price: Number(formData.get("price")),
    quantity: Number(formData.get("quantity") || 1),
    description: formData.get("description") || undefined,
  };

  const parsed = listingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check listing limit for free tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    const { count } = await supabase
      .from("marketplace_listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "active");

    if ((count || 0) >= 5) {
      return {
        error: "Alcanzaste el límite de 5 publicaciones activas. Actualizá a Premium para publicar sin límites.",
      };
    }
  }

  const { data: listing, error } = await supabase
    .from("marketplace_listings")
    .insert({
      seller_id: user.id,
      card_id: parsed.data.card_id,
      variant_id: parsed.data.variant_id || null,
      condition: parsed.data.condition,
      price: parsed.data.price,
      quantity: parsed.data.quantity || 1,
      description: parsed.data.description || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createListing]", error);
    return { error: "Error al crear la publicación." };
  }

  revalidatePath("/singles");
  redirect(`/singles/${listing.id}`);
}

export async function makeOffer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debés iniciar sesión para hacer una oferta." };
  }

  const listingId = formData.get("listing_id") as string;
  if (!listingId) {
    return { error: "Falta el ID de la publicación." };
  }

  const raw = {
    amount: Number(formData.get("amount")),
    message: formData.get("message") || undefined,
  };

  const parsed = offerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check that user is not the seller
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select("seller_id, offers_count")
    .eq("id", listingId)
    .single();

  if (!listing) {
    return { error: "Publicación no encontrada." };
  }

  if (listing.seller_id === user.id) {
    return { error: "No podés hacer una oferta en tu propia publicación." };
  }

  const { error } = await supabase.from("marketplace_offers").insert({
    listing_id: listingId,
    buyer_id: user.id,
    amount: parsed.data.amount,
    message: parsed.data.message || null,
    status: "pending",
  });

  if (error) {
    console.error("[makeOffer]", error);
    return { error: "Error al enviar la oferta." };
  }

  // Increment offer count on listing
  await supabase
    .from("marketplace_listings")
    .update({ offers_count: (listing.offers_count || 0) + 1 })
    .eq("id", listingId);

  // Notify seller
  await sendNotification({
    userId: listing.seller_id,
    type: "offer_received",
    title: "Nueva oferta en tu publicación",
    message: `Recibiste una oferta de $${parsed.data.amount}.`,
    link: `/singles/${listingId}`,
    category: "singles",
  });

  revalidatePath(`/singles/${listingId}`);
  return { success: true };
}

export async function updateOfferStatus(
  offerId: string,
  status: "accepted" | "rejected"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  // Verify the user is the seller
  const { data: offer } = await supabase
    .from("marketplace_offers")
    .select("listing_id, buyer_id, marketplace_listings(seller_id)")
    .eq("id", offerId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((offer as any)?.marketplace_listings?.seller_id !== user.id) {
    return { error: "No tenés permiso para gestionar esta oferta." };
  }

  const { error } = await supabase
    .from("marketplace_offers")
    .update({ status })
    .eq("id", offerId);

  if (error) {
    console.error("[updateOfferStatus]", error);
    return { error: "Error al actualizar la oferta." };
  }

  // Notify buyer
  if (offer?.buyer_id) {
    const notifTitle = status === "accepted" ? "Oferta aceptada 🎉" : "Oferta rechazada";
    const notifMsg  = status === "accepted"
      ? "El vendedor aceptó tu oferta."
      : "El vendedor rechazó tu oferta.";

    await sendNotification({
      userId: offer.buyer_id,
      type: status === "accepted" ? "offer_accepted" : "offer_rejected",
      title: notifTitle,
      message: notifMsg,
      link: `/singles/${offer.listing_id}`,
      category: "singles",
    });
  }

  revalidatePath(`/singles/${offer?.listing_id}`);
  return { success: true };
}

export async function pauseListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("marketplace_listings")
    .update({ status: "paused" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) return { error: "Error al pausar la publicación." };

  revalidatePath("/singles");
  revalidatePath(`/singles/${listingId}`);
  return { success: true };
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("marketplace_listings")
    .update({ status: "removed" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) return { error: "Error al eliminar la publicación." };

  revalidatePath("/singles");
  redirect("/singles");
}
