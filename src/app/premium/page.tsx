import type { Metadata } from "next";
import { getBlueDolarRate } from "@/lib/services/dolarapi";
import { PremiumPageClient } from "./premium-client";

export const metadata: Metadata = {
  title: "Premium — Mazoteca",
  description: "Desbloqueá todas las funciones con un pago único de USD 15.",
};

export default async function PremiumPage() {
  const blueRate = await getBlueDolarRate();
  const priceUSD = Number(process.env.PREMIUM_PRICE_USD ?? 15);
  const priceARS = Math.ceil(priceUSD * blueRate);

  return (
    <PremiumPageClient
      priceUSD={priceUSD}
      priceARS={priceARS}
      blueRate={blueRate}
    />
  );
}
