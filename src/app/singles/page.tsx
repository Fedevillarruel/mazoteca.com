import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { SinglesView } from "./singles-view";
import { getAllPublishedSingles } from "@/lib/services/tiendanube-sync";
import { fetchGameCategories } from "@/lib/services/tiendanube";
import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Singles",
  description:
    "Cartas sueltas de juegos de cartas coleccionables disponibles para compra. Stock real y precios desde nuestra tienda oficial.",
};

export const revalidate = 300; // refrescar cada 5 minutos

export default async function SinglesPage() {
  const [{ data: initialSingles, count }, currentUser, gameCategories] = await Promise.all([
    getAllPublishedSingles({ limit: 200, offset: 0 }),
    getCurrentUser(),
    fetchGameCategories().catch(() => []), // si falla la API no rompe la página
  ]);

  return (
    <PageLayout
      title="Singles"
      description="Cartas sueltas disponibles para compra — stock y precios en tiempo real"
    >
      <Suspense
        fallback={
          <div className="animate-pulse h-96 bg-surface-800 rounded-xl" />
        }
      >
        <SinglesView
          initialData={initialSingles}
          totalCount={count}
          userEmail={currentUser?.user.email ?? null}
          gameCategories={gameCategories}
        />
      </Suspense>
    </PageLayout>
  );
}
