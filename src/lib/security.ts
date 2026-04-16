import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

// ─── Server-side action rate limiter ─────────────────────────────────────────
// Uses an in-memory Map keyed by userId (or IP for unauthenticated).
// In multi-instance deployments, replace with Upstash Redis.

const actionRateMap = new Map<string, { count: number; resetAt: number }>();

export function checkActionRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = actionRateMap.get(key);
  if (!entry || entry.resetAt < now) {
    actionRateMap.set(key, { count: 1, resetAt: now + windowMs });
    return false; // not limited
  }
  entry.count++;
  return entry.count > limit; // true = limited
}

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of actionRateMap.entries()) {
      if (val.resetAt < now) actionRateMap.delete(key);
    }
  }, 5 * 60_000);
}

// ─── Guard: require authenticated, non-banned user ───────────────────────────

export type GuardResult =
  | { ok: true; userId: string }
  | { ok: false; error: string; status: 401 | 403 | 429 };

/**
 * Call at the start of any server action that writes data.
 * Checks:
 *  1. User is authenticated
 *  2. User is not banned
 *  3. (Optional) Rate limit: `limit` calls per `windowMs` ms per user
 */
export async function guardAction(opts?: {
  /** Max calls per windowMs. Default: no limit */
  rateLimit?: { limit: number; windowMs: number; key?: string };
}): Promise<GuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "No autenticado.", status: 401 };
  }

  // Check ban status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) {
    return { ok: false, error: "Tu cuenta está suspendida.", status: 403 };
  }

  // Rate limiting
  if (opts?.rateLimit) {
    const { limit, windowMs, key } = opts.rateLimit;
    const rateLimitKey = `${user.id}:${key ?? "action"}`;
    if (checkActionRateLimit(rateLimitKey, limit, windowMs)) {
      return {
        ok: false,
        error: "Demasiadas acciones en poco tiempo. Esperá un momento.",
        status: 429,
      };
    }
  }

  return { ok: true, userId: user.id };
}

// ─── Input sanitization helpers ───────────────────────────────────────────────

/** Strip HTML tags and trim whitespace */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")          // strip HTML tags
    .replace(/javascript:/gi, "")     // strip JS protocol
    .replace(/on\w+\s*=/gi, "")       // strip event handlers
    .trim();
}

/** Validate that a string is a valid UUID v4 */
export function isValidUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

/** Validate a card code format (e.g. "TRP-001") */
export function isValidCardCode(code: string): boolean {
  return /^[A-Z0-9]{2,6}-\d{3,4}[A-Z]?$/.test(code);
}

/** Get request IP from server action context (best-effort) */
export async function getRequestIP(): Promise<string> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}
