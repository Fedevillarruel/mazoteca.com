import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, MessageSquare, Clock, Pin, Eye,
  RefreshCw, Star, ShoppingBag, Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThreadReplyForm } from "./thread-reply-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("forum_threads").select("title").eq("id", id).single();
  return { title: data?.title ?? "Hilo — Foro", description: "Hilo de discusión en Mazoteca." };
}

export default async function ForumThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: thread } = await supabase
    .from("forum_threads")
    .select(`id, title, content, is_pinned, is_locked, views_count, replies_count,
      created_at, thread_type, listing_id, deck_id,
      category:forum_categories(name, slug),
      author:profiles(id, username, display_name, avatar_url, reputation, total_trades)`)
    .eq("id", id)
    .single();

  if (!thread) notFound();

  const { data: posts } = await supabase
    .from("forum_posts")
    .select(`id, content, likes_count, created_at, is_edited,
      author:profiles(id, username, display_name, avatar_url, reputation, total_trades)`)
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  // Fetch listing if trading thread
  type ListingRow = { card_code: string; listing_type: string; price: number | null; condition: string; note: string | null; photo_front_url: string | null; photo_back_url: string | null; status: string; seller_id: string };
  let listing: ListingRow | null = null;
  if (thread.thread_type === "trading" && thread.listing_id) {
    const { data: l } = await supabase
      .from("card_listings")
      .select("card_code, listing_type, price, condition, note, photo_front_url, photo_back_url, status, seller_id")
      .eq("id", thread.listing_id)
      .single();
    listing = l as ListingRow | null;
  }

  const threadAuthor = Array.isArray(thread.author) ? thread.author[0] : thread.author;
  const category = Array.isArray(thread.category) ? thread.category[0] : thread.category;
  const replies = posts ?? [];

  const timeAgo = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 60) return `Hace ${m} min`;
    if (m < 1440) return `Hace ${Math.floor(m / 60)}h`;
    return `Hace ${Math.floor(m / 1440)}d`;
  };

  type AuthorRow = { id: string; username: string; display_name: string | null; avatar_url: string | null; reputation: number; total_trades: number };

  function AuthorInfo({ author, isOp }: { author: AuthorRow; isOp?: boolean }) {
    const rep = Number(author.reputation);
    return (
      <div className="flex items-center gap-2.5 mb-3">
        <Link href={`/profile/${author.username}`} className="shrink-0">
          {author.avatar_url ? (
            <Image src={author.avatar_url} alt={author.username} width={36} height={36}
              className="h-9 w-9 rounded-lg object-cover ring-2 ring-surface-700" />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-primary-700 flex items-center justify-center text-sm font-bold text-white ring-2 ring-surface-700">
              {author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div>
          <div className="flex items-center gap-1.5">
            <Link href={`/profile/${author.username}`} className="text-sm font-semibold text-surface-100 hover:text-primary-400">
              {author.display_name || author.username}
            </Link>
            {isOp && <Badge variant="accent" className="text-[10px]">OP</Badge>}
          </div>
          {rep > 0 && (
            <p className="text-[10px] text-amber-400 flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5 fill-amber-400" />
              {rep.toFixed(0)}/100
              <span className="text-surface-500 ml-1">· {author.total_trades} trades</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <Link href={`/forum?tab=${category?.slug ?? "general"}`}
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6">
        <ArrowLeft className="h-4 w-4" /> Volver a {category?.name ?? "Comunidad"}
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {category && <Badge variant="primary">{category.name}</Badge>}
          {thread.thread_type === "deck" && <Badge variant="accent"><Layers className="h-3 w-3 mr-1" />Mazo</Badge>}
          {thread.thread_type === "trading" && <Badge variant="warning"><RefreshCw className="h-3 w-3 mr-1" />Trading</Badge>}
          {thread.is_pinned && <Badge variant="warning"><Pin className="h-3 w-3 mr-1" />Fijado</Badge>}
        </div>
        <h1 className="text-2xl font-bold text-surface-50 mb-3">{thread.title}</h1>
        <div className="flex items-center gap-4 text-sm text-surface-400 flex-wrap">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(thread.created_at)}</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{thread.views_count} vistas</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{replies.length} respuestas</span>
        </div>
      </div>

      {/* Trading listing card */}
      {listing && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex gap-2">
                {listing.photo_front_url && (
                  <div className="relative h-28 w-20 rounded-lg overflow-hidden border border-surface-700">
                    <Image src={listing.photo_front_url} alt="Frente" fill className="object-cover" unoptimized />
                    <span className="absolute bottom-1 left-1 text-[9px] bg-surface-950/80 text-surface-300 px-1 rounded">Frente</span>
                  </div>
                )}
                {listing.photo_back_url && (
                  <div className="relative h-28 w-20 rounded-lg overflow-hidden border border-surface-700">
                    <Image src={listing.photo_back_url} alt="Dorso" fill className="object-cover" unoptimized />
                    <span className="absolute bottom-1 left-1 text-[9px] bg-surface-950/80 text-surface-300 px-1 rounded">Dorso</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-sm text-surface-200">{listing.card_code}</span>
                  <Badge variant={listing.listing_type === "sale" ? "primary" : listing.listing_type === "trade" ? "accent" : "warning"}>
                    {listing.listing_type === "sale" ? "Venta" : listing.listing_type === "trade" ? "Intercambio" : "Venta / Intercambio"}
                  </Badge>
                  <Badge variant={listing.status === "active" ? "success" : "default"}>
                    {listing.status === "active" ? "Disponible" : listing.status}
                  </Badge>
                </div>
                {listing.price && (
                  <p className="text-lg font-bold text-primary-400 flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4" />${Number(listing.price).toLocaleString("es-AR")}
                  </p>
                )}
                <p className="text-xs text-surface-500 mt-1">Condición: {listing.condition}</p>
                {listing.note && <p className="text-sm text-surface-300 mt-2">{listing.note}</p>}
                {user && listing.status === "active" && listing.seller_id !== user.id && (
                  <div className="mt-3">
                    <Link href={`/trades/offer/${thread.listing_id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors">
                      <RefreshCw className="h-4 w-4" />
                      {listing.listing_type === "sale" ? "Comprar / Ofertar" : "Hacer oferta de intercambio"}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-4 mb-8">
        {/* OP */}
        <Card className="border-primary-500/20">
          <CardContent className="p-4 sm:p-5">
            <AuthorInfo author={threadAuthor as AuthorRow} isOp />
            <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap ml-0">{thread.content}</p>
          </CardContent>
        </Card>

        {replies.map((post) => {
          const postAuthor = Array.isArray(post.author) ? post.author[0] : post.author;
          return (
            <Card key={post.id}>
              <CardContent className="p-4 sm:p-5">
                <AuthorInfo author={postAuthor as AuthorRow} />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-surface-500">{timeAgo(post.created_at)}</span>
                  {post.is_edited && <span className="text-[10px] text-surface-600">(editado)</span>}
                </div>
                <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-surface-500 flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />{post.likes_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reply box */}
      {!thread.is_locked ? (
        user ? (
          <ThreadReplyForm threadId={id} />
        ) : (
          <Card><CardContent className="p-4 text-center text-sm text-surface-400">
            <Link href="/login" className="text-primary-400 hover:underline">Iniciá sesión</Link> para responder.
          </CardContent></Card>
        )
      ) : (
        <Card><CardContent className="p-4 text-center text-sm text-surface-500">
          Este hilo está cerrado.
        </CardContent></Card>
      )}
    </PageLayout>
  );
}
