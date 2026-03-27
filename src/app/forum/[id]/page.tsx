import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Flag,
  Clock,
  Pin,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Hilo #${id} — Foro`,
    description: "Hilo de discusión en el foro de Mazoteca.",
  };
}

const placeholderPosts = [
  {
    id: "p1",
    author: "DragonMaster99",
    content:
      "Estuve probando un combo con Llamarada Infernal + Escudo de Cenizas y parece bastante roto en el meta actual. ¿Alguien más lo probó? Me gustaría saber si hay algún counter efectivo.",
    likes: 12,
    isOp: true,
    date: "Hace 3 horas",
  },
  {
    id: "p2",
    author: "CrystalKnight",
    content:
      "Sí, lo enfrenté varias veces. La clave es usar cartas de agua con habilidades de control de turno. Tormenta Arcana le saca el timing completamente.",
    likes: 8,
    isOp: false,
    date: "Hace 2 horas",
  },
  {
    id: "p3",
    author: "StormWizard",
    content:
      "Coincido con Crystal. Además, si jugás con un mazo de estrategia que incluya Barrera Temporal, podés anular el combo por 2 turnos, que es suficiente para armar tu contraataque.",
    likes: 5,
    isOp: false,
    date: "Hace 1 hora",
  },
  {
    id: "p4",
    author: "ShadowHunter",
    content:
      "Yo le meto directamente Silencio Oscuro. Le desactiva la habilidad pasiva y el combo se cae solo. Es la carta más underrated del meta.",
    likes: 15,
    isOp: false,
    date: "Hace 45 minutos",
  },
];

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <PageLayout>
      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al foro
      </Link>

      {/* Thread Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="primary">Estrategias</Badge>
          <Badge variant="warning">
            <Pin className="h-3 w-3" />
            Fijado
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-surface-50 mb-2">
          Mejor combo de apertura en el meta actual
        </h1>
        <div className="flex items-center gap-4 text-sm text-surface-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Hace 3 horas
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {placeholderPosts.length} respuestas
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {placeholderPosts.reduce((s, p) => s + p.likes, 0)} likes
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4 mb-8">
        {placeholderPosts.map((post) => (
          <Card key={post.id} className={post.isOp ? "border-primary-500/30" : ""}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-surface-700">
                    <Image
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}`}
                      alt={post.author}
                      width={40}
                      height={40}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      href={`/profile/${post.author}`}
                      className="text-sm font-semibold text-surface-100 hover:text-primary-400"
                    >
                      {post.author}
                    </Link>
                    {post.isOp && (
                      <Badge variant="accent" className="text-[10px]">OP</Badge>
                    )}
                    <span className="text-xs text-surface-500">{post.date}</span>
                  </div>

                  <p className="text-sm text-surface-300 leading-relaxed mb-3">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-400 transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-200 transition-colors">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Responder
                    </button>
                    <button className="flex items-center gap-1 text-xs text-surface-400 hover:text-red-400 transition-colors">
                      <Flag className="h-3.5 w-3.5" />
                      Reportar
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-surface-100 mb-3">Escribí tu respuesta</h3>
          <Textarea
            placeholder="Compartí tu opinión, estrategia o consejo..."
            rows={4}
          />
          <div className="flex justify-end mt-3">
            <Button>
              <MessageSquare className="h-4 w-4" />
              Publicar respuesta
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
