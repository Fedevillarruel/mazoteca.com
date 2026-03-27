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
  MapPin,
  Calendar,
  Monitor,
  Package,
} from "lucide-react";

// ---- types ----
type Tab = "general" | "trading" | "memes";

// ---- mock data ----
const generalPosts = [
  { id: "1", title: "¿Cuál es el meta actual después del último parche?", author: "MetaAnalyst", replies: 34, views: 567, time: "Hace 30 min", pinned: true },
  { id: "2", title: "Teorías sobre el lore de Gringud — ¿quién es Erya?", author: "LoreMaster", replies: 67, views: 789, time: "Hace 2 horas", pinned: false },
  { id: "3", title: "Mi colección completa de Coronados 🎉", author: "CollectorPro", replies: 18, views: 321, time: "Hace 5 horas", pinned: false },
  { id: "4", title: "Guía completa: cómo armar tu primer mazo competitivo", author: "ProPlayer", replies: 56, views: 890, time: "Hace 8 horas", pinned: false },
  { id: "5", title: "Combo roto: 3 cartas que ganan solas (análisis)", author: "ComboKid", replies: 45, views: 678, time: "Hace 12 horas", pinned: false },
  { id: "6", title: "¿Vale la pena comprar el mazo de Erya?", author: "Newbie42", replies: 22, views: 410, time: "Hace 1 día", pinned: false },
];

const tradingOffers = [
  { id: "t1", title: "Ofrezco VIGGO DE FAHRIDOR foil por NEMEA normal", author: "TradeKing", type: "digital", location: "Buenos Aires", date: "26/03/2026", replies: 4 },
  { id: "t2", title: "Vendo IGNO DE ESTONBLEIZ Near Mint — $8.500", author: "SellMaster", type: "fisica", location: "Córdoba", date: "25/03/2026", replies: 2 },
  { id: "t3", title: "Busco ERYA DE GRINGUD en cualquier versión", author: "CollectorPro", type: "fisica", location: "Rosario", date: "24/03/2026", replies: 7 },
  { id: "t4", title: "Intercambio: tengo x3 LOBO GUKHAL, busco PANTERA CAMALEÓN", author: "GringudFan", type: "digital", location: "Online", date: "24/03/2026", replies: 1 },
  { id: "t5", title: "Vendo mazo completo Nemea de Goldinfeit — $12.000", author: "AquaKnight", type: "fisica", location: "Mendoza", date: "23/03/2026", replies: 9 },
  { id: "t6", title: "Ofrezco x4 MINEROD DE GOLDINFEIT por tropas nivel 3", author: "EarthBender", type: "digital", location: "Online", date: "22/03/2026", replies: 0 },
];

const memesPosts = [
  { id: "m1", title: "Cuando tu oponente tiene 3 Bludkut seguidos 💀", author: "MemeLord", replies: 89, views: 2341, time: "Hace 10 min", pinned: true },
  { id: "m2", title: "Yo esperando que lleguen los sobres de expansión", author: "PackHunter", replies: 44, views: 1200, time: "Hace 1 hora", pinned: false },
  { id: "m3", title: "Nivel de Kudú Real: carta promo que nadie puede obtener", author: "CrazyCollector", replies: 31, views: 876, time: "Hace 3 horas", pinned: false },
  { id: "m4", title: "Gringud players cuando ven una carta de Fahridor en la mesa", author: "ForestRuler", replies: 56, views: 1543, time: "Hace 6 horas", pinned: false },
  { id: "m5", title: "El \"economista\" del grupo comprando cartas para revender", author: "Scalper99", replies: 23, views: 654, time: "Hace 1 día", pinned: false },
];

export function CommunityView() {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <PageLayout title="Comunidad" description="Discutí, intercambiá y reíte con la comunidad de Kingdom TCG">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-surface-800 pb-4">
        <button
          onClick={() => setTab("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "general"
              ? "bg-primary-500/15 text-primary-400 border border-primary-500/30"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          General
        </button>
        <button
          onClick={() => setTab("trading")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "trading"
              ? "bg-primary-500/15 text-primary-400 border border-primary-500/30"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          Trading
        </button>
        <button
          onClick={() => setTab("memes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "memes"
              ? "bg-primary-500/15 text-primary-400 border border-primary-500/30"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
          }`}
        >
          <Smile className="h-4 w-4" />
          Memes
        </button>

        <div className="flex-1" />
        <Link href="/forum/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo post
          </Button>
        </Link>
      </div>

      {/* General tab */}
      {tab === "general" && (
        <section>
          <p className="text-sm text-surface-400 mb-5">
            Discutí estrategias, compartí ideas y conectá con otros jugadores.
          </p>
          <div className="space-y-3">
            {generalPosts.map((post) => (
              <Link key={post.id} href={`/forum/t/${post.id}`}>
                <Card variant="interactive">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="hidden sm:flex h-10 w-10 rounded-lg bg-surface-800 items-center justify-center shrink-0">
                      {post.pinned ? (
                        <Pin className="h-4 w-4 text-accent-400" />
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
                      <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post.replies}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.views}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trading tab */}
      {tab === "trading" && (
        <section>
          <p className="text-sm text-surface-400 mb-5">
            Ofertas de intercambio y venta publicadas por la comunidad. Marcadas como digital o física, con ubicación y fecha.
          </p>
          <div className="space-y-3">
            {tradingOffers.map((offer) => (
              <Link key={offer.id} href={`/forum/t/${offer.id}`}>
                <Card variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-surface-100 mb-2">{offer.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500">
                          <span>por <span className="text-surface-300">{offer.author}</span></span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {offer.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {offer.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {offer.replies} respuestas
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={offer.type === "digital" ? "info" : "default"}
                        className="shrink-0 flex items-center gap-1 text-[10px]"
                      >
                        {offer.type === "digital" ? (
                          <><Monitor className="h-3 w-3" /> Digital</>
                        ) : (
                          <><Package className="h-3 w-3" /> Física</>
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Memes tab */}
      {tab === "memes" && (
        <section>
          <p className="text-sm text-surface-400 mb-5">
            El lado divertido de Kingdom TCG. Compartí memes, momentos épicos y situaciones del juego.
          </p>
          <div className="space-y-3">
            {memesPosts.map((post) => (
              <Link key={post.id} href={`/forum/t/${post.id}`}>
                <Card variant="interactive">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="hidden sm:flex h-10 w-10 rounded-lg bg-surface-800 items-center justify-center shrink-0">
                      {post.pinned ? (
                        <Pin className="h-4 w-4 text-accent-400" />
                      ) : (
                        <Smile className="h-4 w-4 text-yellow-400" />
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
                      <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post.replies}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.views}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  );
}
