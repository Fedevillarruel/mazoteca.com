"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NotificationCategory, NotificationPreferences } from "@/lib/types/actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Insert a notification only if the target user has the category enabled.
 * Falls back to inserting if no preference row exists (default = true).
 */
export async function sendNotification({
  userId,
  type,
  title,
  message,
  link,
  category,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  category: NotificationCategory;
}) {
  const supabase = await createClient();

  // Check preference (select with a coalesce — if no row, default is true)
  const { data: pref } = await supabase
    .from("notification_preferences")
    .select(category)
    .eq("user_id", userId)
    .single();

  // If preference row exists and the category is explicitly false, skip
  if (pref && (pref as Record<string, unknown>)[category] === false) return;

  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    link: link ?? null,
  });
}

// ─── Public actions ───────────────────────────────────────────────────────────

export async function getNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { notifications: [], unreadCount: 0 };

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  revalidatePath("/notifications");
  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/notifications");
  return { success: true };
}

// ─── Notification preferences ─────────────────────────────────────────────────

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const defaults: NotificationPreferences = {
    trades: true,
    singles: true,
    friends: true,
    forum: true,
    system: true,
  };

  if (!user) return defaults;

  const { data } = await supabase
    .from("notification_preferences")
    .select("trades, singles, friends, forum, system")
    .eq("user_id", user.id)
    .single();

  if (!data) return defaults;

  return {
    trades: data.trades ?? true,
    singles: data.singles ?? true,
    friends: data.friends ?? true,
    forum: data.forum ?? true,
    system: data.system ?? true,
  };
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: user.id,
        ...prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[updateNotificationPreferences]", error);
    return { error: "Error al guardar las preferencias." };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  // Re-authenticate with current password to verify it
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "La contraseña actual es incorrecta." };
  }

  // Update to the new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("[updatePassword]", updateError);
    return { error: "Error al cambiar la contraseña. Intentá de nuevo." };
  }

  return { success: true };
}
