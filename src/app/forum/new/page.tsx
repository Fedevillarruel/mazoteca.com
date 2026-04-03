"use client";

import { useState, useTransition, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { createForumThread } from "@/lib/actions/trading";

type Tab = "general" | "trading" | "memes";

export default function NewThreadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get("tab") ?? "general") as Tab;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tabLabel: Record<Tab, string> = {
    general: "General",
    trading: "Trading",
    memes: "Memes",
  };

  function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createForumThread({ tab, title, content });
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push(res.id ? `/forum/${res.id}` : `/forum?tab=${tab}`);
    });
  }

  return (
    <PageLayout>
      <Link
        href={`/forum?tab=${tab}`}
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a {tabLabel[tab]}
      </Link>

      <h1 className="text-2xl font-bold text-surface-50 mb-6">Nuevo hilo · {tabLabel[tab]}</h1>

      {tab === "trading" && (
        <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Para publicar una carta en Trading usá la opción &ldquo;Publicar en Trading&rdquo; desde tu <Link href="/album" className="underline">Álbum</Link>. Eso adjunta las fotos y crea la publicación automáticamente.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Crear un hilo de discusión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Título"
            placeholder="Escribí un título claro y descriptivo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
          />
          <Textarea
            label="Contenido"
            placeholder="Desarrollá tu tema, pregunta o discusión..."
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
          />
          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
          <p className="text-xs text-surface-400">
            Recordá ser respetuoso y seguir las reglas de la comunidad.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isPending}
            >
              <Send className="h-4 w-4" />
              {isPending ? "Publicando..." : "Publicar hilo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
