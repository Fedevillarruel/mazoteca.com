"use client";

import { useState } from "react";
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

export function CommunityView({ threadsByTab }: CommunityViewProps) {
  const [tab, setTab] = useState<Tab>("general");

  const posts = threadsByTab[tab] ?? [];

  const tabConfig: { key: Tab; label: string; icon: typeof MessageSquare; emptyLabel: string }[] = [
    { key: "general", label: "General", icon: MessageSquare, emptyLabel: "General" },
    { key: "trading", label: "Trading", icon: RefreshCw, emptyLabel: "Trading" },
    { key: "memes", label: "Memes", icon: Smile, emptyLabel: "Memes" },
  ];

  return (
    <PageLayout title="Comunidad" description="Discutí, intercambiá y reíte con la comunidad de Kingdom TCG">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-surface-800 pb-4">
        {tabConfig.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? "bg-primary-500/15 text-primary-400 border border-primary-500/30"
                : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {threadsByTab[key]?.length > 0 && (
              <span className="text-[10px] bg-surface-700 text-surface-400 px-1.5 py-0.5 rounded-full">
                {threadsByTab[key].length}
              </span>
            )}
          </button>
        ))}
        <div className="flex-1" />
        <Link href="/forum/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo post
          </Button>
        </Link>
      </div>

      {/* Content */}
      {posts.length === 0 ? (
        <EmptyTab label={tabConfig.find((t) => t.key === tab)!.emptyLabel} tab={tab} />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`}>
              <Card variant="interactive">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="hidden sm:flex h-10 w-10 rounded-lg bg-surface-800 items-center justify-center shrink-0">
                    {post.pinned ? (
                      <Pin className="h-4 w-4 text-accent-400" />
                    ) : tab === "memes" ? (
                      <Smile className="h-4 w-4 text-yellow-400" />
                    ) : tab === "trading" ? (
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
