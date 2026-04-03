"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { replyToThread } from "@/lib/actions/trading";

export function ThreadReplyForm({ threadId }: { threadId: string }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!content.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await replyToThread({ threadId, content });
      if (res.error) {
        setError(res.error);
      } else {
        setContent("");
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-surface-100 mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-surface-400" />
          Escribí tu respuesta
        </h3>
        <Textarea
          placeholder="Compartí tu opinión, estrategia o comentario..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
        />
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        {sent && <p className="text-xs text-green-400 mt-2">✓ Respuesta publicada</p>}
        <div className="flex justify-end mt-3">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isPending}
          >
            <Send className="h-4 w-4" />
            {isPending ? "Publicando..." : "Publicar respuesta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
