import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Bloquear bot de AdSense de páginas privadas/utilidad sin contenido real
        userAgent: "Mediapartners-Google",
        disallow: [
          "/trades/",
          "/trades/chat/",
          "/collection/",
          "/notifications/",
          "/friends/",
          "/settings/",
          "/admin/",
          "/api/",
          "/auth/",
          "/login/",
          "/register/",
          "/orders/",
          "/premium/",
          "/album/",
          "/decks/new",
          "/decks/",
        ],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/settings/",
          "/notifications/",
          "/trades/chat/",
          "/collection/",
          "/orders/",
          "/album/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
