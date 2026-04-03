"use client";

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
  RefreshCw,
  Smile,
} from "lucide-react";

type Tab = "general" | "trading" | "memes";

interface ThreadItem {
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  time: string;
  pinned: boolean;
  slug: string;
}

interface CommunityViewProps {
  threadsByTab: Record<string, ThreadItem[]>;
  activeTab: Tab;
}

function EmptyTab({ label, tab }: { label: string; tab: Tab }) {
  return (
    <div className="text-center py-16 text-surface-400">
      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
      <p className="text-base font-medium text-surface-300 mb-1">
        Todavía no hay posts en {label}
      </p>
      <p className="text-sm mb-6">
        ¡Sé el primero en publicar algo{tab === "trading" ? " sobre intercambios" : tab === "memes" ? " divertido" : ""}!
      </p>
      <Link href={`/forum/new?tab=${tab}`}>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Crear primer post
        </Button>
      </Link>
    </div>
  );
}

const TAB_CONFIG: { key: Tab; label: string; emptyLabel: string }[] = [
  { key: "general", label: "General", emptyLabel: "General" },
  { key: "trading", label: "Trading", emptyLabel: "Trading" },
  { key: "memes",   label: "Memes",   emptyLabel: "Memes"   },
];

export function CommunityView({ threadsByTab, activeTab }: CommunityViewProps) {
  const posts = threadsByTab[activeTab] ?? [];
  const tabMeta = TAB_CONFIG.find((t) => t.key === activeTab)!;

  return (
    <PageLayout title="Comunidad" description="Discutí, intercambiá y reíte con la comunidad de Kingdom TCG">
      {/* Header row: tab title + new post button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {activeTab === "trading" && <RefreshCw className="h-5 w-5 text-surface-400" />}
          {activeTab === "memes"   && <Smile className="h-5 w-5 text-surface-400" />}
          {activeTab === "general" && <MessageSquare className="h-5 w-5 text-surface-400" />}
          <h2 className="text-lg font-semibold text-surface-100">{tabMeta.label}</h2>
          {posts.length > 0 && (
            <span className="text-[11px] bg-surface-800 text-surface-400 px-2 py-0.5 rounded-full border border-surface-700">
              {posts.length}
            </span>
          )}
        </div>
        <Link href={`/forum/new?tab=${activeTab}`}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo post
          </Button>
        </Link>
      </div>

      {/* Content */}
      {posts.length === 0 ? (
        <EmptyTab label={tabMeta.emptyLabel} tab={activeTab} />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`}>
              <Card variant="interactive">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="hidden sm:flex h-10 w-10 rounded-lg bg-surface-800 items-center justify-center shrink-0">
                    {post.pinned ? (
                      <Pin className="h-4 w-4 text-accent-400" />
                    ) : activeTab === "memes" ? (
                      <Smile className="h-4 w-4 text-yellow-400" />
                    ) : activeTab === "trading" ? (
                      <RefreshCw className="h-4 w-4 text-blue-400" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-surface-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {post.pinned && <Badge variant="accent" className="text-[10px]">Fijado</Badge>}
                      <h3 className="text-sm font-medium text-surface-100 truncate">{post.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <span>por <span className="text-surface-300">{post.author}</span></span>
                      <span>·</span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-surface-500 shrink-0">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />{post.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />{post.views}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
