import Link from "next/link";
import {
  BookOpen,
  Swords,
  Store,
  MessageSquare,
  ArrowRight,
  Users,
  Shield,
  Crown,
  Scroll,
  Crosshair,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { allCards, cardStats, coronadoNames, type KTCGCard, type KTCGCategory } from "@/data/cards";

// Pick a diverse set of real cards for the showcase
const showcaseCards: KTCGCard[] = [
  allCards.find((c) => c.code === "KC001")!, // VIGGO DE FAHRIDOR
  allCards.find((c) => c.code === "KT024")!, // BÁRBARO DE FAHRIDOR
  allCards.find((c) => c.code === "KE005")!, // ATACANTE INESPERADO
  allCards.find((c) => c.code === "KP007")!, // DEFENSA MAESTRA
  allCards.find((c) => c.code === "KR002")!, // ROMPE FLANQUEOS
  allCards.find((c) => c.code === "KA015")!, // MARTILLÓMERANG
  allCards.find((c) => c.code === "KC004")!, // ERYA DE GRINGUD
  allCards.find((c) => c.code === "KT029")!, // GRANJERO DE FAHRIDOR
];

const categoryIcon: Record<KTCGCategory, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

const categoryColor: Record<KTCGCategory, string> = {
  Tropas: "text-blue-400 bg-blue-500/10",
  Coronados: "text-amber-400 bg-amber-500/10",
  Realeza: "text-purple-400 bg-purple-500/10",
  Estrategia: "text-emerald-400 bg-emerald-500/10",
  "Estrategia Primigenia": "text-rose-400 bg-rose-500/10",
  Arroje: "text-orange-400 bg-orange-500/10",
};

export default function HomePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-linear-to-b from-surface-950 via-surface-950 to-surface-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(128,64,255,0.15)_0%,transparent_65%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-surface-950 to-transparent" />

        <div className="relative mx-auto max-w-300 px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left — Copy */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-semibold tracking-wider uppercase mb-6">
                <Crown className="h-3.5 w-3.5" />
                Tu plataforma de TCG
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                <span className="text-surface-50">{cardStats.total} cartas.</span>
                <br />
                <span className="shimmer-text">Un solo lugar.</span>
              </h1>
              <p className="text-surface-300 text-lg leading-relaxed mb-8 max-w-lg">
                Explorá el catálogo completo de Kingdom TCG, armá tus mazos,
                comprá singles y conectá con la comunidad de jugadores.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/catalog">
                  <Button size="lg" className="btn-glow">
                    Explorar catálogo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="lg">
                    Crear cuenta gratis
                  </Button>
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-surface-800/60">
                <div className="flex items-center gap-1.5 text-xs text-surface-400">
                  <Shield className="h-3.5 w-3.5 text-primary-400" />
                  <span>100% gratuito</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-surface-400">
                  <Star className="h-3.5 w-3.5 text-accent-400" />
                  <span>{cardStats.coronados} coronados disponibles</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-surface-400">
                  <Store className="h-3.5 w-3.5 text-green-400" />
                  <span>Singles con envío</span>
                </div>
              </div>
            </div>

            {/* Right — Coronado cards grid */}
            <div className="hidden lg:grid grid-cols-2 gap-3 max-w-xs ml-auto">
              {coronadoNames.map((name, i) => {
                const card = allCards.find((c) => c.name === name.toUpperCase())!;
                const delays = ["", "delay-75", "delay-150", "delay-300"];
                return (
                  <Link key={card.code} href={`/catalog/${card.slug}`}>
                    <div className={`relative aspect-2.5/3.5 bg-linear-to-br from-surface-800 to-surface-900 rounded-2xl border border-surface-700/60 overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-500/30 animate-fade-in-up ${delays[i]}`}>
                      <div className="absolute inset-0 bg-linear-to-b from-transparent to-surface-950/60" />
                      <div className="absolute top-2 left-2 right-2 flex justify-center">
                        <div className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[9px] font-bold uppercase tracking-wide">
                          Coronado
                        </div>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                        <Crown className="h-9 w-9 text-amber-500/30 mb-2" />
                        <span className="text-xs font-bold text-surface-100 leading-tight">
                          {card.name}
                        </span>
                        <span className="text-[10px] text-surface-500 mt-1 font-mono">
                          {card.code}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ NUMBERS BAR ============ */}
      <section className="bg-surface-900/50 border-y border-surface-800/60">
        <div className="mx-auto max-w-300 px-4 sm:px-6 py-5">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
            {([
              ["Tropas", cardStats.tropas, "text-blue-400"],
              ["Coronados", cardStats.coronados, "text-amber-400"],
              ["Realeza", cardStats.realeza, "text-purple-400"],
              ["Estrategia", cardStats.estrategia, "text-emerald-400"],
              ["Primigenia", cardStats.estrategiaPrimigenia, "text-rose-400"],
              ["Arroje", cardStats.arroje, "text-orange-400"],
            ] as const).map(([label, count, color]) => (
              <div key={label} className="group">
                <p className={`text-2xl sm:text-3xl font-black ${color} tabular-nums`}>{count}</p>
                <p className="text-[11px] text-surface-500 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CARD CATEGORIES ============ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-300 px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest text-primary-400 uppercase mb-2">Tipos de carta</p>
            <h2 className="text-3xl font-extrabold text-surface-50 mb-2">
              Conocé las categorías
            </h2>
            <p className="text-surface-400 max-w-lg">
              Cada categoría tiene sus propias reglas de uso en el mazo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(categoryIcon) as [KTCGCategory, typeof Crown][]).map(
              ([cat, Icon]) => {
                const count = allCards.filter((c) => c.category === cat).length;
                const colors = categoryColor[cat];
                return (
                  <Link key={cat} href={`/catalog?category=${encodeURIComponent(cat)}`}>
                    <Card variant="interactive" className="h-full group">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${colors}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-surface-100 mb-0.5">{cat}</h3>
                          <p className="text-xs text-surface-400">
                            {count} cartas
                            {cat === "Tropas" && " · Niveles 1–4"}
                            {cat === "Coronados" && " · 11 acabados"}
                            {cat === "Arroje" && " · Niveles 1–3"}
                            {cat === "Estrategia Primigenia" && " · Poder elemental"}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-surface-600 group-hover:text-primary-400 transition-colors shrink-0 mt-0.5" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ============ SHOWCASE CARDS ============ */}
      <section className="py-20 sm:py-24 bg-surface-900/30 border-y border-surface-800/40">
        <div className="mx-auto max-w-300 px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest text-primary-400 uppercase mb-2">Del catálogo</p>
              <h2 className="text-3xl font-extrabold text-surface-50">
                Cartas destacadas
              </h2>
            </div>
            <Link href="/catalog">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Ver las {cardStats.total} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {showcaseCards.map((card) => {
              const Icon = categoryIcon[card.category];
              return (
                <Link key={card.code} href={`/catalog/${card.slug}`}>
                  <div className="group relative bg-linear-to-b from-surface-800 to-surface-900 border border-surface-700/50 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-primary-500/10 hover:border-primary-500/20">
                    <div className="aspect-2.5/3.5 flex flex-col items-center justify-center p-2 text-center">
                      <Icon className="h-7 w-7 text-surface-600 mb-2 group-hover:text-primary-400 transition-colors" />
                      <span className="text-[11px] font-semibold text-surface-300 leading-tight line-clamp-2 group-hover:text-surface-100 transition-colors">
                        {card.name}
                      </span>
                    </div>
                    <div className="px-2 pb-2 pt-0">
                      <p className="text-[9px] text-surface-600 truncate font-mono">
                        {card.code}
                      </p>
                      {card.level != null && (
                        <Badge variant="default" className="mt-1 text-[9px]">
                          Nv.{card.level}
                        </Badge>
                      )}
                      {card.card_type === "coronado" && (
                        <Badge variant="accent" className="mt-1 text-[9px]">
                          ♛
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-300 px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest text-primary-400 uppercase mb-2">Funcionalidades</p>
            <h2 className="text-3xl font-extrabold text-surface-50">¿Qué podés hacer?</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: BookOpen,
                title: "Catálogo completo",
                desc: `Las ${cardStats.total} cartas con filtros por tipo, nivel y facción.`,
                href: "/catalog",
                color: "text-blue-400 bg-blue-500/10",
              },
              {
                icon: Swords,
                title: "Deck Builder",
                desc: "33 tropas + 1 coronado + 30 estrategias. Validación automática de reglas.",
                href: "/decks",
                color: "text-primary-400 bg-primary-500/10",
              },
              {
                icon: Store,
                title: "Singles a la venta",
                desc: "Comprá singles físicos con envío a todo el país.",
                href: "/singles",
                color: "text-green-400 bg-green-500/10",
              },
              {
                icon: MessageSquare,
                title: "Foro de la comunidad",
                desc: "Discusiones de meta, estrategia y novedades del juego.",
                href: "/forum",
                color: "text-amber-400 bg-amber-500/10",
              },
              {
                icon: Users,
                title: "Colección y social",
                desc: "Registrá tu inventario digital y físico. Agregá amigos.",
                href: "/collection",
                color: "text-rose-400 bg-rose-500/10",
              },
              {
                icon: Crown,
                title: "Premium",
                desc: "Sin anuncios, perfil destacado y funciones exclusivas.",
                href: "/premium",
                color: "text-accent-400 bg-accent-500/10",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.title} href={f.href}>
                  <Card variant="interactive" className="h-full group">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color} transition-transform group-hover:scale-110`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-surface-100 mb-1 text-sm">{f.title}</h3>
                      <p className="text-xs text-surface-400 leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ DECK BUILDER CTA ============ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-300 px-4 sm:px-6">
          <div className="relative overflow-hidden bg-linear-to-br from-primary-950/80 via-surface-900 to-surface-900 border border-primary-800/30 rounded-3xl p-8 sm:p-12">
            {/* Background glow */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent-500/8 rounded-full blur-3xl" />

            <div className="relative flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1">
                <Badge variant="accent" className="mb-4">Deck Builder</Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-50 mb-3">
                  Armá tu mazo ahora
                </h2>
                <p className="text-surface-300 mb-6 max-w-lg text-sm leading-relaxed">
                  <strong className="text-surface-200">Combatientes:</strong> 1 coronado + 33 tropas (Nv1×12, Nv2×12, Nv3×6, Nv4×3).<br />
                  <strong className="text-surface-200">Estrategia:</strong> 30 cartas con validación automática de límites.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/decks/new">
                    <Button className="btn-glow">
                      <Swords className="h-4 w-4" />
                      Crear mazo
                    </Button>
                  </Link>
                  <Link href="/decks">
                    <Button variant="secondary">Ver mazos</Button>
                  </Link>
                </div>
              </div>
              {/* Coronados mini grid */}
              <div className="grid grid-cols-2 gap-2 shrink-0">
                {coronadoNames.map((name) => (
                  <div key={name} className="bg-surface-800/80 border border-surface-700/40 rounded-xl px-4 py-3 text-center hover:border-primary-500/30 transition-colors">
                    <Crown className="h-5 w-5 text-amber-500/50 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-surface-200 leading-tight">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="border-t border-surface-800/60 py-12 bg-surface-950/50">
        <div className="mx-auto max-w-300 px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-400" />
              </div>
              <h3 className="text-sm font-bold text-surface-100">Intercambios seguros</h3>
              <p className="text-xs text-surface-500">Sistema de reputación y moderación</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent-400" />
              </div>
              <h3 className="text-sm font-bold text-surface-100">Catálogo actualizado</h3>
              <p className="text-xs text-surface-500">Las {cardStats.total} cartas de la primera edición</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-sm font-bold text-surface-100">Hecho para la comunidad</h3>
              <p className="text-xs text-surface-500">Foro, amigos y deck sharing</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
