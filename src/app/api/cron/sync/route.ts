import { NextRequest, NextResponse } from "next/server";
import { syncAllProducts } from "@/lib/services/tiendanube-sync";

/**
 * GET /api/cron/sync
 * Called automatically by Vercel Cron Jobs every 15 minutes.
 * Secured via CRON_SECRET env variable (set in Vercel dashboard).
 *
 * Vercel calls this with:
 *   Authorization: Bearer <CRON_SECRET>
 */
export const maxDuration = 60; // seconds (Vercel hobby: 10s, pro: 300s)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Reject if no secret is configured or it doesn't match
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncAllProducts("cron");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/sync]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
