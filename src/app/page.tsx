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

const levelLabel: Record<number, string> = {
  1: "Nv. 1",
  2: "Nv. 2",
  3: "Nv. 3",
  4: "Nv. 4",
};

export default function HomePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-surface-800">
        <div className="absolute inset-0 bg-linear-to-b from-surface-950 via-surface-950 to-surface-900" />
        {/* Subtle radial accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary-500/[0.03] rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <div>
              <p className="text-sm font-medium tracking-widest text-primary-400 uppercase mb-4">
                Kingdom TCG
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-surface-50 leading-tight mb-5">
                {cardStats.total} cartas.{" "}
                <span className="text-primary-400">Un solo lugar.</span>
              </h1>
              <p className="text-surface-300 text-lg leading-relaxed mb-8 max-w-lg">
                Explorá el catálogo completo de Kingdom TCG, armá tus mazos
                de 33 tropas + 1 coronado, intercambiá singles y conectá con
                la comunidad.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/catalog">
                  <Button size="lg">
                    Explorar catálogo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="lg">
                    Crear cuenta
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Card mini-grid (4 coronados) */}
            <div className="hidden lg:grid grid-cols-2 gap-3 max-w-sm ml-auto">
              {coronadoNames.map((name) => {
                const card = allCards.find((c) => c.name === name.toUpperCase())!;
                return (
                  <Link key={card.code} href={`/catalog/${card.slug}`}>
                    <div className="relative aspect-2.5/3.5 bg-surface-800 rounded-xl border border-surface-700 overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1">
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                        <Crown className="h-8 w-8 text-amber-500/40 mb-2" />
                        <span className="text-xs font-bold text-surface-200 leading-tight">
                          {card.name}
                        </span>
                        <span className="text-[10px] text-surface-500 mt-1">
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
      <section className="bg-surface-900/60 border-b border-surface-800">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
            {([
              ["Tropas", cardStats.tropas],
              ["Coronados", cardStats.coronados],
              ["Realeza", cardStats.realeza],
              ["Estrategia", cardStats.estrategia],
              ["Primigenia", cardStats.estrategiaPrimigenia],
              ["Arroje", cardStats.arroje],
            ] as const).map(([label, count]) => (
              <div key={label}>
                <p className="text-xl sm:text-2xl font-bold text-surface-50">{count}</p>
                <p className="text-xs text-surface-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CARD CATEGORIES ============ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-surface-50 mb-2">
            Tipos de carta
          </h2>
          <p className="text-surface-400 mb-8 max-w-lg">
            Kingdom TCG tiene 6 categorías de cartas. Conocelas y empezá a armar tu estrategia.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(categoryIcon) as [KTCGCategory, typeof Crown][]).map(
              ([cat, Icon]) => {
                const count = allCards.filter((c) => c.category === cat).length;
                const colors = categoryColor[cat];
                return (
                  <Link key={cat} href={`/catalog?category=${encodeURIComponent(cat)}`}>
                    <Card variant="interactive" className="h-full">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg shrink-0 ${colors}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-surface-100 mb-0.5">
                            {cat}
                          </h3>
                          <p className="text-xs text-surface-400">
                            {count} cartas
                            {cat === "Tropas" && " · Niveles 1–4"}
                            {cat === "Coronados" && " · 11 acabados cada uno"}
                            {cat === "Arroje" && " · Niveles 1–3"}
                            {cat === "Estrategia Primigenia" && " · Poder elemental"}
                          </p>
                        </div>
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
      <section className="py-16 sm:py-20 bg-surface-900/30">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-surface-50">
                Del catálogo
              </h2>
              <p className="text-surface-400 mt-1 text-sm">
                Algunas cartas de cada categoría
              </p>
            </div>
            <Link href="/catalog">
              <Button variant="ghost" size="sm">
                Ver las {cardStats.total}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {showcaseCards.map((card) => {
              const Icon = categoryIcon[card.category];
              return (
                <Link key={card.code} href={`/catalog/${card.slug}`}>
                  <div className="group relative bg-surface-900 border border-surface-800 rounded-xl overflow-hidden transition-transform hover:-translate-y-1">
                    <div className="aspect-2.5/3.5 bg-surface-800 flex flex-col items-center justify-center p-2 text-center">
                      <Icon className="h-6 w-6 text-surface-600 mb-1.5" />
                      <span className="text-[11px] font-medium text-surface-300 leading-tight line-clamp-2">
                        {card.name}
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] text-surface-500 truncate">
                        {card.code} · {card.category}
                      </p>
                      {card.level != null && (
                        <Badge variant="default" className="mt-1 text-[10px]">
                          {levelLabel[card.level] ?? `Nv. ${card.level}`}
                        </Badge>
                      )}
                      {card.card_type === "coronado" && (
                        <Badge variant="accent" className="mt-1 text-[10px]">
                          Coronado
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

      {/* ============ FEATURES (compact, 2 rows) ============ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-surface-50 mb-8">
            ¿Qué podés hacer?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                title: "Catálogo completo",
                desc: `Las ${cardStats.total} cartas con filtros por tipo, nivel y facción.`,
                href: "/catalog",
              },
              {
                icon: Swords,
                title: "Deck Builder",
                desc: "33 tropas + 1 coronado + 30 estrategias. Validación automática.",
                href: "/decks",
              },
              {
                icon: Store,
                title: "Singles",
                desc: "Comprá y vendé singles físicos con otros jugadores.",
                href: "/singles",
              },
              {
                icon: MessageSquare,
                title: "Foro",
                desc: "Discusiones de meta, estrategia y novedades del juego.",
                href: "/forum",
              },
              {
                icon: Users,
                title: "Colección y social",
                desc: "Registrá tu inventario digital y físico. Agregá amigos.",
                href: "/collection",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.title} href={f.href}>
                  <Card variant="interactive" className="h-full">
                    <CardContent className="p-5">
                      <Icon className="h-5 w-5 text-primary-400 mb-3" />
                      <h3 className="font-semibold text-surface-100 mb-1 text-sm">
                        {f.title}
                      </h3>
                      <p className="text-xs text-surface-400 leading-relaxed">
                        {f.desc}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ DECK BUILDER CTA ============ */}
      <section className="py-16 sm:py-20 bg-surface-900/30">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <Badge variant="accent" className="mb-3">Deck Builder</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-surface-50 mb-3">
                Armá tu mazo
              </h2>
              <p className="text-surface-300 mb-6 max-w-lg">
                Mazo de combatientes: elegí 1 de los 4 coronados, sumá 33 tropas
                de tu facción y completá con 30 cartas de estrategia.
                Validación de reglas en tiempo real.
              </p>
              <div className="flex gap-3">
                <Link href="/decks/new">
                  <Button>
                    <Swords className="h-4 w-4" />
                    Crear mazo
                  </Button>
                </Link>
                <Link href="/decks">
                  <Button variant="secondary">Ver mazos</Button>
                </Link>
              </div>
            </div>
            {/* Mini coronado list */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              {coronadoNames.map((name) => (
                <div key={name} className="bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-center">
                  <Crown className="h-5 w-5 text-amber-500/50 mx-auto mb-1" />
                  <p className="text-xs font-medium text-surface-200">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="border-t border-surface-800 py-10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-5 w-5 text-primary-400" />
              <h3 className="text-sm font-semibold text-surface-100">
                Intercambios seguros
              </h3>
              <p className="text-xs text-surface-400">
                Sistema de reputación y moderación
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent-400" />
              <h3 className="text-sm font-semibold text-surface-100">
                Catálogo actualizado
              </h3>
              <p className="text-xs text-surface-400">
                Las {cardStats.total} cartas de la primera edición
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              <h3 className="text-sm font-semibold text-surface-100">
                Hecho para la comunidad
              </h3>
              <p className="text-xs text-surface-400">
                Foro, amigos y deck sharing
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
