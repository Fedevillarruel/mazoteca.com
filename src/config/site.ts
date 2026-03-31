// ============================================================
// Application Configuration
// ============================================================

export const siteConfig = {
  name: "Mazoteca",
  shortName: "MZ",
  description:
    "Plataforma de cartas coleccionables: catálogo, singles, deck builder y comunidad. Armá mazos, intercambiá cartas y competí en múltiples TCGs.",
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
      totalCards: 30,          // exactamente 30 cartas
      minStrategyCards: 15,    // mín 15 cartas de estrategia
      maxStrategyCards: 30,    // máx 30 cartas de estrategia
      maxCopiesStrategyPerName: 2, // máx 2 cartas con el mismo nombre
      maxRoyaltyCards: 5,      // máx 5 cartas de realeza (opcionales)
      maxCopiesRoyaltyPerName: 1,  // cada carta de realeza debe tener nombre distinto
      maxThrowCards: 10,       // máx 10 cartas de arroje (opcionales)
      maxCopiesThrowPerName: 2,    // máx 2 cartas de arroje con el mismo nombre
    },
    combatants: {
      name: "Mazo de Combatientes",
      totalCards: 34,          // 33 tropas + 1 coronado
      crownedSlots: 1,         // exactamente 1 coronado (libre elección)
      troopSlots: 33,          // exactamente 33 tropas
      troopsByLevel: {         // distribución exacta por nivel
        1: 12,
        2: 12,
        3: 6,
        4: 3,
      },
      maxCopiesPerCard: 1,     // 1 copia por carta (selección libre)
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
