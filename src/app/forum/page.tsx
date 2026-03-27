import type { Metadata } from "next";
import { CommunityView } from "./community-view";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Comunidad",
  description: "Foro de la comunidad de Kingdom TCG. General, Trading y Memes.",
};

export default async function ForumPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("forum_categories")
    .select("id, name, slug")
    .order("display_order");

  const catMap: Record<string, string> = {};
  for (const cat of categories ?? []) {
    catMap[cat.slug] = cat.id;
  }

  const tabSlugs = ["general", "trading", "memes"];
  const threadsByTab: Record<string, {
    id: string;
    title: string;
    author: string;
    replies: number;
    views: number;
    time: string;
    pinned: boolean;
    slug: string;
  }[]> = { general: [], trading: [], memes: [] };

  await Promise.all(
    tabSlugs.map(async (slug) => {
      const catId = catMap[slug];
      if (!catId) return;
      const { data: threads } = await supabase
        .from("forum_threads")
        .select("id, title, slug, is_pinned, views_count, replies_count, created_at, author:profiles(username)")
        .eq("category_id", catId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      threadsByTab[slug] = (threads ?? []).map((t) => {
        const author = Array.isArray(t.author) ? t.author[0] : t.author;
        const created = new Date(t.created_at);
        const diffMin = Math.floor((Date.now() - created.getTime()) / 60000);
        const timeLabel =
          diffMin < 60 ? `Hace ${diffMin} min` :
          diffMin < 1440 ? `Hace ${Math.floor(diffMin / 60)} horas` :
          `Hace ${Math.floor(diffMin / 1440)} días`;
        return {
          id: t.id,
          title: t.title,
          slug: t.slug,
          author: (author as { username: string } | null)?.username ?? "Anónimo",
          replies: t.replies_count,
          views: t.views_count,
          time: timeLabel,
          pinned: t.is_pinned,
        };
      });
    })
  );

  return <CommunityView threadsByTab={threadsByTab} />;
}
