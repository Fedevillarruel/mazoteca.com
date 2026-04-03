"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { guardAction, sanitizeText, isValidCardCode, isValidUUID } from "@/lib/security";

// ─── Upload card photo ────────────────────────────────────────────────────────

export async function uploadCardPhoto(
  formData: FormData,
  side: "front" | "back"
): Promise<{ url?: string; error?: string }> {
  // Guard: auth + ban check + rate limit (max 20 uploads/min)
  const guard = await guardAction({ rateLimit: { limit: 20, windowMs: 60_000, key: "upload" } });
  if (!guard.ok) return { error: guard.error };

  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No se seleccionó archivo." };

  // Validate MIME type strictly — don't trust file.type alone, also check magic bytes via size
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) return { error: "Solo JPG, PNG o WebP." };

  // Validate extension matches MIME
  const extMap: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = extMap[file.type] ?? "jpg";

  if (file.size > 5 * 1024 * 1024) return { error: "Máximo 5MB." };
  if (file.size === 0) return { error: "El archivo está vacío." };

  // Use a safe, unpredictable path — no original filename (prevents path traversal)
  const path = `${guard.userId}/${Date.now()}_${side}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("card-photos")
    .upload(path, file, { upsert: false, contentType: file.type });
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
  // Guard: auth + ban check + rate limit (max 10 listings/hour)
  const guard = await guardAction({ rateLimit: { limit: 10, windowMs: 60 * 60_000, key: "listing" } });
  if (!guard.ok) return guard.status === 401 ? { needsAuth: true } : { error: guard.error };

  const supabase = await createClient();

  // Input validation
  if (!isValidCardCode(params.cardCode))
    return { error: "Código de carta inválido." };
  if (!["sale", "trade", "both"].includes(params.listingType))
    return { error: "Tipo de publicación inválido." };
  if (!params.photoFrontUrl || !params.photoBackUrl)
    return { error: "Las fotos de frente y dorso son obligatorias." };
  // Validate photo URLs belong to our Supabase storage (prevent external URL injection)
  const supabaseStorageBase = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (!params.photoFrontUrl.startsWith(supabaseStorageBase) ||
      !params.photoBackUrl.startsWith(supabaseStorageBase))
    return { error: "URLs de foto inválidas." };
  if (params.listingType !== "trade" && !params.price)
    return { error: "El precio es requerido para publicaciones de venta." };
  if (params.price !== undefined && (params.price < 0 || params.price > 10_000_000))
    return { error: "Precio fuera de rango." };

  const allowedConditions = ["mint", "near_mint", "excellent", "good", "fair", "poor"];
  const condition = params.condition && allowedConditions.includes(params.condition)
    ? params.condition : "near_mint";

  const note = params.note ? sanitizeText(params.note).slice(0, 500) : null;

  const { data, error } = await supabase
    .from("card_listings")
    .insert({
      seller_id:       guard.userId,
      card_code:       params.cardCode,
      listing_type:    params.listingType,
      price:           params.price ?? null,
      condition,
      note,
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
      .eq("id", guard.userId)
      .single();

    const threadTitle = sanitizeText(
      `[${params.listingType === "sale" ? "Venta" : params.listingType === "trade" ? "Intercambio" : "Venta/Intercambio"}] ${params.cardCode}${note ? ` — ${note}` : ""}`
    ).slice(0, 200);

    await supabase.from("forum_threads").insert({
      category_id:  cat.id,
      author_id:    guard.userId,
      title:        threadTitle,
      slug:         `listing-${data.id}`,
      content:      note ?? `Publicación de carta ${params.cardCode} por @${profile?.username ?? "usuario"}.`,
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
  const guard = await guardAction({ rateLimit: { limit: 10, windowMs: 60_000, key: "offer" } });
  if (!guard.ok) return guard.status === 401 ? { needsAuth: true } : { error: guard.error };

  // Input validation
  if (!isValidUUID(params.listingId)) return { error: "Publicación inválida." };
  if (!["buy", "trade"].includes(params.offerType)) return { error: "Tipo de oferta inválido." };
  if (params.offerCardCode && !isValidCardCode(params.offerCardCode))
    return { error: "Código de carta inválido." };
  if (params.offerPrice !== undefined && (params.offerPrice < 0 || params.offerPrice > 10_000_000))
    return { error: "Precio fuera de rango." };
  const note = params.note ? sanitizeText(params.note).slice(0, 300) : null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listing_offers")
    .insert({
      listing_id:      params.listingId,
      buyer_id:        guard.userId,
      offer_type:      params.offerType,
      offer_card_code: params.offerCardCode ?? null,
      offer_price:     params.offerPrice ?? null,
      note,
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
  const guard = await guardAction();
  if (!guard.ok) return guard.status === 401 ? { needsAuth: true } : { error: guard.error };
  if (!isValidUUID(offerId)) return { error: "Oferta inválida." };

  const supabase = await createClient();

  // Get offer + listing
  const { data: offer } = await supabase
    .from("listing_offers")
    .select("id, buyer_id, listing_id, offer_type, listing:card_listings(seller_id, card_code)")
    .eq("id", offerId)
    .single();

  if (!offer) return { error: "Oferta no encontrada." };
  const listing = Array.isArray(offer.listing) ? offer.listing[0] : offer.listing;
  if (!listing) return { error: "Publicación no encontrada." };
  if (listing.seller_id !== guard.userId) return { error: "No autorizado." };

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
  const guard = await guardAction({ rateLimit: { limit: 30, windowMs: 60_000, key: `chat:${chatId}` } });
  if (!guard.ok) return { error: guard.error };
  if (!isValidUUID(chatId)) return { error: "Chat inválido." };

  const safeContent = sanitizeText(content).slice(0, 1000);
  if (!safeContent.trim()) return { error: "El mensaje no puede estar vacío." };

  const supabase = await createClient();

  const { data: chat } = await supabase
    .from("private_chats")
    .select("participant_a, participant_b, closed_at, expires_at")
    .eq("id", chatId)
    .single();

  if (!chat) return { error: "Chat no encontrado." };
  if (chat.participant_a !== guard.userId && chat.participant_b !== guard.userId)
    return { error: "No autorizado." };
  if (chat.closed_at) return { error: "Este chat ya está cerrado." };
  if (new Date(chat.expires_at) < new Date()) {
    // Auto-close
    await supabase.from("private_chats").update({ closed_at: new Date().toISOString() }).eq("id", chatId);
    return { error: "El chat expiró (7 días)." };
  }

  const { error } = await supabase.from("chat_messages").insert({
    chat_id:   chatId,
    sender_id: guard.userId,
    content:   safeContent,
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
  const guard = await guardAction({ rateLimit: { limit: 5, windowMs: 60_000, key: `rate:${params.chatId}` } });
  if (!guard.ok) return { error: guard.error };
  if (!isValidUUID(params.chatId)) return { error: "Chat inválido." };
  if (![1, 2, 3, 4, 5].includes(params.score)) return { error: "Puntuación inválida." };
  const comment = params.comment ? sanitizeText(params.comment).slice(0, 500) : null;

  const supabase = await createClient();

  const { data: chat } = await supabase
    .from("private_chats")
    .select("participant_a, participant_b")
    .eq("id", params.chatId)
    .single();

  if (!chat) return { error: "Chat no encontrado." };

  const ratedId =
    chat.participant_a === guard.userId ? chat.participant_b : chat.participant_a;

  const { error } = await supabase.from("trade_ratings").insert({
    chat_id:   params.chatId,
    rater_id:  guard.userId,
    rated_id:  ratedId,
    score:     params.score,
    comment,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya calificaste este intercambio." };
    return { error: "Error al enviar la calificación." };
  }

  // Clear pending rating flag
  await supabase
    .from("profiles")
    .update({ pending_rating_chat_id: null })
    .eq("id", guard.userId);

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
  const guard = await guardAction({ rateLimit: { limit: 5, windowMs: 60 * 60_000, key: "deck-forum" } });
  if (!guard.ok) return guard.status === 401 ? { needsAuth: true } : { error: guard.error };

  if (!isValidUUID(params.deckId)) return { error: "Mazo inválido." };
  const deckName = sanitizeText(params.deckName).slice(0, 100);
  const deckType = sanitizeText(params.deckType).slice(0, 50);
  const note = params.note ? sanitizeText(params.note).slice(0, 500) : null;
  if (!deckName) return { error: "Nombre de mazo inválido." };

  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("forum_categories")
    .select("id")
    .eq("slug", "general")
    .single();

  if (!cat) return { error: "Categoría general no encontrada." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", guard.userId)
    .single();

  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      category_id: cat.id,
      author_id:   guard.userId,
      title:       `Mazo: ${deckName}`,
      slug:        `deck-${params.deckId}`,
      content:     note ?? `@${profile?.username ?? "usuario"} compartió su mazo "${deckName}" (${deckType}).`,
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
  const guard = await guardAction({ rateLimit: { limit: 5, windowMs: 60_000, key: "thread" } });
  if (!guard.ok) return guard.status === 401 ? { needsAuth: true } : { error: guard.error };

  const title = sanitizeText(params.title).slice(0, 200);
  const content = sanitizeText(params.content).slice(0, 10_000);
  if (!title || !content) return { error: "Título y contenido son requeridos." };
  if (!["general", "trading", "memes"].includes(params.tab)) return { error: "Categoría inválida." };

  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("forum_categories")
    .select("id")
    .eq("slug", params.tab)
    .single();

  if (!cat) return { error: "Categoría no encontrada." };

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) + "-" + Date.now();

  const { data, error } = await supabase
    .from("forum_threads")
    .insert({
      category_id: cat.id,
      author_id:   guard.userId,
      title,
      slug,
      content,
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
  const guard = await guardAction({ rateLimit: { limit: 10, windowMs: 60_000, key: "reply" } });
  if (!guard.ok) return guard.status === 401 ? { needsAuth: true } : { error: guard.error };

  if (!isValidUUID(params.threadId)) return { error: "Hilo inválido." };
  const content = sanitizeText(params.content).slice(0, 5_000);
  if (!content.trim()) return { error: "El contenido es requerido." };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      thread_id: params.threadId,
      author_id: guard.userId,
      content,
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

// ─── Edit a forum thread ─────────────────────────────────────────────────────

export async function editForumThread(params: {
  threadId: string;
  title: string;
  content: string;
}): Promise<{ error?: string }> {
  const guard = await guardAction();
  if (!guard.ok) return { error: guard.error };
  if (!isValidUUID(params.threadId)) return { error: "Hilo inválido." };

  const title = sanitizeText(params.title).slice(0, 200);
  const content = sanitizeText(params.content).slice(0, 10_000);
  if (!title || !content) return { error: "Título y contenido son requeridos." };

  const supabase = await createClient();

  const { data: thread } = await supabase
    .from("forum_threads")
    .select("author_id")
    .eq("id", params.threadId)
    .single();

  if (!thread || thread.author_id !== guard.userId) return { error: "No autorizado." };

  const { error } = await supabase
    .from("forum_threads")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", params.threadId);

  if (error) return { error: "Error al editar." };
  revalidatePath(`/forum/${params.threadId}`);
  return {};
}

// ─── Delete a forum thread ────────────────────────────────────────────────────

export async function deleteForumThread(threadId: string): Promise<{ error?: string }> {
  const guard = await guardAction();
  if (!guard.ok) return { error: guard.error };
  if (!isValidUUID(threadId)) return { error: "Hilo inválido." };

  const supabase = await createClient();

  const { data: thread } = await supabase
    .from("forum_threads")
    .select("author_id, category_id")
    .eq("id", threadId)
    .single();

  if (!thread || thread.author_id !== guard.userId) return { error: "No autorizado." };

  const { error } = await supabase.from("forum_threads").delete().eq("id", threadId);
  if (error) return { error: "Error al eliminar." };

  revalidatePath("/forum");
  return {};
}

// ─── Edit a forum post (reply) ────────────────────────────────────────────────

export async function editForumPost(params: {
  postId: string;
  content: string;
  threadId: string;
}): Promise<{ error?: string }> {
  const guard = await guardAction();
  if (!guard.ok) return { error: guard.error };
  if (!isValidUUID(params.postId) || !isValidUUID(params.threadId)) return { error: "IDs inválidos." };

  const content = sanitizeText(params.content).slice(0, 5_000);
  if (!content.trim()) return { error: "El contenido es requerido." };

  const supabase = await createClient();

  const { data: post } = await supabase
    .from("forum_posts")
    .select("author_id")
    .eq("id", params.postId)
    .single();

  if (!post || post.author_id !== guard.userId) return { error: "No autorizado." };

  const { error } = await supabase
    .from("forum_posts")
    .update({ content, is_edited: true, updated_at: new Date().toISOString() })
    .eq("id", params.postId);

  if (error) return { error: "Error al editar." };
  revalidatePath(`/forum/${params.threadId}`);
  return {};
}

// ─── Delete a forum post (reply) ─────────────────────────────────────────────

export async function deleteForumPost(params: {
  postId: string;
  threadId: string;
}): Promise<{ error?: string }> {
  const guard = await guardAction();
  if (!guard.ok) return { error: guard.error };
  if (!isValidUUID(params.postId) || !isValidUUID(params.threadId)) return { error: "IDs inválidos." };

  const supabase = await createClient();

  const { data: post } = await supabase
    .from("forum_posts")
    .select("author_id")
    .eq("id", params.postId)
    .single();

  if (!post || post.author_id !== guard.userId) return { error: "No autorizado." };

  const { error } = await supabase.from("forum_posts").delete().eq("id", params.postId);
  if (error) return { error: "Error al eliminar." };

  // Best-effort decrement replies count
  try {
    await supabase.rpc("decrement_thread_replies_count", { p_thread_id: params.threadId });
  } catch { /* ignore if rpc not available */ }
  revalidatePath(`/forum/${params.threadId}`);
  return {};
}

// ─── Like a forum post ────────────────────────────────────────────────────────

export async function likeForumPost(postId: string): Promise<{ liked?: boolean; error?: string }> {
  const guard = await guardAction({ rateLimit: { limit: 30, windowMs: 60_000, key: "like" } });
  if (!guard.ok) return { error: guard.error };
  if (!isValidUUID(postId)) return { error: "Post inválido." };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("forum_post_likes")
    .select("post_id")
    .eq("profile_id", guard.userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("forum_post_likes").delete()
      .eq("profile_id", guard.userId).eq("post_id", postId);
    await supabase
      .from("forum_posts")
      .update({ likes_count: supabase.rpc("decrement", { x: 1 }) as unknown as number })
      .eq("id", postId);
    return { liked: false };
  }

  await supabase.from("forum_post_likes").insert({ profile_id: guard.userId, post_id: postId });
  await supabase
    .from("forum_posts")
    .update({ likes_count: supabase.rpc("increment", { x: 1 }) as unknown as number })
    .eq("id", postId);

  return { liked: true };
}
