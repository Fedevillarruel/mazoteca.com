"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X, AlertTriangle } from "lucide-react";
import { editForumPost, deleteForumPost } from "@/lib/actions/trading";

interface PostActionsProps {
  postId: string;
  threadId: string;
  initialContent: string;
  isAuthor: boolean;
}

export function PostActions({ postId, threadId, initialContent, isAuthor }: PostActionsProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "editing" | "confirming-delete">("idle");
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthor) return null;

  function handleEdit() {
    setContent(initialContent);
    setError(null);
    setMode("editing");
  }

  function handleCancelEdit() {
    setContent(initialContent);
    setMode("idle");
  }

  function handleSaveEdit() {
    if (!content.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await editForumPost({ postId, content, threadId });
      if (res.error) {
        setError(res.error);
      } else {
        setMode("idle");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteForumPost({ postId, threadId });
      if (res.error) {
        setError(res.error);
        setMode("idle");
      } else {
        router.refresh();
      }
    });
  }

  if (mode === "editing") {
    return (
      <div className="mt-3 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={isPending}
          className="text-sm"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={handleSaveEdit} disabled={!content.trim() || isPending}>
            <Check className="h-3.5 w-3.5" />
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isPending}>
            <X className="h-3.5 w-3.5" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "confirming-delete") {
    return (
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          ¿Eliminar respuesta?
        </span>
        <Button size="sm" variant="danger" onClick={handleDelete} disabled={isPending}>
          {isPending ? "Eliminando..." : "Sí, eliminar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setMode("idle")} disabled={isPending}>
          Cancelar
        </Button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex gap-1.5 mt-3">
      <Button size="sm" variant="ghost" onClick={handleEdit} className="text-surface-400 hover:text-surface-200 text-xs h-7 px-2">
        <Pencil className="h-3 w-3" />
        Editar
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setMode("confirming-delete")} className="text-surface-500 hover:text-red-400 text-xs h-7 px-2">
        <Trash2 className="h-3 w-3" />
        Eliminar
      </Button>
    </div>
  );
}
