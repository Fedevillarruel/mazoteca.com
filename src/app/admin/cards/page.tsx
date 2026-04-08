import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Catálogo",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

const PAGE_SIZE = 50;

const rarityLabels: Record<string, string> = {
  common: "Común",
  uncommon: "Poco común",
  rare: "Rara",
  epic: "Épica",
  legendary: "Legendaria",
  mythic: "Mítica",
};

const rarityVariant: Record<string, "common" | "rare" | "epic" | "legendary" | "mythic" | "default"> = {
  common: "common",
  uncommon: "default",
  rare: "rare",
  epic: "epic",
  legendary: "legendary",
  mythic: "mythic",
};

export default async function AdminCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const q = sp.q?.trim() ?? "";
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createAdminClient();

  let query = supabase
    .from("cards")
    .select(
      `id, code, name, slug, rarity, card_type, is_active, expansions ( name, code )`,
      { count: "exact" }
    )
    .order("code", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q) {
    query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
  }

  const { data: cards, count } = await query;
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-xs text-surface-400 hover:text-surface-200 mb-1 block">
              ← Volver al dashboard
            </Link>
            <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-400" />
              Catálogo de Cartas
            </h1>
            <p className="text-sm text-surface-400 mt-0.5">{total} cartas en total</p>
          </div>
        </div>

        {/* Búsqueda */}
        <form method="GET" className="flex gap-3 mb-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o código..."
            className="flex-1 max-w-md bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500"
          />
          <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg transition-colors">
            Buscar
          </button>
          {q && (
            <Link href="/admin/cards" className="px-4 py-2 bg-surface-700 hover:bg-surface-600 text-surface-200 text-sm rounded-lg transition-colors">
              Limpiar
            </Link>
          )}
        </form>

        {cards && cards.length > 0 ? (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-700">
                        <th className="text-left p-4 text-surface-400 font-medium">Código</th>
                        <th className="text-left p-4 text-surface-400 font-medium">Nombre</th>
                        <th className="text-left p-4 text-surface-400 font-medium">Expansión</th>
                        <th className="text-left p-4 text-surface-400 font-medium">Rareza</th>
                        <th className="text-left p-4 text-surface-400 font-medium">Tipo</th>
                        <th className="text-left p-4 text-surface-400 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((card) => {
                        const expansion = (Array.isArray(card.expansions) ? card.expansions[0] : card.expansions) as { name: string; code: string } | null;
                        return (
                          <tr key={card.id} className="border-b border-surface-800 hover:bg-surface-800/30">
                            <td className="p-4 text-surface-400 font-mono text-xs">{card.code}</td>
                            <td className="p-4">
                              <Link href={`/catalog/${card.slug}`} className="font-medium text-surface-100 hover:text-primary-300 transition-colors">
                                {card.name}
                              </Link>
                            </td>
                            <td className="p-4 text-surface-400">
                              {expansion ? `${expansion.name} (${expansion.code})` : "—"}
                            </td>
                            <td className="p-4">
                              <Badge variant={rarityVariant[card.rarity] ?? "default"}>
                                {rarityLabels[card.rarity] ?? card.rarity}
                              </Badge>
                            </td>
                            <td className="p-4 text-surface-400 capitalize text-xs">{card.card_type}</td>
                            <td className="p-4">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.is_active ? "bg-green-500/15 text-green-400" : "bg-surface-700 text-surface-500"}`}>
                                {card.is_active ? "Activa" : "Inactiva"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-surface-400">
                Mostrando {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
              </p>
              <div className="flex items-center gap-1">
                {page > 1 ? (
                  <Link href={`/admin/cards?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="p-1.5 rounded text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="p-1.5 text-surface-700"><ChevronLeft className="h-4 w-4" /></span>
                )}
                <span className="px-3 py-1 text-xs text-surface-400">{page} / {totalPages || 1}</span>
                {page < totalPages ? (
                  <Link href={`/admin/cards?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="p-1.5 rounded text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="p-1.5 text-surface-700"><ChevronRight className="h-4 w-4" /></span>
                )}
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-surface-600" />
              <p className="text-surface-400">
                {q ? `No se encontraron cartas para "${q}"` : "No hay cartas en el catálogo todavía"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
