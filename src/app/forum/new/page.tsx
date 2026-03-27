"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";

const categoryOptions = [
  { value: "general", label: "General" },
  { value: "estrategias", label: "Estrategias" },
  { value: "noticias", label: "Noticias" },
  { value: "guias", label: "Guías" },
  { value: "intercambios", label: "Intercambios" },
  { value: "lore", label: "Lore" },
];

export default function NewThreadPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <PageLayout>
      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al foro
      </Link>

      <h1 className="text-2xl font-bold text-surface-50 mb-6">Nuevo hilo</h1>

      <Card>
        <CardHeader>
          <CardTitle>Crear un hilo de discusión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Categoría"
            options={categoryOptions}
          />
          <Input
            label="Título"
            placeholder="Escribí un título claro y descriptivo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label="Contenido"
            placeholder="Desarrollá tu tema, pregunta o discusión..."
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="text-xs text-surface-400">
            Recordá ser respetuoso y seguir las{" "}
            <Link href="/rules" className="text-primary-400 hover:underline">
              reglas de la comunidad
            </Link>
            .
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary">
              Vista previa
            </Button>
            <Button disabled={!title.trim() || !content.trim()}>
              <Send className="h-4 w-4" />
              Publicar hilo
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
