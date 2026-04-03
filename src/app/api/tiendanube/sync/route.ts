import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAllProducts } from "@/lib/services/tiendanube-sync";

/**
 * POST /api/tiendanube/sync
 * Manual full sync — requires admin auth
 *
 * Also usable as a cron job (add CRON_SECRET to env):
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: NextRequest) {
  // Allow cron via Bearer token
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Cron path — no user auth needed
    const result = await syncAllProducts("cron");
    return NextResponse.json(result);
  }

  // Otherwise require admin user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    return NextResponse.json({ error: "Sin permisos." }, { status: 403 });
  }

  const result = await syncAllProducts("manual");
  return NextResponse.json(result);
}

/**
 * GET /api/tiendanube/sync
 * Health check — no env info disclosed
 */
export async function GET() {
  return NextResponse.json({ status: "ok", message: "POST to trigger a sync" });
}
