import type { Metadata } from "next";
import { CommunityView } from "./community-view";

export const metadata: Metadata = {
  title: "Comunidad",
  description: "Foro de la comunidad de Kingdom TCG. General, Trading y Memes.",
};

export default function ForumPage() {
  return <CommunityView />;
}