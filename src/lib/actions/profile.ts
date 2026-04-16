"use server";

import { createClient } from "@/lib/supabase/server";
import { profileSchema, physicalInventoryItemSchema, reportSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { gameConfig } from "@/config/site";

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

  // Optional preset avatar_url (not validated by profileSchema)
  const avatarUrl = formData.get("avatar_url") as string | null;

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const updateData: Record<string, unknown> = {
    display_name: parsed.data.display_name || null,
    bio: parsed.data.bio || null,
    location: parsed.data.location || null,
    website: parsed.data.website === "" ? null : parsed.data.website || null,
    digital_collection_visibility: parsed.data.digital_collection_visibility,
    physical_collection_visibility: parsed.data.physical_collection_visibility,
    decks_visibility: parsed.data.decks_visibility,
    updated_at: new Date().toISOString(),
  };
  if (avatarUrl) updateData.avatar_url = avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
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

/**
 * Toggle wishlist for album using card_code (string).
 * Stores in user_album.is_wishlisted column.
 */
export async function toggleAlbumWishlist(
  cardCode: string
): Promise<{ wishlisted?: boolean; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { needsAuth: true };

  // Check if already in user_album (owned)
  const { data: albumRow } = await supabase
    .from("user_album")
    .select("id, is_wishlisted")
    .eq("profile_id", user.id)
    .eq("card_code", cardCode)
    .maybeSingle();

  if (albumRow) {
    const next = !albumRow.is_wishlisted;
    const { error } = await supabase
      .from("user_album")
      .update({ is_wishlisted: next })
      .eq("id", albumRow.id);
    if (error) return { error: "Error al actualizar wishlist." };
    revalidatePath("/album");
    revalidatePath("/profile");
    return { wishlisted: next };
  } else {
    // Not owned — upsert with quantity=0 and is_wishlisted=true
    const { error } = await supabase
      .from("user_album")
      .upsert(
        { profile_id: user.id, card_code: cardCode, quantity: 0, is_wishlisted: true },
        { onConflict: "profile_id,card_code" }
      );
    if (error) return { error: "Error al agregar a wishlist." };
    revalidatePath("/album");
    revalidatePath("/profile");
    return { wishlisted: true };
  }
}

/**
 * Returns card codes the user has wishlisted (via user_album.is_wishlisted).
 */
export async function getAlbumWishlist(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("user_album")
    .select("card_code")
    .eq("profile_id", user.id)
    .eq("is_wishlisted", true);

  return (data ?? []).map((row: { card_code: string }) => row.card_code);
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
 * Agrega una carta al álbum digital del usuario (user_album).
 * Usa un toggle: si ya está, la quita; si no está, la agrega.
 * Retorna { added: true } o { removed: true }.
 */
export async function toggleAlbum(cardCode: string): Promise<{ added?: boolean; removed?: boolean; quantity?: number; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { needsAuth: true };

  // Verificar si ya existe
  const { data: existing } = await supabase
    .from("user_album")
    .select("id, quantity")
    .eq("profile_id", user.id)
    .eq("card_code", cardCode)
    .maybeSingle();

  if (existing) {
    // Quitar del álbum
    const { error } = await supabase
      .from("user_album")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: "Error al quitar la carta." };
    revalidatePath("/album");
    return { removed: true };
  } else {
    // Verificar límite de cartas para usuarios free
    const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single();
    if (!profile?.is_premium) {
      const { count } = await supabase.from("user_album").select("id", { count: "exact", head: true }).eq("profile_id", user.id);
      if ((count ?? 0) >= gameConfig.freeTier.maxAlbumCards) {
        return { error: `Los usuarios gratuitos pueden tener hasta ${gameConfig.freeTier.maxAlbumCards} cartas en el álbum. ¡Pasate a Premium!` };
      }
    }
    // Agregar al álbum con quantity=1
    const { error } = await supabase
      .from("user_album")
      .insert({ profile_id: user.id, card_code: cardCode, quantity: 1 });
    if (error) return { error: "Error al agregar la carta." };
    revalidatePath("/album");
    return { added: true, quantity: 1 };
  }
}

/**
 * Actualiza la cantidad de copias de una carta en el álbum.
 * quantity=0 elimina la carta del álbum.
 */
export async function setAlbumQuantity(cardCode: string, quantity: number): Promise<{ success?: boolean; removed?: boolean; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { needsAuth: true };
  if (quantity < 0) return { error: "Cantidad inválida." };

  if (quantity === 0) {
    const { error } = await supabase
      .from("user_album")
      .delete()
      .eq("profile_id", user.id)
      .eq("card_code", cardCode);
    if (error) return { error: "Error al quitar la carta." };
    revalidatePath("/album");
    return { removed: true };
  }

  // Check if card already exists (upsert)
  const { data: existing } = await supabase
    .from("user_album")
    .select("id")
    .eq("profile_id", user.id)
    .eq("card_code", cardCode)
    .maybeSingle();

  if (!existing) {
    // New card — check free tier album limit
    const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single();
    if (!profile?.is_premium) {
      const { count } = await supabase.from("user_album").select("id", { count: "exact", head: true }).eq("profile_id", user.id);
      if ((count ?? 0) >= gameConfig.freeTier.maxAlbumCards) {
        return { error: `Los usuarios gratuitos pueden tener hasta ${gameConfig.freeTier.maxAlbumCards} cartas en el álbum. ¡Pasate a Premium!` };
      }
    }
  }

  // Upsert
  const { error } = await supabase
    .from("user_album")
    .upsert(
      { profile_id: user.id, card_code: cardCode, quantity },
      { onConflict: "profile_id,card_code" }
    );
  if (error) return { error: "Error al actualizar la cantidad." };
  revalidatePath("/album");
  return { success: true };
}

/**
 * Crea una publicación de venta o intercambio de una carta.
 */
export async function createCardListing(params: {
  cardCode: string;
  listingType: "sale" | "trade" | "both";
  price?: number;
  condition?: string;
  quantity?: number;
  note?: string;
}): Promise<{ id?: string; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { needsAuth: true };
  if (params.listingType !== "trade" && !params.price) {
    return { error: "El precio es requerido para publicaciones de venta." };
  }

  const { data, error } = await supabase
    .from("card_listings")
    .insert({
      seller_id: user.id,
      card_code: params.cardCode,
      listing_type: params.listingType,
      price: params.price ?? null,
      condition: params.condition ?? "near_mint",
      quantity: params.quantity ?? 1,
      note: params.note ?? null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createCardListing]", error);
    return { error: "Error al publicar la carta." };
  }

  revalidatePath("/trades");
  return { id: data.id };
}

/** @deprecated Use toggleAlbum instead */
export async function addToAlbum(cardCode: string): Promise<{ success?: boolean; error?: string; needsAuth?: boolean }> {
  const result = await toggleAlbum(cardCode);
  if (result.needsAuth) return { needsAuth: true };
  if (result.error) return { error: result.error };
  return { success: true };
}

/**
 * Marca/desmarca una carta como favorita en el álbum del usuario.
 * La carta debe estar ya en el álbum (is_favorite solo aplica a cartas poseídas).
 */
export async function toggleFavorite(
  cardCode: string
): Promise<{ favorite?: boolean; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { needsAuth: true };

  const { data: existing } = await supabase
    .from("user_album")
    .select("id, is_favorite")
    .eq("profile_id", user.id)
    .eq("card_code", cardCode)
    .maybeSingle();

  if (!existing) return { error: "La carta no está en tu álbum." };

  const next = !existing.is_favorite;
  const { error } = await supabase
    .from("user_album")
    .update({ is_favorite: next })
    .eq("id", existing.id);

  if (error) return { error: "Error al actualizar favorito." };

  revalidatePath("/collection");
  revalidatePath("/album");
  return { favorite: next };
}

/**
 * Devuelve los códigos de carta marcados como favoritos por el usuario.
 * Si no está autenticado, devuelve un array vacío.
 */
export async function getFavorites(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("user_album")
    .select("card_code")
    .eq("profile_id", user.id)
    .eq("is_favorite", true);

  return (data ?? []).map((row: { card_code: string }) => row.card_code);
}
