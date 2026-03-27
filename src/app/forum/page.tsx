import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  MessageSquare,
  Pin,
  Eye,
  BookOpen,
  Swords,
  Lightbulb,
  Newspaper,
  Repeat,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Comunidad",
  description: "Foro de la comunidad de Kingdom TCG. Estrategias, discusiones, mazos y más.",
};

const categories = [
  { id: "1", name: "General", slug: "general", description: "Discusión general sobre Kingdom TCG", icon: MessageSquare, threads: 342, posts: 2891, color: "text-blue-400" },
  { id: "2", name: "Estrategias y Mazos", slug: "estrategias", description: "Compartí y discutí estrategias y mazos", icon: Swords, threads: 186, posts: 1543, color: "text-red-400" },
  { id: "3", name: "Novedades", slug: "novedades", description: "Noticias, expansiones y actualizaciones", icon: Newspaper, threads: 89, posts: 567, color: "text-green-400" },
  { id: "4", name: "Guías y Tutoriales", slug: "guias", description: "Guías para principiantes y avanzados", icon: Lightbulb, threads: 64, posts: 412, color: "text-amber-400" },
  { id: "5", name: "Intercambios y Ventas", slug: "intercambios", description: "Buscá y ofrecé cartas para intercambio", icon: Repeat, threads: 231, posts: 890, color: "text-purple-400" },
  { id: "6", name: "Lore y Mundo", slug: "lore", description: "Discusión sobre la historia y el mundo del juego", icon: BookOpen, threads: 45, posts: 234, color: "text-cyan-400" },
];

const recentThreads = [
  { id: "1", title: "¿Cuál es el meta actual después del último ban?", author: "MetaAnalyst", category: "Estrategias", replies: 34, views: 567, time: "Hace 30 min", pinned: true },
  { id: "2", title: "Spoilers de la próxima expansión: Reinos en Guerra", author: "NewsBot", category: "Novedades", replies: 89, views: 1234, time: "Hace 1 hora", pinned: true },
  { id: "3", title: "Guía completa: cómo armar tu primer mazo competitivo", author: "ProPlayer", category: "Guías", replies: 56, views: 890, time: "Hace 2 horas", pinned: false },
  { id: "4", title: "Busco intercambio de legendarias de Fuego", author: "TradeKing", category: "Intercambios", replies: 12, views: 234, time: "Hace 3 horas", pinned: false },
  { id: "5", title: "Mi colección completa de Coronados", author: "CollectorPro", category: "General", replies: 18, views: 321, time: "Hace 5 horas", pinned: false },
  { id: "6", title: "Teoría: el origen del reino de Oscuridad", author: "LoreMaster", category: "Lore", replies: 67, views: 789, time: "Hace 8 horas", pinned: false },
  { id: "7", title: "Combo roto: 3 cartas que ganan solas", author: "ComboKid", category: "Estrategias", replies: 45, views: 678, time: "Hace 12 horas", pinned: false },
];

export default function ForumPage() {
  return (
    <PageLayout
      title="Comunidad"
      description="El foro de Kingdom TCG: estrategias, discusiones, novedades y más"
    >
      {/* Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2">
          <Badge variant="primary" className="cursor-pointer px-3 py-1">
            Todo
          </Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">
            Recientes
          </Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">
            Populares
          </Badge>
        </div>
        <Link href="/forum/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo post
          </Button>
        </Link>
      </div>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-surface-100 mb-4">
          Categorías
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.id} href={`/forum/c/${cat.slug}`}>
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-surface-800 ${cat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-surface-100">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">
                          {cat.description}
                        </p>
                        <div className="flex gap-3 mt-2 text-xs text-surface-500">
                          <span>{cat.threads} temas</span>
                          <span>{cat.posts} posts</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Threads */}
      <section>
        <h2 className="text-lg font-semibold text-surface-100 mb-4">
          Discusiones recientes
        </h2>
        <div className="space-y-2">
          {recentThreads.map((thread) => (
            <Link key={thread.id} href={`/forum/t/${thread.id}`}>
              <Card variant="interactive">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className="hidden sm:flex h-10 w-10 rounded-lg bg-surface-800 items-center justify-center shrink-0">
                    {thread.pinned ? (
                      <Pin className="h-4 w-4 text-accent-400" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-surface-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {thread.pinned && (
                        <Badge variant="accent" className="text-[10px]">
                          Fijado
                        </Badge>
                      )}
                      <h3 className="text-sm font-medium text-surface-100 truncate">
                        {thread.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-surface-400">
                        por <span className="text-surface-300">{thread.author}</span>
                      </span>
                      <Badge variant="default" className="text-[10px]">
                        {thread.category}
                      </Badge>
                      <span className="text-xs text-surface-500">
                        {thread.time}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-surface-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {thread.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {thread.views}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
