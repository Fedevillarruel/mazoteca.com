"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado.", user: null, supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    return { error: "No tenés permisos de administrador.", user: null, supabase };
  }

  return { error: null, user, supabase, role: profile.role };
}

// ---- User Management ----

export async function updateUserRole(
  targetUserId: string,
  role: "user" | "moderator" | "admin"
) {
  const { error: authError, user } = await requireAdmin();
  if (authError || !user) return { error: authError };

  // Only admins can promote to admin
  const supabaseForRole = await createClient();
  const { data: myProfile } = await supabaseForRole
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (role === "admin" && myProfile?.role !== "admin") {
    return { error: "Solo los admins pueden promover a admin." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) {
    console.error("[updateUserRole]", error);
    return { error: "Error al actualizar el rol." };
  }

  // Audit log
  await adminClient.from("audit_logs").insert({
    user_id: user.id,
    action: "update_role",
    entity_type: "profile",
    entity_id: targetUserId,
    metadata: { new_role: role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function banUser(targetUserId: string, reason: string) {
  const { error: authError, user } = await requireAdmin();
  if (authError || !user) return { error: authError };

  const adminClient = createAdminClient();

  // Disable user auth
  const { error: authDisableError } =
    await adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: "876000h", // ~100 years
    });

  if (authDisableError) {
    console.error("[banUser] auth disable error:", authDisableError);
    return { error: "Error al banear al usuario." };
  }

  // Update profile
  await adminClient
    .from("profiles")
    .update({ role: "user" }) // demote if mod
    .eq("id", targetUserId);

  // Cancel active listings
  await adminClient
    .from("marketplace_listings")
    .update({ status: "cancelled" })
    .eq("seller_id", targetUserId)
    .eq("status", "active");

  // Audit log
  await adminClient.from("audit_logs").insert({
    user_id: user.id,
    action: "ban_user",
    entity_type: "profile",
    entity_id: targetUserId,
    metadata: { reason },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function unbanUser(targetUserId: string) {
  const { error: authError, user } = await requireAdmin();
  if (authError || !user) return { error: authError };

  const adminClient = createAdminClient();

  const { error: authEnableError } =
    await adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: "none",
    });

  if (authEnableError) {
    console.error("[unbanUser]", authEnableError);
    return { error: "Error al desbanear al usuario." };
  }

  await adminClient.from("audit_logs").insert({
    user_id: user.id,
    action: "unban_user",
    entity_type: "profile",
    entity_id: targetUserId,
    metadata: {},
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// ---- Content Moderation ----

export async function resolveReport(
  reportId: string,
  action: "resolved" | "dismissed",
  moderatorNotes?: string
) {
  const { error: authError, user } = await requireAdmin();
  if (authError || !user) return { error: authError };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("reports")
    .update({
      status: action,
      moderator_id: user.id,
      moderator_notes: moderatorNotes || null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    console.error("[resolveReport]", error);
    return { error: "Error al resolver el reporte." };
  }

  await adminClient.from("audit_logs").insert({
    user_id: user.id,
    action: `report_${action}`,
    entity_type: "report",
    entity_id: reportId,
    metadata: { moderator_notes: moderatorNotes },
  });

  revalidatePath("/admin/reports");
  return { success: true };
}

export async function deleteContent(
  entityType: "listing" | "thread" | "post",
  entityId: string,
  reason: string
) {
  const { error: authError, user } = await requireAdmin();
  if (authError || !user) return { error: authError };

  const adminClient = createAdminClient();

  const tableMap: Record<string, string> = {
    listing: "marketplace_listings",
    thread: "forum_threads",
    post: "forum_posts",
  };

  const table = tableMap[entityType];
  if (!table) return { error: "Tipo de entidad inválido." };

  if (entityType === "listing") {
    await adminClient
      .from(table)
      .update({ status: "removed" })
      .eq("id", entityId);
  } else {
    await adminClient.from(table).delete().eq("id", entityId);
  }

  await adminClient.from("audit_logs").insert({
    user_id: user.id,
    action: "delete_content",
    entity_type: entityType,
    entity_id: entityId,
    metadata: { reason },
  });

  revalidatePath("/admin");
  return { success: true };
}

// ---- Card Management ----

export async function toggleCardBan(cardId: string) {
  const { error: authError, user } = await requireAdmin();
  if (authError || !user) return { error: authError };

  const adminClient = createAdminClient();

  const { data: card } = await adminClient
    .from("cards")
    .select("is_banned, name")
    .eq("id", cardId)
    .single();

  if (!card) return { error: "Carta no encontrada." };

  const newState = !card.is_banned;

  await adminClient
    .from("cards")
    .update({ is_banned: newState })
    .eq("id", cardId);

  await adminClient.from("audit_logs").insert({
    user_id: user.id,
    action: newState ? "ban_card" : "unban_card",
    entity_type: "card",
    entity_id: cardId,
    metadata: { card_name: card.name },
  });

  revalidatePath("/admin/cards");
  revalidatePath("/catalog");
  return { success: true, banned: newState };
}

export async function toggleCardRestriction(cardId: string) {
  const { error: authError, user } = await requireAdmin();
  if (authError || !user) return { error: authError };

  const adminClient = createAdminClient();

  const { data: card } = await adminClient
    .from("cards")
    .select("is_restricted, name")
    .eq("id", cardId)
    .single();

  if (!card) return { error: "Carta no encontrada." };

  const newState = !card.is_restricted;

  await adminClient
    .from("cards")
    .update({ is_restricted: newState })
    .eq("id", cardId);

  await adminClient.from("audit_logs").insert({
    user_id: user.id,
    action: newState ? "restrict_card" : "unrestrict_card",
    entity_type: "card",
    entity_id: cardId,
    metadata: { card_name: card.name },
  });

  revalidatePath("/admin/cards");
  revalidatePath("/catalog");
  return { success: true, restricted: newState };
}

// ---- Stats ----

export async function getAdminStats() {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const adminClient = createAdminClient();

  const [users, listings, trades, reports] = await Promise.all([
    adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    adminClient
      .from("marketplace_listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    adminClient
      .from("trades")
      .select("*", { count: "exact", head: true })
      .in("status", ["proposed", "negotiating"]),
    adminClient
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    totalUsers: users.count || 0,
    activeListings: listings.count || 0,
    pendingTrades: trades.count || 0,
    pendingReports: reports.count || 0,
  };
}
