import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Tiendanube OAuth callback
 * TN redirects here after the store owner installs/re-authorizes the app:
 *   GET /api/tiendanube/auth/callback?code=XXX
 *
 * This handler exchanges the code for an access_token.
 * REQUIRES the calling user to be authenticated as admin.
 */
export async function GET(req: NextRequest) {
  // ── Auth guard: admin-only ──────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  // ───────────────────────────────────────────────────────────────────────────

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return new NextResponse("Missing code parameter", { status: 400 });
  }

  const clientId = process.env.TIENDANUBE_APP_ID;
  const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse("Missing TIENDANUBE_APP_ID or TIENDANUBE_CLIENT_SECRET", {
      status: 500,
    });
  }

  try {
    const res = await fetch("https://www.tiendanube.com/apps/authorize/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return new NextResponse(
        JSON.stringify({ error: data.error, description: data.error_description }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { access_token, user_id } = data as {
      access_token: string;
      user_id: number;
    };

    // Return a readable HTML page so the developer can copy the values
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Token de Tiendanube obtenido</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #22d3ee; }
    .box { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; margin: 16px 0; }
    label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
    code { display: block; background: #0f172a; padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 14px; color: #a78bfa; word-break: break-all; }
    .note { font-size: 13px; color: #94a3b8; margin-top: 20px; line-height: 1.6; }
    strong { color: #f8fafc; }
  </style>
</head>
<body>
  <h1>✅ Token obtenido correctamente</h1>
  <div class="box">
    <label>TIENDANUBE_ACCESS_TOKEN</label>
    <code>${access_token}</code>
  </div>
  <div class="box">
    <label>TIENDANUBE_STORE_ID</label>
    <code>${user_id}</code>
  </div>
  <p class="note">
    Copiá estos valores y pegálos en:<br />
    <strong>• .env.local</strong> (desarrollo local)<br />
    <strong>• Variables de entorno de Vercel</strong> (producción)<br /><br />
    Una vez actualizados, reiniciá el servidor y hacé un sync manual desde <a href="/admin/singles" style="color:#22d3ee">/admin/singles</a>.
  </p>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Error: ${msg}`, { status: 500 });
  }
}
