"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendChatMessage } from "@/lib/actions/trading";
import { createClient } from "@/lib/supabase/client";

type Message = { id: string; content: string; sender_id: string; created_at: string };
type Profile = { id: string; username: string; display_name: string | null; avatar_url: string | null };

interface Props {
  chatId: string;
  currentUserId: string;
  otherUserId: string;
  otherProfile: Profile | null;
  initialMessages: Message[];
  closedAt: string | null;
  expiresAt: string | null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function ExpiryBadge({ expiresAt, closedAt }: { expiresAt: string | null; closedAt: string | null }) {
  if (closedAt) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-surface-500 bg-surface-800 rounded-full px-3 py-1">
        <Lock className="h-3 w-3" />
        Chat cerrado el {formatDate(closedAt)}
      </div>
    );
  }
  if (!expiresAt) return null;
  // Calculate outside pure render by receiving pre-calculated prop
  return <ExpiryCountdown expiresAt={expiresAt} />;
}

function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [daysLeft, setDaysLeft] = useState(() => {
    const ms = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  });

  useEffect(() => {
    const update = () => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setDaysLeft(Math.max(0, Math.ceil(ms / 86_400_000)));
    };
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <div className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1 ${daysLeft <= 1 ? "text-red-400 bg-red-400/10" : "text-surface-400 bg-surface-800"}`}>
      <Clock className="h-3 w-3" />
      {daysLeft > 0 ? `Cierra en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}` : "Cierra hoy"}
    </div>
  );
}

export function ChatView({
  chatId,
  currentUserId,
  otherProfile,
  initialMessages,
  closedAt,
  expiresAt,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isClosed = Boolean(closedAt);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isClosed) return;
    setSendError(null);
    const optimisticMsg: Message = {
      id: `opt-${Date.now()}`,
      content: trimmed,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");
    startTransition(async () => {
      const res = await sendChatMessage(chatId, trimmed);
      if (res.error) {
        setSendError(res.error);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-surface-800 shrink-0">
        <Link href="/trades" className="text-surface-400 hover:text-surface-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {otherProfile?.avatar_url ? (
          <Image src={otherProfile.avatar_url} alt={otherProfile.username} width={36} height={36} className="rounded-full shrink-0" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-surface-700 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-surface-100 truncate">
            {otherProfile?.display_name ?? otherProfile?.username ?? "Usuario"}
          </p>
          <p className="text-xs text-surface-500">Chat de intercambio</p>
        </div>
        <ExpiryBadge expiresAt={expiresAt} closedAt={closedAt} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-12 text-surface-500 text-sm">
            No hay mensajes aún. ¡Empezá la conversación!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMe
                    ? "bg-primary-600 text-white rounded-br-sm"
                    : "bg-surface-800 text-surface-100 rounded-bl-sm"
                }`}
              >
                <p className="wrap-break-word">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-primary-200" : "text-surface-500"} text-right`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isClosed ? (
        <div className="pt-4 border-t border-surface-800 text-center text-sm text-surface-500">
          <Lock className="h-4 w-4 inline-block mr-1" />
          Este chat está cerrado. Los intercambios se completan en persona o por cuenta propia.
        </div>
      ) : (
        <div className="pt-3 border-t border-surface-800 shrink-0">
          {sendError && (
            <p className="text-xs text-red-400 mb-2">{sendError}</p>
          )}
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-500"
              placeholder="Escribí un mensaje..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={isPending}
              maxLength={1000}
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!text.trim() || isPending}
              className="shrink-0 px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
