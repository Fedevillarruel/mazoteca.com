import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { SinglesView } from "./singles-view";
import { getAllPublishedSingles } from "@/lib/services/tiendanube-sync";
import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Singles",
  description:
    "Cartas sueltas de Kingdom TCG disponibles para compra. Stock real y precios desde nuestra tienda oficial.",
};

export const revalidate = 60;

export default async function SinglesPage() {
  const [{ data: initialSingles, count }, currentUser] = await Promise.all([
    getAllPublishedSingles({ limit: 48, offset: 0 }),
    getCurrentUser(),
  ]);

  return (
    <PageLayout
      title="Singles"
      description="Cartas disponibles para compra — stock y precios en tiempo real"
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
        />
      </Suspense>
    </PageLayout>
  );
}
