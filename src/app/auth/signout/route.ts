import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /auth/signout
 * Server-side sign-out: limpia la sesión en las cookies del servidor
 * y redirige al home. El cliente también llama a supabase.auth.signOut()
 * antes de navegar aquí para limpiar el estado local.
 */
export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mazoteca.com"));
}
