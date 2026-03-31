-- ============================================================
-- Migration: Agregar campos de categoría TN a variantes
-- Permite filtrar por juego y subcategoría dinámicamente
-- Run this in Supabase SQL Editor
-- ============================================================

-- Agregar tn_game (ej: "Kingdom TCG") y tn_subcategory (ej: "Arroje")
-- a tiendanube_variants para filtrado dinámico multi-TCG

ALTER TABLE public.tiendanube_variants
  ADD COLUMN IF NOT EXISTS tn_game        text,   -- nombre de la categoría raíz en TN (el juego)
  ADD COLUMN IF NOT EXISTS tn_subcategory text;   -- nombre de la subcategoría en TN (tipo de carta)

-- Índices para filtrado eficiente
CREATE INDEX IF NOT EXISTS idx_tn_variants_game        ON public.tiendanube_variants(tn_game);
CREATE INDEX IF NOT EXISTS idx_tn_variants_subcategory ON public.tiendanube_variants(tn_subcategory);
