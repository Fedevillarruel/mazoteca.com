"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "./notifications";

export async function sendFriendRequest(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  if (targetUserId === user.id) {
    return { error: "No podés enviarte una solicitud a vos mismo." };
  }

  // Check if a friendship already exists in either direction
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`
    )
    .single();

  if (existing) {
    if (existing.status === "accepted") {
      return { error: "Ya son amigos." };
    }
    if (existing.status === "pending") {
      return { error: "Ya hay una solicitud pendiente." };
    }
    if (existing.status === "blocked") {
      return { error: "No es posible enviar una solicitud." };
    }
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: targetUserId,
    status: "pending",
  });

  if (error) {
    console.error("[sendFriendRequest]", error);
    return { error: "Error al enviar la solicitud." };
  }

  // Notify
  await sendNotification({
    userId: targetUserId,
    type: "friend_request",
    title: "Solicitud de amistad",
    message: "Recibiste una nueva solicitud de amistad.",
    link: "/friends",
    category: "friends",
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function respondToFriendRequest(
  friendshipId: string,
  action: "accepted" | "rejected"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: friendship } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id, status")
    .eq("id", friendshipId)
    .single();

  if (!friendship) return { error: "Solicitud no encontrada." };

  // Only the addressee can respond
  if (friendship.addressee_id !== user.id) {
    return { error: "No tenés permiso para responder a esta solicitud." };
  }

  if (friendship.status !== "pending") {
    return { error: "Esta solicitud ya fue respondida." };
  }

  const { error } = await supabase
    .from("friendships")
    .update({
      status: action,
      updated_at: new Date().toISOString(),
    })
    .eq("id", friendshipId);

  if (error) {
    console.error("[respondToFriendRequest]", error);
    return { error: "Error al responder la solicitud." };
  }

  if (action === "accepted") {
    await sendNotification({
      userId: friendship.requester_id,
      type: "friend_accepted",
      title: "Solicitud de amistad aceptada 🎉",
      message: "Tu solicitud de amistad fue aceptada.",
      link: "/friends",
      category: "friends",
    });
  }

  revalidatePath("/friends");
  return { success: true };
}

export async function removeFriend(friendshipId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: friendship } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("id", friendshipId)
    .single();

  if (!friendship) return { error: "Amistad no encontrada." };

  // Either party can remove
  if (
    friendship.requester_id !== user.id &&
    friendship.addressee_id !== user.id
  ) {
    return { error: "No tenés permiso para esta acción." };
  }

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    console.error("[removeFriend]", error);
    return { error: "Error al eliminar la amistad." };
  }

  revalidatePath("/friends");
  return { success: true };
}

export async function blockUser(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  // Remove existing friendship if any
  await supabase
    .from("friendships")
    .delete()
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`
    );

  // Create blocked relationship
  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: targetUserId,
    status: "blocked",
  });

  if (error) {
    console.error("[blockUser]", error);
    return { error: "Error al bloquear al usuario." };
  }

  revalidatePath("/friends");
  return { success: true };
}
