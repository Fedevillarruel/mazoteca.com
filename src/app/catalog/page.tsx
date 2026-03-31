import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { CatalogView } from "./catalog-view";
import { getCatalogSingles } from "@/lib/services/tiendanube-sync";

export const metadata: Metadata = {
  title: "Catálogo de Cartas",
  description:
    "Catálogo completo de las 209 cartas de Kingdom TCG. Tropas, Coronados, Realeza, Estrategia, Primigenia y Arroje.",
};

export const revalidate = 60;

export default async function CatalogPage() {
  const singlesMap = await getCatalogSingles().catch(() => new Map());

  return (
    <PageLayout
      title="Catálogo de Cartas"
      description="Cartas disponibles para compra en nuestra tienda oficial"
    >
      <CatalogView singlesMap={singlesMap} />
    </PageLayout>
  );
}
