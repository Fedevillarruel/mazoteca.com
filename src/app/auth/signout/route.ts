import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /auth/signout
 * Server-side sign-out: limpia la sesión en las cookies del servidor
 * y redirige al home.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignorar errores de signOut — la cookie se limpia igual al redirigir
  }

  const home = new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mazoteca.com");
  const response = NextResponse.redirect(home);

  // Limpiar manualmente las cookies de sesión de Supabase por si signOut() no las eliminó
  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb-refresh-token");

  return response;
}
