"use server";

import { createAdminClient } from "@/lib/supabase/server";

export interface AdminDashboardStats {
  totalUsers: number;
  newUsersLast7d: number;
  totalCards: number;
  premiumUsers: number;
  totalListings: number;
  activeListings: number;
  pendingReports: number;
  totalTrades: number;
  activeTrades: number;
  totalForumThreads: number;
  totalForumPosts: number;
  totalSinglesProducts: number;
  singlesInStock: number;
  lastSyncStatus: string | null;
  lastSyncAt: string | null;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createAdminClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsers,
    newUsers,
    totalCards,
    premiumUsers,
    totalListings,
    activeListings,
    pendingReports,
    totalTrades,
    activeTrades,
    totalThreads,
    totalPosts,
    singlesProducts,
    singlesInStock,
    lastSync,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("cards").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
    supabase.from("marketplace_listings").select("*", { count: "exact", head: true }),
    supabase.from("marketplace_listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("trades").select("*", { count: "exact", head: true }),
    supabase.from("trades").select("*", { count: "exact", head: true }).in("status", ["pending", "accepted"]),
    supabase.from("forum_threads").select("*", { count: "exact", head: true }),
    supabase.from("forum_posts").select("*", { count: "exact", head: true }),
    supabase.from("tiendanube_products").select("*", { count: "exact", head: true }),
    supabase.from("tiendanube_variants").select("*", { count: "exact", head: true }).gt("stock", 0),
    supabase.from("tiendanube_sync_log").select("status, started_at").order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  return {
    totalUsers: totalUsers.count ?? 0,
    newUsersLast7d: newUsers.count ?? 0,
    totalCards: totalCards.count ?? 0,
    premiumUsers: premiumUsers.count ?? 0,
    totalListings: totalListings.count ?? 0,
    activeListings: activeListings.count ?? 0,
    pendingReports: pendingReports.count ?? 0,
    totalTrades: totalTrades.count ?? 0,
    activeTrades: activeTrades.count ?? 0,
    totalForumThreads: totalThreads.count ?? 0,
    totalForumPosts: totalPosts.count ?? 0,
    totalSinglesProducts: singlesProducts.count ?? 0,
    singlesInStock: singlesInStock.count ?? 0,
    lastSyncStatus: lastSync.data?.status ?? null,
    lastSyncAt: lastSync.data?.started_at ?? null,
  };
}
