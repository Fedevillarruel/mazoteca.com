import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Safe internal-only redirect paths to prevent open-redirect attacks */
function isSafeRedirect(path: string): boolean {
  try {
    // Must start with / and not with // (protocol-relative) or contain :// (absolute URL)
    return (
      typeof path === "string" &&
      path.startsWith("/") &&
      !path.startsWith("//") &&
      !path.includes("://") &&
      !path.includes("\n") &&
      !path.includes("\r")
    );
  } catch {
    return false;
  }
}

/**
 * In-memory rate limiter for the Edge runtime.
 * Tracks request counts per IP in a sliding window.
 * For production at scale, replace with Upstash Redis or Vercel KV.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  if (entry.count > limit) return true;
  return false;
}

// Periodically clean up expired entries to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }, 60_000);
}

/**
 * Middleware to refresh Supabase auth session on every request.
 * Also handles protected route redirects.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session - IMPORTANT: do not remove
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Rate limiting on auth routes (brute-force protection) ────────────────
  const isAuthAction =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth/callback");

  if (isAuthAction && request.method === "POST") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    // 10 POST attempts per minute per IP on auth routes
    if (isRateLimited(ip, 10, 60_000)) {
      return new NextResponse(
        JSON.stringify({ error: "Demasiados intentos. Esperá un momento." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // ── Rate limiting on API routes (general protection) ─────────────────────
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    // Skip cron and webhook endpoints from rate limiting
    const isExempt =
      pathname.startsWith("/api/webhooks/") ||
      pathname.startsWith("/api/cron/") ||
      pathname.startsWith("/api/tiendanube/webhook");
    if (!isExempt && isRateLimited(ip, 60, 60_000)) {
      return new NextResponse(
        JSON.stringify({ error: "Demasiadas peticiones. Esperá un momento." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/collection") ||
    pathname.startsWith("/decks/new") ||
    pathname.startsWith("/decks/edit") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/trades") ||
    pathname.startsWith("/friends") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin");

  const isAdminRoute = pathname.startsWith("/admin");

  // Redirect unauthenticated users away from protected routes
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Validate the current path before using it as redirect target
    if (isSafeRedirect(pathname)) {
      url.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    const rawRedirect = request.nextUrl.searchParams.get("redirect") || "/";
    // Sanitize redirect to prevent open redirect attacks
    const safeRedirect = isSafeRedirect(rawRedirect) ? rawRedirect : "/";
    const url = request.nextUrl.clone();
    url.pathname = safeRedirect;
    url.searchParams.delete("redirect");
    url.search = ""; // clear all params
    return NextResponse.redirect(url);
  }

  // Admin route protection (role check happens at page level for more granularity)
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
