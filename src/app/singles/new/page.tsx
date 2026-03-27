"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Upload,
  Camera,
  DollarSign,
  Tag,
  Save,
} from "lucide-react";

const conditionOptions = [
  { value: "mint", label: "Mint (M)" },
  { value: "near_mint", label: "Near Mint (NM)" },
  { value: "lightly_played", label: "Lightly Played (LP)" },
  { value: "moderately_played", label: "Moderately Played (MP)" },
  { value: "heavily_played", label: "Heavily Played (HP)" },
  { value: "damaged", label: "Damaged (DMG)" },
];

export default function NewListingPage() {
  const [images] = useState<string[]>([]);

  return (
    <PageLayout>
      <Link
        href="/singles"
        className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a singles
      </Link>

      <h1 className="text-2xl font-bold text-surface-50 mb-6">Nueva Publicación</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Card Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary-400" />
                Carta a vender
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Buscar carta"
                placeholder="Escribí el nombre de la carta..."
              />
              <p className="text-xs text-surface-400">
                Seleccioná una carta del catálogo. Si no la encontrás, podés agregarla manualmente.
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Select
                  label="Condición"
                  options={conditionOptions}
                />
                <Select
                  label="Acabado"
                  options={[
                    { value: "normal", label: "Normal" },
                    { value: "foil", label: "Foil" },
                    { value: "full_art", label: "Full Art" },
                    { value: "promo", label: "Promocional" },
                  ]}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Precio (ARS)"
                  type="number"
                  placeholder="0"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                />
                <Input
                  label="Cantidad disponible"
                  type="number"
                  placeholder="1"
                  defaultValue="1"
                />
              </div>
              <Textarea
                label="Descripción (opcional)"
                placeholder="Añadí detalles adicionales sobre la carta..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary-400" />
                Fotos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-surface-800 border border-surface-700"
                  />
                ))}
                <button className="aspect-square rounded-lg border-2 border-dashed border-surface-600 hover:border-primary-500 flex flex-col items-center justify-center gap-1 text-surface-400 hover:text-primary-400 transition-colors">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Subir</span>
                </button>
              </div>
              <p className="text-xs text-surface-400 mt-2">
                Subí hasta 4 fotos de la carta real. Se recomiendan fotos del frente y dorso.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-4">
          <Card variant="glass">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-surface-100 mb-3">Vista previa</h3>
              <div className="aspect-2.5/3.5 rounded-lg bg-surface-800 border border-surface-700 mb-3" />
              <p className="text-sm font-medium text-surface-200 mb-1">
                [Nombre de la carta]
              </p>
              <p className="text-xs text-surface-400 mb-2">
                Near Mint · Normal
              </p>
              <p className="text-lg font-bold text-accent-400">$0 ARS</p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="w-full">
              <Save className="h-4 w-4" />
              Publicar
            </Button>
            <Button variant="secondary" className="w-full">
              Guardar borrador
            </Button>
          </div>

          <p className="text-xs text-surface-400 text-center">
            Al publicar, aceptás los{" "}
            <Link href="/terms" className="text-primary-400 hover:underline">
              términos y condiciones
            </Link>{" "}
            de singles.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
