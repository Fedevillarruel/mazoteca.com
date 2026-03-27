"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  className?: string;
  responsive?: boolean;
}

/**
 * Google AdSense banner component.
 * Only renders in production and only in sidebar positions.
 * Handles SSR gracefully by only initializing on the client.
 */
export function AdBanner({
  slot,
  format = "auto",
  className,
  responsive = true,
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      isLoaded.current = true;
    } catch {
      // AdSense not available, fail silently
    }
  }, []);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!clientId) {
    // In development, show placeholder
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={cn(
            "bg-surface-900 border border-dashed border-surface-700 rounded-lg flex items-center justify-center text-surface-500 text-xs min-h-[250px]",
            className
          )}
        >
          Ad Placeholder
        </div>
      );
    }
    return null;
  }

  return (
    <div ref={adRef} className={cn("ad-container", className)}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
      <p className="text-[10px] text-surface-600 mt-1 text-center">
        Publicidad
      </p>
    </div>
  );
}

/**
 * Sidebar ad wrapper — only visible on desktop.
 */
export function SidebarAd({ slot }: { slot: string }) {
  return (
    <aside className="hidden xl:block w-[160px] shrink-0">
      <div className="sticky top-24 space-y-4">
        <AdBanner slot={slot} format="vertical" />
      </div>
    </aside>
  );
}
