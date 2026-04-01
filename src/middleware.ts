import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Global middleware entrypoint.
 * - Skip webhook endpoints so third-party services (MercadoPago) can POST without receiving redirects.
 * - Delegate other requests to the Supabase session refresher `updateSession`.
 */
export async function middleware(request: NextRequest) {
	// For other requests, run the existing Supabase session middleware
	return await updateSession(request);
}

export const config = {
	// Exclude webhooks, static assets, and Next.js internals from middleware
	// so that third-party POST requests (MercadoPago, etc.) never get redirected.
	matcher: [
		"/((?!api/webhooks|_next/static|_next/image|favicon.ico|ads.txt|static).*)",
	],
};
