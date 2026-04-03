import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "fedini.app",
        pathname: "/_next/image/**",
      },
      // Tiendanube CDN images (product photos)
      {
        protocol: "https",
        hostname: "dcdn-us.mitiendanube.com",
      },
      {
        protocol: "https",
        hostname: "d3ugyf2ht4lz5a.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.mitiendanube.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // Prevent browsers from performing MIME sniffing
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + Next.js inline scripts (nonce not yet supported in App Router static) + Google (for OAuth/ads)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.google.com https://static.hotjar.com",
              // Styles: self + inline (Tailwind) + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + Supabase storage + Tiendanube CDN + data URIs + Google OAuth avatars
              "img-src 'self' data: blob: https://*.supabase.co https://dcdn-us.mitiendanube.com https://d3ugyf2ht4lz5a.cloudfront.net https://*.mitiendanube.com https://lh3.googleusercontent.com https://pagead2.googlesyndication.com",
              // Connect: self + Supabase (REST + realtime) + Google + MP + external APIs
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://dolarapi.com https://www.google.com https://www.googleapis.com",
              // Frames: MP checkout + Google OAuth
              "frame-src https://www.mercadopago.com.ar https://www.mercadopago.com https://sdk.mercadopago.com https://accounts.google.com",
              // Media
              "media-src 'self'",
              // Workers (Next.js service workers)
              "worker-src 'self' blob:",
              // Block all object embeds
              "object-src 'none'",
              // Restrict base URI
              "base-uri 'self'",
              // Prevent form submissions to external sites
              "form-action 'self'",
              // Upgrade insecure requests
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Protect API routes with additional headers
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
