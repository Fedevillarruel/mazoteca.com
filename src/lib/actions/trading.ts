"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Upload card photo ────────────────────────────────────────────────────────

export async function uploadCardPhoto(
  formData: FormData,
  side: "front" | "back"
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No se seleccionó archivo." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return { error: "Solo JPG, PNG o WebP." };
  if (file.size > 5 * 1024 * 1024) return { error: "Máximo 5MB." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}_${side}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("card-photos")
    .upload(path, file, { upsert: false });
  if (uploadErr) return { error: "Error al subir la foto." };

  const { data: { publicUrl } } = supabase.storage
    .from("card-photos")
    .getPublicUrl(path);

  return { url: publicUrl };
}

// ─── Create trading listing (requires photos) ────────────────────────────────

export async function createTradingListing(params: {
  cardCode: string;
  listingType: "sale" | "trade" | "both";
  price?: number;
  condition?: string;
  note?: string;
  photoFrontUrl: string;
  photoBackUrl: string;
}): Promise<{ id?: string; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  if (!params.photoFrontUrl || !params.photoBackUrl)
    return { error: "Las fotos de frente y dorso son obligatorias." };
  if (params.listingType !== "trade" && !params.price)
    return { error: "El precio es requerido para publicaciones de venta." };

  const { data, error } = await supabase
    .from("card_listings")
    .insert({
      seller_id:       user.id,
      card_code:       params.cardCode,
      listing_type:    params.listingType,
      price:           params.price ?? null,
      condition:       params.condition ?? "near_mint",
      note:            params.note ?? null,
      status:          "active",
      photo_front_url: params.photoFrontUrl,
      photo_back_url:  params.photoBackUrl,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createTradingListing]", error);
    return { error: "Error al publicar la carta." };
  }

  // Publish as a forum thread in "trading" category
  const { data: cat } = await supabase
    .from("forum_categories")
    .select("id")
    .eq("slug", "trading")
    .single();

  if (cat) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    await supabase.from("forum_threads").insert({
      category_id:  cat.id,
      author_id:    user.id,
      title:        `[${params.listingType === "sale" ? "Venta" : params.listingType === "trade" ? "Intercambio" : "Venta/Intercambio"}] ${params.cardCode}${params.note ? ` — ${params.note}` : ""}`,
      slug:         `listing-${data.id}`,
      content:      params.note ?? `Publicación de carta ${params.cardCode} por @${profile?.username ?? "usuario"}.`,
      thread_type:  "trading",
      listing_id:   data.id,
    });
  }

  revalidatePath("/forum");
  revalidatePath("/trades");
  return { id: data.id };
}

// ─── Make offer on a listing ──────────────────────────────────────────────────

export async function makeOffer(params: {
  listingId: string;
  offerType: "buy" | "trade";
  offerCardCode?: string;
  offerPrice?: number;
  note?: string;
}): Promise<{ id?: string; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  const { data, error } = await supabase
    .from("listing_offers")
    .insert({
      listing_id:      params.listingId,
      buyer_id:        user.id,
      offer_type:      params.offerType,
      offer_card_code: params.offerCardCode ?? null,
      offer_price:     params.offerPrice ?? null,
      note:            params.note ?? null,
      status:          "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[makeOffer]", error);
    return { error: "Error al enviar la oferta." };
  }

  // Notify seller
  const { data: listing } = await supabase
    .from("card_listings")
    .select("seller_id, card_code")
    .eq("id", params.listingId)
    .single();

  if (listing) {
    await supabase.from("notifications").insert({
      user_id:  listing.seller_id,
      type:     "trade_offer",
      title:    "Nueva oferta recibida",
      body:     `Alguien hizo una oferta sobre tu carta ${listing.card_code}.`,
      link:     `/trades`,
      is_read:  false,
    });
  }

  revalidatePath("/trades");
  return { id: data.id };
}

// ─── Accept offer → open private chat ────────────────────────────────────────

export async function acceptOffer(
  offerId: string
): Promise<{ chatId?: string; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  // Get offer + listing
  const { data: offer } = await supabase
    .from("listing_offers")
    .select("id, buyer_id, listing_id, offer_type, listing:card_listings(seller_id, card_code)")
    .eq("id", offerId)
    .single();

  if (!offer) return { error: "Oferta no encontrada." };
  const listing = Array.isArray(offer.listing) ? offer.listing[0] : offer.listing;
  if (!listing) return { error: "Publicación no encontrada." };
  if (listing.seller_id !== user.id) return { error: "No autorizado." };

  // Mark offer accepted
  await supabase
    .from("listing_offers")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", offerId);

  // Reject all other offers for this listing
  await supabase
    .from("listing_offers")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("listing_id", offer.listing_id)
    .neq("id", offerId);

  // Open private chat (expires in 7 days)
  const { data: chat, error: chatErr } = await supabase
    .from("private_chats")
    .insert({
      offer_id:      offerId,
      participant_a: listing.seller_id,
      participant_b: offer.buyer_id,
      expires_at:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      trade_type:    offer.offer_type === "trade" ? "trade" : "sale",
    })
    .select("id")
    .single();

  if (chatErr) {
    console.error("[acceptOffer chat]", chatErr);
    return { error: "Error al abrir el chat." };
  }

  // Notify buyer
  await supabase.from("notifications").insert({
    user_id: offer.buyer_id,
    type:    "trade_accepted",
    title:   "¡Tu oferta fue aceptada!",
    body:    `Tu oferta sobre ${listing.card_code} fue aceptada. Podés chatear con el vendedor.`,
    link:    `/trades/chat/${chat.id}`,
    is_read: false,
  });

  revalidatePath("/trades");
  return { chatId: chat.id };
}

// ─── Send chat message ────────────────────────────────────────────────────────

export async function sendChatMessage(
  chatId: string,
  content: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: chat } = await supabase
    .from("private_chats")
    .select("participant_a, participant_b, closed_at, expires_at")
    .eq("id", chatId)
    .single();

  if (!chat) return { error: "Chat no encontrado." };
  if (chat.participant_a !== user.id && chat.participant_b !== user.id)
    return { error: "No autorizado." };
  if (chat.closed_at) return { error: "Este chat ya está cerrado." };
  if (new Date(chat.expires_at) < new Date()) {
    // Auto-close
    await supabase.from("private_chats").update({ closed_at: new Date().toISOString() }).eq("id", chatId);
    return { error: "El chat expiró (7 días)." };
  }

  const { error } = await supabase.from("chat_messages").insert({
    chat_id:   chatId,
    sender_id: user.id,
    content:   content.trim(),
  });

  if (error) return { error: "Error al enviar el mensaje." };
  return {};
}

// ─── Submit trade rating ──────────────────────────────────────────────────────

export async function submitTradeRating(params: {
  chatId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: chat } = await supabase
    .from("private_chats")
    .select("participant_a, participant_b")
    .eq("id", params.chatId)
    .single();

  if (!chat) return { error: "Chat no encontrado." };

  const ratedId =
    chat.participant_a === user.id ? chat.participant_b : chat.participant_a;

  const { error } = await supabase.from("trade_ratings").insert({
    chat_id:   params.chatId,
    rater_id:  user.id,
    rated_id:  ratedId,
    score:     params.score,
    comment:   params.comment ?? null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya calificaste este intercambio." };
    return { error: "Error al enviar la calificación." };
  }

  // Clear pending rating flag
  await supabase
    .from("profiles")
    .update({ pending_rating_chat_id: null })
    .eq("id", user.id);

  revalidatePath("/profile");
  return {};
}

// ─── Dismiss rating popup without rating ─────────────────────────────────────

export async function dismissRatingPrompt(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("profiles")
    .update({ pending_rating_chat_id: null })
    .eq("id", user.id);
}

// ─── Publish deck to General forum ───────────────────────────────────────────

export async function publishDeckToForum(params: {
  deckId: string;
  deckName: string;
  deckType: string;
  note?: string;
}): Promise<{ threadId?: string; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  const { data: cat } = await supabase
    .from("forum_categories")
    .select("id")
    .eq("slug", "general")
    .single();

  if (!cat) return { error: "Categoría general no encontrada." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      category_id: cat.id,
      author_id:   user.id,
      title:       `Mazo: ${params.deckName}`,
      slug:        `deck-${params.deckId}`,
      content:     params.note ?? `@${profile?.username ?? "usuario"} compartió su mazo "${params.deckName}" (${params.deckType}).`,
      thread_type: "deck",
      deck_id:     params.deckId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Este mazo ya fue publicado." };
    return { error: "Error al publicar el mazo." };
  }

  revalidatePath("/forum");
  return { threadId: data.id };
}

// ─── Create general forum thread ─────────────────────────────────────────────

export async function createForumThread(params: {
  tab: "general" | "trading" | "memes";
  title: string;
  content: string;
}): Promise<{ id?: string; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  if (!params.title.trim() || !params.content.trim())
    return { error: "Título y contenido son requeridos." };

  const { data: cat } = await supabase
    .from("forum_categories")
    .select("id")
    .eq("slug", params.tab)
    .single();

  if (!cat) return { error: "Categoría no encontrada." };

  const slug = params.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) + "-" + Date.now();

  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      category_id: cat.id,
      author_id:   user.id,
      title:       params.title.trim(),
      slug,
      content:     params.content.trim(),
      thread_type: "general",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createForumThread]", error);
    return { error: "Error al crear el hilo." };
  }

  revalidatePath("/forum");
  return { id: data.id };
}

// ─── Reply to thread ──────────────────────────────────────────────────────────

export async function replyToThread(params: {
  threadId: string;
  content: string;
}): Promise<{ id?: string; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  if (!params.content.trim()) return { error: "El contenido es requerido." };

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      thread_id: params.threadId,
      author_id: user.id,
      content:   params.content.trim(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[replyToThread]", error);
    return { error: "Error al publicar la respuesta." };
  }

  // Increment replies count
  await supabase.rpc("increment_thread_replies", { thread_id: params.threadId });

  revalidatePath(`/forum/${params.threadId}`);
  return { id: data.id };
}

// ─── Like a forum post ────────────────────────────────────────────────────────

export async function likeForumPost(postId: string): Promise<{ liked?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: existing } = await supabase
    .from("forum_post_likes")
    .select("post_id")
    .eq("profile_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("forum_post_likes").delete()
      .eq("profile_id", user.id).eq("post_id", postId);
    await supabase
      .from("forum_posts")
      .update({ likes_count: supabase.rpc("decrement", { x: 1 }) as unknown as number })
      .eq("id", postId);
    return { liked: false };
  }

  await supabase.from("forum_post_likes").insert({ profile_id: user.id, post_id: postId });
  await supabase
    .from("forum_posts")
    .update({ likes_count: supabase.rpc("increment", { x: 1 }) as unknown as number })
    .eq("id", postId);

  return { liked: true };
}
