import { NextResponse } from "next/server";

/**
 * GET /ads.txt
 * Sirve el archivo ads.txt requerido por Google AdSense.
 * Usar una route API garantiza que se sirva correctamente
 * independientemente de redirects de dominio (www vs no-www).
 */
export async function GET() {
  const content = `google.com, pub-2116982403838267, DIRECT, f08c47fec0942fa0`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400", // 24h
    },
  });
}
