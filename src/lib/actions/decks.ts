"use server";

import { createClient } from "@/lib/supabase/server";
import { deckSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { gameConfig } from "@/config/site";

export async function createDeck(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debés iniciar sesión para crear un mazo." };
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    deck_type: formData.get("deckType"),
    is_public: formData.get("isPublic") === "true",
    tags: [],
  };

  const parsed = deckSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data: deck, error } = await supabase
    .from("decks")
    .insert({
      profile_id: user.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      deck_type: parsed.data.deck_type,
      is_public: parsed.data.is_public,
      is_valid: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createDeck]", error);
    return { error: "Error al crear el mazo. Intentá de nuevo." };
  }

  revalidatePath("/decks");
  redirect(`/decks/${deck.id}`);
}

export async function saveDeckCards(
  deckId: string,
  cards: { cardId: string; quantity: number }[],
  crownedId: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  // Verify ownership
  const { data: deck } = await supabase
    .from("decks")
    .select("id, profile_id")
    .eq("id", deckId)
    .single();

  if (!deck || deck.profile_id !== user.id) {
    return { error: "No tenés permiso para editar este mazo." };
  }

  // Delete existing cards
  await supabase.from("deck_cards").delete().eq("deck_id", deckId);

  // Insert new cards
  if (cards.length > 0) {
    const { error: insertError } = await supabase.from("deck_cards").insert(
      cards.map((c) => ({
        deck_id: deckId,
        card_id: c.cardId,
        quantity: c.quantity,
      }))
    );

    if (insertError) {
      console.error("[saveDeckCards]", insertError);
      return { error: "Error al guardar las cartas del mazo." };
    }
  }

  // Update crowned
  await supabase
    .from("decks")
    .update({ crowned_id: crownedId })
    .eq("id", deckId);

  revalidatePath(`/decks/${deckId}`);
  revalidatePath("/decks");

  return { success: true };
}

export async function deleteDeck(deckId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  const { error } = await supabase
    .from("decks")
    .delete()
    .eq("id", deckId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("[deleteDeck]", error);
    return { error: "Error al eliminar el mazo." };
  }

  revalidatePath("/decks");
  redirect("/decks");
}

export async function toggleDeckLike(deckId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debés iniciar sesión." };
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from("deck_likes")
    .select("deck_id")
    .eq("deck_id", deckId)
    .eq("profile_id", user.id)
    .single();

  if (existing) {
    await supabase
      .from("deck_likes")
      .delete()
      .eq("deck_id", deckId)
      .eq("profile_id", user.id);
  } else {
    await supabase
      .from("deck_likes")
      .insert({ deck_id: deckId, profile_id: user.id });
  }

  revalidatePath(`/decks/${deckId}`);
  return { liked: !existing };
}

// ─── Save deck from builder (uses card codes, not DB UUIDs) ──────────────────

export async function createDeckFromBuilder(params: {
  name: string;
  deckType: "combatants" | "strategy";
  isPublic: boolean;
  crownedCode: string | null;
  cards: { cardId: string; quantity: number }[];
  note?: string;
}): Promise<{ id?: string; error?: string; needsAuth?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  const name = params.name.trim();
  if (!name) return { error: "El nombre del mazo es requerido." };

  // Check deck limit for free users
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();
  if (!profile?.is_premium) {
    const { count } = await supabase
      .from("decks")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id);
    if ((count ?? 0) >= gameConfig.freeTier.maxDecks) {
      return { error: `Los usuarios gratuitos pueden crear hasta ${gameConfig.freeTier.maxDecks} mazo. ¡Pasate a Premium para tener mazos ilimitados!` };
    }
  }

  const slug =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now();

  // Store card codes as JSON in `description` field for builder-created decks
  const cardsMeta = JSON.stringify({
    cards: params.cards,
    crowned: params.crownedCode,
    note: params.note ?? null,
  });

  const { data, error } = await supabase
    .from("decks")
    .insert({
      profile_id: user.id,
      name,
      slug,
      description: cardsMeta,
      deck_type:   params.deckType,
      is_public:   params.isPublic,
      is_valid:    true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createDeckFromBuilder]", error);
    return { error: "Error al guardar el mazo." };
  }

  revalidatePath("/decks");
  return { id: data.id };
}
