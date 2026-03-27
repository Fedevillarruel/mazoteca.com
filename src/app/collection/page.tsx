"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Grid3X3,
  List,
  SlidersHorizontal,
  Camera,
  Download,
} from "lucide-react";

const tabs = [
  { id: "digital", label: "Álbum Digital", icon: BookOpen },
  { id: "physical", label: "Álbum Físico", icon: Camera },
] as const;

type Tab = (typeof tabs)[number]["id"];

const rarities = ["Todas", "Común", "Rara", "Épica", "Legendaria", "Mítica"];

const placeholderCards = Array.from({ length: 24 }, (_, i) => ({
  id: `c-${i + 1}`,
  name: `Carta ${i + 1}`,
  number: String(i + 1).padStart(3, "0"),
  rarity: (["common", "rare", "epic", "legendary", "mythic"] as const)[i % 5],
  owned: i % 3 !== 2,
  quantity: i % 3 !== 2 ? (i % 4) + 1 : 0,
}));

const rarityClasses: Record<string, string> = {
  common: "border-surface-600",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-amber-500",
  mythic: "border-rose-500",
};

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("digital");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeRarity, setActiveRarity] = useState("Todas");

  const ownedCount = placeholderCards.filter((c) => c.owned).length;
  const totalCount = placeholderCards.length;
  const completionPercent = Math.round((ownedCount / totalCount) * 100);

  return (
    <PageLayout
      title="Mi Colección"
      description="Administrá tu álbum digital y físico de Kingdom TCG"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary-600 text-white"
                : "bg-surface-800 text-surface-400 hover:text-surface-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Completion Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-surface-200">
              Progreso de colección — Génesis
            </p>
            <span className="text-sm font-bold text-accent-400">
              {ownedCount}/{totalCount} ({completionPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Buscar en mi colección..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-surface-700 overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-primary-600 text-white" : "bg-surface-800 text-surface-400"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-primary-600 text-white" : "bg-surface-800 text-surface-400"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button variant="ghost" size="sm">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Rarity Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {rarities.map((r) => (
          <Badge
            key={r}
            variant={activeRarity === r ? "primary" : "default"}
            className="cursor-pointer px-3 py-1"
            onClick={() => setActiveRarity(r)}
          >
            {r}
          </Badge>
        ))}
      </div>

      {/* Physical Album Upload CTA */}
      {activeTab === "physical" && (
        <Card variant="bordered" className="mb-6">
          <CardContent className="p-6 text-center">
            <Camera className="h-10 w-10 mx-auto mb-3 text-primary-400" />
            <h3 className="text-lg font-semibold text-surface-100 mb-1">
              Subí fotos de tus cartas físicas
            </h3>
            <p className="text-sm text-surface-400 mb-4">
              Sacale una foto a cada carta para registrar tu álbum físico con su condición real.
            </p>
            <Button>
              <Camera className="h-4 w-4" />
              Subir fotos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cards Grid */}
      {view === "grid" ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {placeholderCards.map((card) => (
            <Link key={card.id} href={`/catalog/carta-${card.number}`}>
              <div
                className={`relative aspect-[2.5/3.5] rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 ${
                  card.owned
                    ? rarityClasses[card.rarity]
                    : "border-surface-700 opacity-40 grayscale"
                }`}
              >
                <Image
                  src="/placeholder-card.webp"
                  alt={card.name}
                  fill
                  className="object-cover"
                />
                {card.owned && card.quantity > 1 && (
                  <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{card.quantity}</span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1.5 py-1">
                  <p className="text-[10px] text-surface-200 truncate">#{card.number}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {placeholderCards.map((card) => (
            <Link key={card.id} href={`/catalog/carta-${card.number}`}>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  card.owned
                    ? "bg-surface-800/50 hover:bg-surface-700/50"
                    : "bg-surface-800/20 opacity-50"
                }`}
              >
                <div className="h-10 w-7 rounded bg-surface-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-100 truncate">
                    #{card.number} — {card.name}
                  </p>
                </div>
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
                  {card.rarity}
                </Badge>
                {card.owned ? (
                  <span className="text-xs text-surface-400">x{card.quantity}</span>
                ) : (
                  <span className="text-xs text-surface-500">No obtenida</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
