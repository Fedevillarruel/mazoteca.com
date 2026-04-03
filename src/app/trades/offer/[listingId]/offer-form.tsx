"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Send } from "lucide-react";
import { makeOffer } from "@/lib/actions/trading";

type AlbumCard = { code: string; name: string; qty: number };

interface Props {
  listingId: string;
  listingType: "sale" | "trade" | "both";
  albumCards: AlbumCard[];
}

export function OfferForm({ listingId, listingType, albumCards }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canBuy = listingType === "sale" || listingType === "both";
  const canTrade = listingType === "trade" || listingType === "both";

  const [offerType, setOfferType] = useState<"buy" | "trade">(canBuy ? "buy" : "trade");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerCardCode, setOfferCardCode] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit() {
    setError(null);
    if (offerType === "buy" && !offerPrice) {
      setError("Ingresá el monto que ofrecés.");
      return;
    }
    if (offerType === "trade" && !offerCardCode) {
      setError("Seleccioná una carta de tu álbum para ofrecer.");
      return;
    }

    startTransition(async () => {
      const res = await makeOffer({
        listingId,
        offerType,
        offerPrice: offerType === "buy" ? Number(offerPrice) : undefined,
        offerCardCode: offerType === "trade" ? offerCardCode : undefined,
        note: note || undefined,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/trades"), 1800);
    });
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-surface-200 font-medium">¡Oferta enviada!</p>
          <p className="text-sm text-surface-400 mt-1">Te avisaremos cuando el vendedor responda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tu oferta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Offer type selector */}
        {canBuy && canTrade && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={offerType === "buy" ? "primary" : "ghost"}
              onClick={() => setOfferType("buy")}
              disabled={isPending}
            >
              💰 Comprar
            </Button>
            <Button
              size="sm"
              variant={offerType === "trade" ? "primary" : "ghost"}
              onClick={() => setOfferType("trade")}
              disabled={isPending}
            >
              🔄 Intercambiar
            </Button>
          </div>
        )}

        {/* Buy: price input */}
        {offerType === "buy" && (
          <Input
            label="Monto que ofrecés (ARS)"
            placeholder="Ej: 1500"
            type="number"
            min={1}
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            disabled={isPending}
          />
        )}

        {/* Trade: select card from album */}
        {offerType === "trade" && (
          <div className="space-y-1">
            <label className="text-xs text-surface-400 font-medium">Carta que ofrecés</label>
            {albumCards.length === 0 ? (
              <p className="text-xs text-surface-500 py-2">No tenés cartas en tu álbum para ofrecer.</p>
            ) : (
              <select
                className="w-full rounded-lg bg-surface-800 border border-surface-700 text-surface-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={offerCardCode}
                onChange={(e) => setOfferCardCode(e.target.value)}
                disabled={isPending}
              >
                <option value="">Seleccioná una carta...</option>
                {albumCards.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code}) — {c.qty}x disponible
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Optional note */}
        <Textarea
          label="Mensaje para el vendedor (opcional)"
          placeholder="Agregá cualquier detalle sobre tu oferta..."
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

        <p className="text-xs text-surface-500">
          Si el vendedor acepta tu oferta, se abrirá un chat privado entre ustedes para coordinar el intercambio.
        </p>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isPending || (offerType === "trade" && albumCards.length === 0)}
          >
            <Send className="h-4 w-4" />
            {isPending ? "Enviando..." : "Enviar oferta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
