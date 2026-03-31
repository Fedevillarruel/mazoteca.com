import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { CatalogView } from "./catalog-view";
import { getCardCodesInStore } from "@/lib/services/tiendanube-sync";

export const metadata: Metadata = {
  title: "Catálogo de Cartas",
  description:
    "Catálogo completo de las 209 cartas de Kingdom TCG. Tropas, Coronados, Realeza, Estrategia, Primigenia y Arroje.",
};

export default async function CatalogPage() {
  const codesInStore = await getCardCodesInStore().catch(() => new Set<string>());

  return (
    <PageLayout
      title="Catálogo de Cartas"
      description="Las 209 cartas de Kingdom TCG — filtrá por categoría, nivel y facción"
    >
      <CatalogView codesInStore={codesInStore} />
    </PageLayout>
  );
}
