import { siteConfig } from "@/config/site";
import { allCards } from "@/data/cards";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl,                      lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/catalog`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${baseUrl}/decks`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${baseUrl}/forum`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${baseUrl}/faq`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/terms`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/premium`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Todas las páginas de cartas del catálogo — contenido real, indexable
  const cardRoutes: MetadataRoute.Sitemap = allCards.map((card) => ({
    url: `${baseUrl}/catalog/${card.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...cardRoutes];
}
