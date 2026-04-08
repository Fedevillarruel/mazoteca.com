import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Singles",
};

// /singles redirige al catálogo — página unificada
export default async function SinglesPage() {
  redirect("/catalog");
}
