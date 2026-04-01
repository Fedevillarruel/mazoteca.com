"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { allCards, type KTCGCard, type KTCGCategory } from "@/data/cards";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Crown,
  Shield,
  Star,
  Scroll,
  Sparkles,
  Crosshair,
  BookMarked,
  Search,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleAlbum } from "@/lib/actions/profile";
import type { CatalogSingleEntry } from "@/lib/services/tiendanube-sync";

// ---- Types ----
export interface AlbumViewProps {
  albumSet: string[];
  singlesMap: Record<string, CatalogSingleEntry>;
}

// ---- Category icon map ----
const categoryIcon: Record<KTCGCategory, typeof Crown> = {
  Tropas: Shield,
  Coronados: Crown,
  Realeza: Star,
  Estrategia: Scroll,
  "Estrategia Primigenia": Sparkles,
  Arroje: Crosshair,
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function AlbumView({ albumSet, singlesMap }: AlbumViewProps) {
  const [owned, setOwned] = useState<Set<string>>(new Set(albumSet));
  const [search, setSearch] = useState("");
  const [filterOwned, setFilterOwned] = useState<"all" | "owned" | "missing">("all");
  const [, startTransition] = useTransition();
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  // Only cards present in singlesMap (same universe as catalog)
  const catalogCards: KTCGCard[] = allCards.filter((c) => singlesMap[c.code]);

  const filtered = catalogCards.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
    }
    if (filterOwned === "owned") return owned.has(c.code);
    if (filterOwned === "missing") return !owned.has(c.code);
    return true;
  });

  const ownedCount = catalogCards.filter((c) => owned.has(c.code)).length;
  const totalCards = catalogCards.length;
  const percentage = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;

  function handleToggle(code: string) {
    if (pendingCode === code) return;
    setPendingCode(code);
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
    startTransition(async () => {
      const res = await toggleAlbum(code);
      if (res.needsAuth) {
        window.location.href = "/login";
        return;
      }
      if (res.error) {
        // Revert on error
        setOwned((prev) => {
          const next = new Set(prev);
          if (next.has(code)) next.delete(code);
          else next.add(code);
          return next;
        });
      }
      setPendingCode(null);
    });
  }

  return (
    <PageLayout title="Álbum Digital" description="Las cartas del catálogo que tenés en tu colección">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary-400">{ownedCount}</p>
            <p className="text-xs text-surface-400">Cartas en álbum</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-surface-300">{totalCards}</p>
            <p className="text-xs text-surface-400">En el catálogo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-accent-400">{percentage}%</p>
            <p className="text-xs text-surface-400">Completado</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-surface-400 mb-1.5">
          <span>Progreso del álbum</span>
          <span>{ownedCount} / {totalCards}</span>
        </div>
        <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              search ? (
                <button onClick={() => setSearch("")} className="text-surface-400 hover:text-surface-200">
                  <X className="h-4 w-4" />
                </button>
              ) : undefined
            }
          />
        </div>
        <div className="flex gap-2">
          {(["all", "owned", "missing"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterOwned(f)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                filterOwned === f
                  ? "bg-primary-600 text-white"
                  : "bg-surface-800 text-surface-400 hover:text-surface-200 border border-surface-700"
              )}
            >
              {f === "all" ? "Todas" : f === "owned" ? "Tengo" : "Me falta"}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-5 flex-wrap text-xs text-surface-500">
        <span className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border-2 border-primary-500 bg-primary-500/20" />
          La tenés
        </span>
        <span className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border-2 border-surface-700" />
          No la tenés
        </span>
        <span className="text-surface-600">· Tocá una carta para marcarla/desmarcarla</span>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookMarked className="h-10 w-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-300 font-medium">No hay cartas que mostrar</p>
          <p className="text-sm text-surface-500 mt-1">
            {filterOwned === "owned" ? (
              <>Aún no marcaste ninguna carta. Agregá desde el{" "}
                <Link href="/catalog" className="text-primary-400 underline">catálogo</Link>.</>
            ) : (
              "Probá cambiando los filtros."
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
          {filtered.map((card) => {
            const single = singlesMap[card.code];
            const isOwned = owned.has(card.code);
            const isLoading = pendingCode === card.code;
            const Icon = categoryIcon[card.category];
            const displayPrice = single?.promotional_price ?? single?.min_price;

            return (
              <button
                key={card.code}
                onClick={() => handleToggle(card.code)}
                disabled={isLoading}
                title={isOwned ? `Quitar ${card.name} del álbum` : `Marcar ${card.name} como obtenida`}
                className={cn(
                  "group relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  isOwned
                    ? "border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10"
                    : "border-surface-700/50 bg-surface-900 opacity-60 hover:opacity-90 hover:border-surface-600",
                  isLoading && "opacity-50 cursor-wait"
                )}
              >
                {/* Card image or icon */}
                <div className="relative aspect-5/7 bg-surface-800 overflow-hidden">
                  {single?.image_url ? (
                    <Image
                      src={single.image_url}
                      alt={card.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                      <Icon className="h-6 w-6 text-surface-600 mb-1" />
                      <span className="text-[9px] text-surface-500 leading-tight line-clamp-2">{card.name}</span>
                    </div>
                  )}

                  {/* Code badge */}
                  <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded bg-surface-950/80 border border-surface-700/60 text-[8px] font-mono text-surface-300">
                    {card.code}
                  </div>

                  {/* Owned checkmark */}
                  {isOwned && (
                    <div className="absolute inset-0 bg-primary-600/10 flex items-start justify-end p-1.5">
                      <span className="bg-primary-500 text-white rounded-full p-0.5 shadow">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-1.5">
                  <p className="text-[9px] font-semibold text-surface-300 leading-tight line-clamp-2 mb-0.5">
                    {card.name}
                  </p>
                  {displayPrice != null && (
                    <p className="text-[9px] text-primary-400 font-medium">{formatARS(displayPrice)}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-surface-600 text-center mt-8">
        El álbum muestra las cartas disponibles en el catálogo.
        Se actualiza automáticamente cuando se agregan cartas a la tienda.
      </p>
    </PageLayout>
  );
}
