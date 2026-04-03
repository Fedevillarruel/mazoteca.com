import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/close-chats
 * Called by Vercel Cron (see vercel.json) daily.
 * Closes expired private chats and sets pending_rating_chat_id on both participants.
 */
export async function GET(request: Request) {
  // Verify cron secret — REQUIRED (set CRON_SECRET in env)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Call the DB function that closes expired chats
  const { error } = await supabase.rpc("close_expired_chats");
  if (error) {
    console.error("[cron/close-chats]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For each chat just closed (closed_at = now, both participants have no rating yet):
  // set pending_rating_chat_id on both participants
  const { data: justClosed } = await supabase
    .from("private_chats")
    .select("id, participant_a, participant_b")
    .gte("closed_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // closed in last hour
    .not("closed_at", "is", null);

  if (justClosed && justClosed.length > 0) {
    const updates = justClosed.flatMap((chat) => [
      supabase
        .from("profiles")
        .update({ pending_rating_chat_id: chat.id })
        .eq("id", chat.participant_a)
        .is("pending_rating_chat_id", null),
      supabase
        .from("profiles")
        .update({ pending_rating_chat_id: chat.id })
        .eq("id", chat.participant_b)
        .is("pending_rating_chat_id", null),
    ]);
    await Promise.all(updates);
  }

  return NextResponse.json({ ok: true, closed: justClosed?.length ?? 0 });
}
