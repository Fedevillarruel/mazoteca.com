"use client";

import { useState } from "react";
import { BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleAlbum } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";

interface AlbumButtonProps {
  cardCode: string;
  defaultInAlbum?: boolean;
}

export function AlbumButton({ cardCode, defaultInAlbum = false }: AlbumButtonProps) {
  const [inAlbum, setInAlbum] = useState(defaultInAlbum);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    const prev = inAlbum;
    setInAlbum(!prev); // optimistic
    const res = await toggleAlbum(cardCode);
    if (res.needsAuth) { window.location.href = "/login"; return; }
    if (res.error) { setInAlbum(prev); } // revert on error
    setPending(false);
  }

  return (
    <Button
      variant="secondary"
      className={cn(
        "flex-1 transition-all duration-200",
        inAlbum && "bg-violet-600 border-violet-500 text-white hover:bg-violet-700"
      )}
      onClick={handleClick}
      disabled={pending}
    >
      <BookMarked className="h-4 w-4" />
      {inAlbum ? "En mi álbum" : "Agregar al álbum"}
    </Button>
  );
}
