"use client";

import { useState, useEffect, useTransition } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { submitTradeRating, dismissRatingPrompt } from "@/lib/actions/trading";

export function TradeRatingPrompt() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [ratedUsername, setRatedUsername] = useState<string>("el otro usuario");
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkPending() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("pending_rating_chat_id")
        .eq("id", user.id)
        .single();

      if (!profile?.pending_rating_chat_id) return;
      const pendingChatId = profile.pending_rating_chat_id as string;
      setChatId(pendingChatId);

      // Get the other participant
      const { data: chat } = await supabase
        .from("private_chats")
        .select("participant_a, participant_b")
        .eq("id", pendingChatId)
        .single();

      if (!chat) return;
      const otherId = chat.participant_a === user.id ? chat.participant_b : chat.participant_a;

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", otherId)
        .single();

      if (otherProfile) {
        setRatedUsername(otherProfile.display_name ?? otherProfile.username ?? "el otro usuario");
      }
    }

    checkPending();
  }, []);

  if (!chatId || submitted) return null;

  function handleSubmit() {
    if (!score || !chatId) return;
    startTransition(async () => {
      await submitTradeRating({ chatId, score: score as 1 | 2 | 3 | 4 | 5, comment: comment || undefined });
      setSubmitted(true);
    });
  }

  function handleDismiss() {
    startTransition(async () => {
      await dismissRatingPrompt();
      setChatId(null);
    });
  }

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-surface-500 hover:text-surface-200"
          disabled={isPending}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <p className="text-3xl mb-3">⭐</p>
          <h2 className="text-lg font-bold text-surface-50 mb-1">¿Cómo fue el intercambio?</h2>
          <p className="text-sm text-surface-400">
            Puntuá tu experiencia con <span className="text-surface-200 font-medium">{ratedUsername}</span>
          </p>
        </div>

        {/* Star selector */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setScore(s)}
              disabled={isPending}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-9 w-9 transition-colors ${
                  s <= (hovered || score)
                    ? "fill-amber-400 text-amber-400"
                    : "text-surface-600"
                }`}
              />
            </button>
          ))}
        </div>

        {score > 0 && (
          <p className="text-center text-sm text-surface-400 mb-4">
            {score === 1 && "Muy mala experiencia 😞"}
            {score === 2 && "Mala experiencia 😕"}
            {score === 3 && "Experiencia regular 😐"}
            {score === 4 && "Buena experiencia 😊"}
            {score === 5 && "¡Excelente experiencia! 🎉"}
          </p>
        )}

        {/* Optional comment */}
        <textarea
          className="w-full rounded-lg bg-surface-800 border border-surface-700 text-surface-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-500 resize-none mb-4"
          placeholder="Comentario opcional..."
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isPending}
          maxLength={300}
        />

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleDismiss}
            disabled={isPending}
          >
            Omitir
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!score || isPending}
          >
            {isPending ? "Enviando..." : "Enviar puntuación"}
          </Button>
        </div>
      </div>
    </div>
  );
}
