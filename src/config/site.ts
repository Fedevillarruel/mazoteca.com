// ============================================================
// Application Configuration
// ============================================================

export const siteConfig = {
  name: "Mazoteca",
  shortName: "MZ",
  description:
    "Catálogo, singles, deck builder y comunidad para Kingdom TCG. Armá mazos, intercambiá cartas y competí.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  links: {
    discord: "https://discord.gg/mazoteca",
    twitter: "https://twitter.com/mazoteca",
    instagram: "https://instagram.com/mazoteca",
  },
  creator: "Mazoteca",
  keywords: [
    "Kingdom TCG",
    "mazoteca",
    "trading card game",
    "deck builder",
    "singles",
    "colección",
    "cartas",
    "comunidad",
  ],
} as const;

export const gameConfig = {
  // Current supported game
  defaultGameSlug: "kingdom-tcg",
  defaultGameName: "Kingdom TCG",

  // Deck rules for Kingdom TCG
  deckRules: {
    strategy: {
      name: "Mazo de Estrategia",
      minCards: 30,
      maxCards: 30,
      maxCopiesPerCard: 3,
    },
    combatants: {
      name: "Mazo de Combatientes",
      minCards: 34, // 33 + 1 crowned
      maxCards: 34,
      maxCopiesPerCard: 3,
      requiresCrowned: true,
      crownedSlots: 1,
      combatantSlots: 33,
    },
  },

  // Free tier limits
  freeTier: {
    maxDecks: 2,
    maxMarketplaceListings: 5,
    maxTradesPerDay: 3,
  },

  // Premium tier limits
  premiumTier: {
    maxDecks: 50,
    maxMarketplaceListings: 100,
    maxTradesPerDay: 50,
  },
} as const;

export const subscriptionConfig = {
  plans: {
    free: {
      id: "free",
      name: "Gratuito",
      price: 0,
      currency: "ARS",
      features: [
        "Explorar catálogo completo",
        "Colección digital y física",
        `Hasta ${gameConfig.freeTier.maxDecks} mazos`,
        `Hasta ${gameConfig.freeTier.maxMarketplaceListings} publicaciones`,
        "Participar en torneos",
        "Foro y comunidad",
      ],
    },
    premium: {
      id: "premium",
      name: "Premium",
      priceMonthly: 2999, // in cents
      currency: "ARS",
      features: [
        "Todo lo gratuito",
        `Hasta ${gameConfig.premiumTier.maxDecks} mazos`,
        `Hasta ${gameConfig.premiumTier.maxMarketplaceListings} publicaciones`,
        "Publicaciones destacadas",
        "Estadísticas avanzadas",
        "Badge premium en perfil",
        "Acceso anticipado a expansiones digitales",
        "Sin publicidad",
        "Soporte prioritario",
      ],
    },
  },
} as const;
