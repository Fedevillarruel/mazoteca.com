import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — Catálogo",
};

const placeholderCards = Array.from({ length: 10 }, (_, i) => ({
  id: `card-${i + 1}`,
  name: `Carta ${i + 1}`,
  number: String(i + 1).padStart(3, "0"),
  expansion: "Génesis",
  rarity: (["common", "rare", "epic", "legendary", "mythic"] as const)[i % 5],
  type: (["combatant", "strategy", "crowned"] as const)[i % 3],
  variants: (i % 4) + 1,
}));

const rarityLabels: Record<string, string> = {
  common: "Común",
  rare: "Rara",
  epic: "Épica",
  legendary: "Legendaria",
  mythic: "Mítica",
};

export default function AdminCardsPage() {
  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-xs text-surface-400 hover:text-surface-200 mb-1 block">
              ← Volver al dashboard
            </Link>
            <h1 className="text-2xl font-bold text-surface-50">Gestión de Catálogo</h1>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nueva carta
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <Input placeholder="Buscar carta..." className="pl-9" />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="text-left p-4 text-surface-400 font-medium">#</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Nombre</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Expansión</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Rareza</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Tipo</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Variantes</th>
                    <th className="text-right p-4 text-surface-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {placeholderCards.map((card) => (
                    <tr key={card.id} className="border-b border-surface-800 hover:bg-surface-800/30">
                      <td className="p-4 text-surface-400 font-mono">#{card.number}</td>
                      <td className="p-4 font-medium text-surface-100">{card.name}</td>
                      <td className="p-4 text-surface-400">{card.expansion}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            card.rarity === "mythic"
                              ? "mythic"
                              : card.rarity === "legendary"
                                ? "legendary"
                                : card.rarity === "epic"
                                  ? "epic"
                                  : card.rarity === "rare"
                                    ? "rare"
                                    : "common"
                          }
                        >
                          {rarityLabels[card.rarity]}
                        </Badge>
                      </td>
                      <td className="p-4 text-surface-400 capitalize">{card.type}</td>
                      <td className="p-4 text-surface-400">{card.variants}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-surface-400">Mostrando 1-10 de 1.248</p>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
