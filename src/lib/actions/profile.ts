"use server";

import { createClient } from "@/lib/supabase/server";
import { profileSchema, physicalInventoryItemSchema, reportSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const raw = {
    display_name: formData.get("display_name") || null,
    bio: formData.get("bio") || null,
    location: formData.get("location") || null,
    website: formData.get("website") || null,
    digital_collection_visibility:
      formData.get("digital_collection_visibility") || "public",
    physical_collection_visibility:
      formData.get("physical_collection_visibility") || "public",
    decks_visibility: formData.get("decks_visibility") || "public",
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name || null,
      bio: parsed.data.bio || null,
      location: parsed.data.location || null,
      website: parsed.data.website === "" ? null : parsed.data.website || null,
      digital_collection_visibility:
        parsed.data.digital_collection_visibility,
      physical_collection_visibility:
        parsed.data.physical_collection_visibility,
      decks_visibility: parsed.data.decks_visibility,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[updateProfile]", error);
    return { error: "Error al actualizar el perfil." };
  }

  // Fetch username for revalidation
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath(`/profile/${profile?.username}`);
  revalidatePath("/settings");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const file = formData.get("avatar") as File;
  if (!file) return { error: "No se seleccionó ningún archivo." };

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Solo se permiten imágenes JPG, PNG o WebP." };
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return { error: "La imagen no puede pesar más de 2MB." };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("[uploadAvatar]", uploadError);
    return { error: "Error al subir la imagen." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Add cache buster
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    console.error("[uploadAvatar update]", updateError);
    return { error: "Error al actualizar el avatar." };
  }

  revalidatePath("/settings");
  return { success: true, avatarUrl };
}

export async function addPhysicalCard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const raw = {
    card_id: formData.get("card_id"),
    variant_id: formData.get("variant_id") || null,
    quantity: Number(formData.get("quantity") || 1),
    condition: formData.get("condition"),
    notes: formData.get("notes") || undefined,
    is_for_trade: formData.get("is_for_trade") === "true",
    is_for_sale: formData.get("is_for_sale") === "true",
  };

  const parsed = physicalInventoryItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check if item already exists (same card, variant, condition)
  const { data: existing } = await supabase
    .from("physical_inventory")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("card_id", parsed.data.card_id)
    .eq("condition", parsed.data.condition)
    .is("variant_id", parsed.data.variant_id || null)
    .single();

  if (existing) {
    // Update quantity
    const { error } = await supabase
      .from("physical_inventory")
      .update({
        quantity: existing.quantity + parsed.data.quantity,
        is_for_trade: parsed.data.is_for_trade,
        is_for_sale: parsed.data.is_for_sale,
        notes: parsed.data.notes || null,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("[addPhysicalCard update]", error);
      return { error: "Error al actualizar la carta." };
    }
  } else {
    const { error } = await supabase.from("physical_inventory").insert({
      user_id: user.id,
      card_id: parsed.data.card_id,
      variant_id: parsed.data.variant_id || null,
      quantity: parsed.data.quantity,
      condition: parsed.data.condition,
      notes: parsed.data.notes || null,
      is_for_trade: parsed.data.is_for_trade,
      is_for_sale: parsed.data.is_for_sale,
    });

    if (error) {
      console.error("[addPhysicalCard insert]", error);
      return { error: "Error al agregar la carta." };
    }
  }

  revalidatePath("/collection");
  return { success: true };
}

export async function removePhysicalCard(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("physical_inventory")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[removePhysicalCard]", error);
    return { error: "Error al eliminar la carta." };
  }

  revalidatePath("/collection");
  return { success: true };
}

export async function toggleWishlist(cardId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .single();

  if (existing) {
    await supabase.from("wishlists").delete().eq("id", existing.id);
    revalidatePath("/collection");
    return { success: true, wishlisted: false };
  }

  await supabase.from("wishlists").insert({
    user_id: user.id,
    card_id: cardId,
    priority: 3,
  });

  revalidatePath("/collection");
  return { success: true, wishlisted: true };
}

export async function submitReport(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const raw = {
    entity_type: formData.get("entity_type"),
    entity_id: formData.get("entity_id"),
    reported_user_id: formData.get("reported_user_id") || null,
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
  };

  const parsed = reportSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    entity_type: parsed.data.entity_type,
    entity_id: parsed.data.entity_id,
    reported_user_id: parsed.data.reported_user_id || null,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
    status: "pending",
  });

  if (error) {
    console.error("[submitReport]", error);
    return { error: "Error al enviar el reporte." };
  }

  return { success: true };
}

/**
 * Agrega 1 carta al álbum digital del usuario (digital_inventory).
 * Recibe el `code` de la carta (ej: "KT001") y busca el UUID internamente.
 * Si ya existe, incrementa la cantidad en 1.
 */
export async function addToAlbum(cardCode: string): Promise<{ success?: boolean; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { needsAuth: true };

  // Buscar el UUID de la carta por su code
  const { data: card } = await supabase
    .from("cards")
    .select("id")
    .eq("code", cardCode)
    .single();

  if (!card) return { error: "Carta no encontrada." };

  const { data: existing } = await supabase
    .from("digital_inventory")
    .select("id, quantity")
    .eq("profile_id", user.id)
    .eq("card_id", card.id)
    .is("variant_id", null)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("digital_inventory")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
    if (error) return { error: "Error al actualizar la carta." };
  } else {
    const { error } = await supabase
      .from("digital_inventory")
      .insert({ profile_id: user.id, card_id: card.id, quantity: 1 });
    if (error) return { error: "Error al agregar la carta." };
  }

  revalidatePath("/album");
  return { success: true };
}
