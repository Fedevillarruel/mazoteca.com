import { cn } from "@/lib/utils";
import { SidebarAd } from "@/components/ads/ad-banner";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showAds?: boolean;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Standard page layout with optional sidebar ads.
 * Desktop: content centered with ad rails on each side.
 * Mobile: full-width content, no side ads.
 */
export function PageLayout({
  children,
  title,
  description,
  showAds = true,
  className,
  fullWidth = false,
}: PageLayoutProps) {
  return (
    <main className="min-h-screen">
      <div
        className={cn(
          "mx-auto flex gap-6",
          fullWidth ? "max-w-full" : "max-w-[1400px] px-4 sm:px-6"
        )}
      >
        {/* Left Ad Rail */}
        {showAds && <SidebarAd slot="left-rail" />}

        {/* Main Content */}
        <div className={cn("flex-1 min-w-0 py-6", className)}>
          {(title || description) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-50">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 text-surface-400 text-sm sm:text-base">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>

        {/* Right Ad Rail */}
        {showAds && <SidebarAd slot="right-rail" />}
      </div>
    </main>
  );
}
