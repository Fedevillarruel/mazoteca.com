import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Singles",
};

// Página temporalmente oculta
export default async function SinglesPage() {
  notFound();
}
