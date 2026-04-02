import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getNotificationPreferences } from "@/lib/actions/notifications";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Configuración — Mazoteca",
};

export default async function SettingsPage() {
  const result = await getCurrentUser();
  if (!result) redirect("/login");

  const { profile } = result;
  if (!profile) redirect("/login");

  const initialPrefs = await getNotificationPreferences();

  return (
    <SettingsClient
      profile={{
        id: profile.id as string,
        username: profile.username as string,
        display_name: (profile.display_name as string) ?? null,
        bio: (profile.bio as string) ?? null,
        location: (profile.location as string) ?? null,
        avatar_url: (profile.avatar_url as string) ?? null,
        digital_collection_visibility: (profile.digital_collection_visibility as string) ?? "public",
        physical_collection_visibility: (profile.physical_collection_visibility as string) ?? "public",
        decks_visibility: (profile.decks_visibility as string) ?? "public",
      }}
      initialPrefs={initialPrefs}
    />
  );
}
