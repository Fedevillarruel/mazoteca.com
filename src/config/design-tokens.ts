// ============================================================
// Design System Tokens — Mazoteca
// ============================================================
// This file documents the design system. Actual values are
// configured via Tailwind CSS custom theme in globals.css
// and component-level utilities.
// ============================================================

export const designTokens = {
  colors: {
    // Primary — Deep royal purple, evokes kingdom/royalty
    primary: {
      50: "#f5f0ff",
      100: "#ede5ff",
      200: "#dcceff",
      300: "#c4a8ff",
      400: "#a875ff",
      500: "#8b42ff", // main
      600: "#7c2df7",
      700: "#6a1ee3",
      800: "#5918bf",
      900: "#49159c",
      950: "#2d0b6a",
    },
    // Accent — Warm gold, evokes collectibles/premium
    accent: {
      50: "#fff9eb",
      100: "#ffefc6",
      200: "#ffdc88",
      300: "#ffc64a",
      400: "#ffad20",
      500: "#f99007", // main
      600: "#dd6a02",
      700: "#b74906",
      800: "#94370c",
      900: "#7a2e0d",
      950: "#461602",
    },
    // Surface / Background — Dark slate, clean and immersive
    surface: {
      50: "#f6f7f9",
      100: "#eceef2",
      200: "#d5dae2",
      300: "#b0bac9",
      400: "#8695ab",
      500: "#677891",
      600: "#526078",
      700: "#434e62",
      800: "#3a4353",
      900: "#1e2433", // main bg
      950: "#0f1219", // deepest
    },
    // Semantic
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  typography: {
    fontFamily: {
      heading: "'Inter', sans-serif",
      body: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
  },
  spacing: {
    page: {
      maxWidth: "1400px",
      padding: "1.5rem",
    },
    section: "4rem",
    card: "1.5rem",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  shadows: {
    card: "0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.3)",
    elevated:
      "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.3)",
    glow: "0 0 20px rgba(139, 66, 255, 0.15)",
  },
} as const;
