import type { Metadata } from "next";
import { AlbumGate } from "./album-gate";
import { getCurrentUser } from "@/lib/actions/auth";
import { AlbumView } from "./album-view";

export const metadata: Metadata = {
  title: "Álbum",
  description: "Tu álbum personal de Kingdom TCG. Registrá tu colección física y digital.",
};

export default async function AlbumPage() {
  const userSession = await getCurrentUser();

  if (!userSession) {
    return <AlbumGate />;
  }

  return <AlbumView />;
}
