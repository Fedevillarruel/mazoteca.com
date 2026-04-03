"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { acceptOffer } from "@/lib/actions/trading";

export function AcceptOfferButton({ offerId }: { offerId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAccept() {
    startTransition(async () => {
      const res = await acceptOffer(offerId);
      if (res.chatId) {
        router.push(`/trades/chat/${res.chatId}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Button size="sm" variant="primary" onClick={handleAccept} disabled={isPending}>
      <CheckCircle className="h-4 w-4" />
      {isPending ? "Aceptando..." : "Aceptar"}
    </Button>
  );
}
