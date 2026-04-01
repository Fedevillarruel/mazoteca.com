-- =============================================================================
-- Fix: agregar policy INSERT en profiles para que usuarios puedan crear su perfil
-- y un trigger para auto-crearlo al registrarse
-- =============================================================================

-- 1. Policy INSERT: cada usuario puede insertar solo su propia fila
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY "profiles_insert_own" ON profiles
      FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- 2. Trigger para auto-crear perfil cuando se registra un usuario nuevo
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username TEXT;
BEGIN
  -- Generar username desde metadata o email
  _username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    regexp_replace(lower(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '\s+', '', 'g'),
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );

  -- Si el username queda vacío, usar el email prefix
  IF _username = '' THEN
    _username := split_part(NEW.email, '@', 1);
  END IF;

  -- Insertar perfil (si ya existe lo ignora)
  INSERT INTO public.profiles (id, username, avatar_url, display_name)
  VALUES (
    NEW.id,
    _username,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger (drop primero si ya existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
