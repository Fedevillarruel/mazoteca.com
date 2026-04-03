import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageLayout } from "@/components/layout/page-layout";
import { ChatView } from "./chat-view";

export const metadata: Metadata = { title: "Chat privado — Intercambio" };

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: chat } = await supabase
    .from("private_chats")
    .select(`
      id, created_at, closed_at, expires_at, trade_type,
      participant_a, participant_b,
      a_profile:profiles!private_chats_participant_a_fkey(id, username, display_name, avatar_url),
      b_profile:profiles!private_chats_participant_b_fkey(id, username, display_name, avatar_url)
    `)
    .eq("id", chatId)
    .single();

  if (!chat) notFound();
  if (chat.participant_a !== user.id && chat.participant_b !== user.id) {
    redirect("/trades");
  }

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, content, sender_id, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  const otherUserId = chat.participant_a === user.id ? chat.participant_b : chat.participant_a;
  const otherProfile = chat.participant_a === user.id
    ? (Array.isArray(chat.a_profile) ? chat.a_profile[0] : chat.a_profile)
    : (Array.isArray(chat.b_profile) ? chat.b_profile[0] : chat.b_profile);

  // Retype (unused vars removed)
  return (
    <PageLayout>
      <ChatView
        chatId={chatId}
        currentUserId={user.id}
        otherUserId={otherUserId}
        otherProfile={otherProfile as { id: string; username: string; display_name: string | null; avatar_url: string | null } | null}
        initialMessages={(messages ?? []) as { id: string; content: string; sender_id: string; created_at: string }[]}
        closedAt={chat.closed_at as string | null}
        expiresAt={chat.expires_at as string | null}
      />
    </PageLayout>
  );
}
