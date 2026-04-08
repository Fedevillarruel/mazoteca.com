import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { ConditionalShell } from "@/components/layout/conditional-shell";
import { Providers } from "./providers";
import { TradeRatingPrompt } from "@/components/ui/trade-rating-prompt";
import { getCurrentUser } from "@/lib/actions/auth";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Catálogo y comunidad de TCG`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1219",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore(); // Fuerza re-ejecución en cada request — necesario para que el header detecte el login
  const session = await getCurrentUser();
  const headerUser = session?.profile
    ? {
        id: session.profile.id,
        username: session.profile.username,
        avatar_url: session.profile.avatar_url,
        is_premium: session.profile.is_premium,
        role: session.profile.role as string ?? "user",
      }
    : null;

  // Detectar si la ruta actual es una página privada/utilidad sin contenido para AdSense
  const reqHeaders = await headers();
  const pathname = reqHeaders.get("x-pathname") ?? reqHeaders.get("x-forwarded-uri") ?? "";
  const PRIVATE_PATHS = ["/trades", "/collection", "/notifications", "/settings", "/friends", "/orders", "/album", "/admin", "/auth", "/login", "/register"];
  const isPrivatePath = PRIVATE_PATHS.some((p) => pathname.startsWith(p));
  const showAds = !headerUser?.is_premium && !isPrivatePath;

  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Anti-flash: aplica tema y densidad desde localStorage antes de que el navegador pinte */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mz-theme')||'dark';var d=localStorage.getItem('mz-density')||'comfortable';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-density',d);}catch(e){}})();`,
          }}
        />
        {/* Google AdSense — solo para usuarios no-premium en páginas con contenido */}
        {showAds && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2116982403838267"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-surface-950 text-surface-100">
        <Providers>
          <ConditionalShell initialUser={headerUser}>
            {children}
          </ConditionalShell>
          {headerUser && <TradeRatingPrompt />}
        </Providers>
      </body>
    </html>
  );
}
