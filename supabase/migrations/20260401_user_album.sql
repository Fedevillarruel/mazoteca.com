-- ============================================================
-- Migration: user_album — álbum digital por código de carta
-- Reemplaza el uso de digital_inventory para el álbum visual
-- Run this in Supabase SQL Editor
-- ============================================================

-- Tabla simple: un registro por carta por usuario
CREATE TABLE IF NOT EXISTS public.user_album (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_code   TEXT NOT NULL,                -- ej: "KT001"
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, card_code)
);

-- Índice para lookup rápido
CREATE INDEX IF NOT EXISTS idx_user_album_profile ON public.user_album(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_album_code    ON public.user_album(card_code);

-- RLS
ALTER TABLE public.user_album ENABLE ROW LEVEL SECURITY;

-- Leer: solo el propio usuario
CREATE POLICY "user_album_select_own"
  ON public.user_album FOR SELECT
  USING (auth.uid() = profile_id);

-- Insertar: solo el propio usuario
CREATE POLICY "user_album_insert_own"
  ON public.user_album FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Eliminar: solo el propio usuario
CREATE POLICY "user_album_delete_own"
  ON public.user_album FOR DELETE
  USING (auth.uid() = profile_id);
