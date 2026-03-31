import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { CatalogView } from "./catalog-view";
import { getCatalogSingles } from "@/lib/services/tiendanube-sync";

export const metadata: Metadata = {
  title: "Catálogo de Cartas",
  description:
    "Catálogo completo de cartas TCG. Explorá todas las cartas existentes, filtrá por tipo y agregá a tu mazo, álbum o wishlist.",
};

export const revalidate = 60;

export default async function CatalogPage() {
  const singlesMap = await getCatalogSingles().catch(() => new Map());

  return (
    <PageLayout
      title="Catálogo de Cartas"
      description="Todas las cartas existentes — agregá a tu mazo, álbum o wishlist"
    >
      <CatalogView singlesMap={singlesMap} />
    </PageLayout>
  );
}
