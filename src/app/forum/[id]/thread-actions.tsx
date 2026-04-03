"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X, AlertTriangle } from "lucide-react";
import { editForumThread, deleteForumThread } from "@/lib/actions/trading";

interface ThreadActionsProps {
  threadId: string;
  initialTitle: string;
  initialContent: string;
  isAuthor: boolean;
}

export function ThreadActions({ threadId, initialTitle, initialContent, isAuthor }: ThreadActionsProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "editing" | "confirming-delete">("idle");
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthor) return null;

  function handleEdit() {
    setTitle(initialTitle);
    setContent(initialContent);
    setError(null);
    setMode("editing");
  }

  function handleSaveEdit() {
    if (!title.trim() || !content.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await editForumThread({ threadId, title, content });
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
      const res = await deleteForumThread(threadId);
      if (res.error) {
        setError(res.error);
        setMode("idle");
      } else {
        router.push("/forum");
      }
    });
  }

  if (mode === "editing") {
    return (
      <div className="mt-4 space-y-3 border-t border-surface-700 pt-4">
        <p className="text-xs text-surface-400 font-medium uppercase tracking-wider">Editando publicación</p>
        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
        <Textarea
          label="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          disabled={isPending}
          className="text-sm"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={handleSaveEdit} disabled={!title.trim() || !content.trim() || isPending}>
            <Check className="h-3.5 w-3.5" />
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMode("idle")} disabled={isPending}>
            <X className="h-3.5 w-3.5" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "confirming-delete") {
    return (
      <div className="mt-4 flex items-center gap-2 flex-wrap border-t border-surface-700 pt-4">
        <span className="text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          ¿Eliminar este hilo? Esta acción no se puede deshacer.
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
    <div className="flex gap-1.5 mt-4 pt-3 border-t border-surface-700/50">
      <Button size="sm" variant="ghost" onClick={handleEdit} className="text-surface-400 hover:text-surface-200 text-xs h-7 px-2">
        <Pencil className="h-3 w-3" />
        Editar publicación
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setMode("confirming-delete")} className="text-surface-500 hover:text-red-400 text-xs h-7 px-2">
        <Trash2 className="h-3 w-3" />
        Eliminar hilo
      </Button>
    </div>
  );
}
