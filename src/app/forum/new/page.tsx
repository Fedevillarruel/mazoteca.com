"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Send, AlertCircle, Search, X, Check,
  Camera, RefreshCw, ShoppingBag, Layers,
} from "lucide-react";
import { createForumThread, createTradingListing, uploadCardPhoto } from "@/lib/actions/trading";
import { allCards } from "@/data/cards";
import type { KTCGCard } from "@/data/cards";

type Tab = "general" | "trading" | "memes";

// ─── Card Picker Modal ────────────────────────────────────────────────────────

function CardPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (card: KTCGCard) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allCards.slice(0, 50);
    return allCards
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-700 shrink-0">
          <h2 className="text-base font-semibold text-surface-100">Elegir carta para publicar</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-surface-700/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 pointer-events-none" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código o categoría..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-surface-800 border border-surface-600 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-surface-500 mt-1.5 pl-1">{filtered.length} carta{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-surface-500 py-8">Sin resultados para &ldquo;{query}&rdquo;</p>
          ) : (
            <div className="grid gap-1">
              {filtered.map((card) => (
                <button
                  key={card.code}
                  onClick={() => onSelect(card)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface-800 transition-colors group"
                >
                  <div className="h-8 w-6 rounded bg-surface-700 flex items-center justify-center shrink-0 group-hover:bg-surface-600">
                    <Layers className="h-3.5 w-3.5 text-surface-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">{card.name}</p>
                    <p className="text-[11px] text-surface-500">{card.code} · {card.category}</p>
                  </div>
                  {card.level != null && (
                    <span className="text-[10px] text-surface-500 shrink-0">Nv {card.level}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Trading Listing Form ─────────────────────────────────────────────────────

function TradingForm({ onSuccess }: { onSuccess: (id: string) => void }) {
  const [selectedCard, setSelectedCard] = useState<KTCGCard | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [listingType, setListingType] = useState<"sale" | "trade" | "both">("both");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("near_mint");
  const [note, setNote] = useState("");

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "front") { setFrontFile(file); setFrontPreview(url); }
    else { setBackFile(file); setBackPreview(url); }
  }

  function handleSubmit() {
    if (!selectedCard) { setError("Elegí una carta."); return; }
    if (listingType !== "trade" && !price) { setError("El precio es requerido para publicaciones de venta."); return; }
    if (!frontFile || !backFile) { setError("Necesitás subir fotos de frente y dorso."); return; }
    setError(null);

    startTransition(async () => {
      // Upload photos
      const fFd = new FormData(); fFd.append("file", frontFile);
      const bFd = new FormData(); bFd.append("file", backFile);

      const [frontRes, backRes] = await Promise.all([
        uploadCardPhoto(fFd, "front"),
        uploadCardPhoto(bFd, "back"),
      ]);

      if (frontRes.error || backRes.error) {
        setError(frontRes.error ?? backRes.error ?? "Error al subir fotos.");
        return;
      }

      const res = await createTradingListing({
        cardCode: selectedCard.code,
        listingType,
        price: price ? Number(price) : undefined,
        condition,
        note: note.trim() || undefined,
        photoFrontUrl: frontRes.url!,
        photoBackUrl: backRes.url!,
      });

      if (res.error) { setError(res.error); return; }
      onSuccess(res.id!);
    });
  }

  const conditions = [
    { value: "mint",       label: "Mint" },
    { value: "near_mint",  label: "Near Mint" },
    { value: "excellent",  label: "Excelente" },
    { value: "good",       label: "Bueno" },
    { value: "fair",       label: "Regular" },
    { value: "poor",       label: "Malo" },
  ];

  return (
    <>
      {showPicker && (
        <CardPickerModal
          onSelect={(card) => { setSelectedCard(card); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-amber-400" />
            Nueva publicación de Trading
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Card selector */}
          <div>
            <p className="text-sm font-medium text-surface-200 mb-2">Carta a publicar</p>
            {selectedCard ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-800 border border-surface-600">
                <div className="h-10 w-7 rounded bg-surface-700 flex items-center justify-center shrink-0">
                  <Layers className="h-4 w-4 text-surface-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-100 truncate">{selectedCard.name}</p>
                  <p className="text-xs text-surface-500">{selectedCard.code} · {selectedCard.category}</p>
                </div>
                <button
                  onClick={() => setShowPicker(true)}
                  className="text-xs text-primary-400 hover:text-primary-300 shrink-0"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-surface-600 hover:border-primary-500 text-surface-400 hover:text-primary-400 transition-colors text-sm"
              >
                <Search className="h-4 w-4" />
                Buscar y seleccionar carta...
              </button>
            )}
          </div>

          {/* Listing type */}
          <div>
            <p className="text-sm font-medium text-surface-200 mb-2">Tipo de publicación</p>
            <div className="flex gap-2 flex-wrap">
              {(["sale", "trade", "both"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setListingType(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    listingType === t
                      ? "bg-primary-600 border-primary-500 text-white"
                      : "bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500"
                  }`}
                >
                  {t === "sale" && <ShoppingBag className="h-3.5 w-3.5" />}
                  {t === "trade" && <RefreshCw className="h-3.5 w-3.5" />}
                  {t === "both" && <Check className="h-3.5 w-3.5" />}
                  {t === "sale" ? "Venta" : t === "trade" ? "Intercambio" : "Venta o Intercambio"}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          {listingType !== "trade" && (
            <Input
              label="Precio (ARS)"
              type="number"
              placeholder="ej: 5000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isPending}
            />
          )}

          {/* Condition */}
          <div>
            <p className="text-sm font-medium text-surface-200 mb-2">Condición</p>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCondition(c.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    condition === c.value
                      ? "bg-accent-600 border-accent-500 text-white"
                      : "bg-surface-800 border-surface-600 text-surface-400 hover:border-surface-500"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <p className="text-sm font-medium text-surface-200 mb-2">Fotos de la carta <span className="text-red-400">*</span></p>
            <div className="grid grid-cols-2 gap-3">
              {(["front", "back"] as const).map((side) => {
                const preview = side === "front" ? frontPreview : backPreview;
                const label = side === "front" ? "Frente" : "Dorso";
                return (
                  <label key={side} className="cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handlePhotoChange(e, side)}
                      disabled={isPending}
                    />
                    <div className={`h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors overflow-hidden relative ${
                      preview
                        ? "border-primary-500"
                        : "border-surface-600 group-hover:border-primary-500"
                    }`}>
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="h-6 w-6 text-surface-500 group-hover:text-primary-400" />
                          <span className="text-xs text-surface-500 group-hover:text-primary-400">{label}</span>
                        </>
                      )}
                      {preview && (
                        <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-white bg-surface-950/70 py-0.5">{label} · cambiar</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <Textarea
            label="Nota adicional (opcional)"
            placeholder="Estado especial, foil, firmada, detalles del intercambio buscado..."
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
          />

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isPending} isLoading={isPending}>
              <RefreshCw className="h-4 w-4" />
              {isPending ? "Publicando..." : "Publicar en Trading"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewThreadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get("tab") ?? "general") as Tab;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tabLabel: Record<Tab, string> = {
    general: "General",
    trading: "Trading",
    memes: "Memes",
  };

  function handleSubmitGeneral() {
    if (!title.trim() || !content.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createForumThread({ tab, title, content });
      if (res.error) { setError(res.error); return; }
      router.push(res.id ? `/forum/${res.id}` : `/forum?tab=${tab}`);
    });
  }

  return (
    <PageLayout>
      <Link
        href={`/forum?tab=${tab}`}
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a {tabLabel[tab]}
      </Link>

      <h1 className="text-2xl font-bold text-surface-50 mb-6">
        Nuevo hilo · {tabLabel[tab]}
      </h1>

      {tab === "trading" ? (
        <TradingForm
          onSuccess={(listingId) => {
            // Redirect to trading forum after posting
            router.push(`/forum?tab=trading`);
            void listingId;
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Crear un hilo de discusión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Título"
              placeholder="Escribí un título claro y descriptivo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
            <Textarea
              label="Contenido"
              placeholder="Desarrollá tu tema, pregunta o discusión..."
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
            />
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
            <p className="text-xs text-surface-400">
              Recordá ser respetuoso y seguir las reglas de la comunidad.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleSubmitGeneral}
                disabled={!title.trim() || !content.trim() || isPending}
                isLoading={isPending}
              >
                <Send className="h-4 w-4" />
                {isPending ? "Publicando..." : "Publicar hilo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
