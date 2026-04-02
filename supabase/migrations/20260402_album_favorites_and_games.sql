-- ============================================================
-- Migration: álbum — favoritos + multi-juego
-- ============================================================

-- 1. Columna is_favorite en user_album
ALTER TABLE public.user_album
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;

-- Índice para buscar favoritos rápido
CREATE INDEX IF NOT EXISTS idx_user_album_fav
  ON public.user_album(profile_id, is_favorite)
  WHERE is_favorite = true;

-- 2. Columna game en user_album (para multi-juego futuro)
--    Por ahora siempre será 'ktcg'. Permite extender sin romper nada.
ALTER TABLE public.user_album
  ADD COLUMN IF NOT EXISTS game TEXT NOT NULL DEFAULT 'ktcg';

CREATE INDEX IF NOT EXISTS idx_user_album_game
  ON public.user_album(profile_id, game);

-- 3. Policy para UPDATE (necesaria para toggle is_favorite)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_album'
    AND policyname = 'user_album_update_own'
  ) THEN
    CREATE POLICY "user_album_update_own"
      ON public.user_album FOR UPDATE
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
  END IF;
END
$$;
