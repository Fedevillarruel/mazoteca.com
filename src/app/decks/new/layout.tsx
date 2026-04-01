import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const FREE_DECK_LIMIT = 2;

export default async function NewDeckLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/decks/new");
  }

  const [profileRes, deckCountRes] = await Promise.all([
    supabase.from("profiles").select("is_premium").eq("id", user.id).single(),
    supabase.from("decks").select("id", { count: "exact", head: true }).eq("profile_id", user.id),
  ]);

  const isPremium = profileRes.data?.is_premium ?? false;
  const userDeckCount = deckCountRes.count ?? 0;

  if (!isPremium && userDeckCount >= FREE_DECK_LIMIT) {
    redirect("/premium?reason=deck_limit");
  }

  return <>{children}</>;
}
