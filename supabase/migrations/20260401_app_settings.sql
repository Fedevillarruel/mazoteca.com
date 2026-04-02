-- =============================================================================
-- App Settings / Feature Flags
-- =============================================================================
-- Tabla de configuración global del sitio (feature flags, toggles).
-- Los admins pueden modificar estos valores desde el panel.
-- =============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT 'null'::jsonb,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES profiles(id)
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION trigger_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION trigger_app_settings_updated_at();

-- Solo admins pueden leer y escribir
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_settings" ON app_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "admins_write_settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Valores iniciales (feature flags)
INSERT INTO app_settings (key, value, description) VALUES
  ('singles_enabled',   'true'::jsonb,  'Muestra la sección de Singles en el sitio y en el catálogo'),
  ('cart_enabled',      'false'::jsonb, 'Habilita el carrito de compras (actualmente oculto)'),
  ('prices_enabled',    'false'::jsonb, 'Muestra los precios en el catálogo y en las cartas'),
  ('trades_enabled',    'true'::jsonb,  'Habilita el sistema de intercambios entre usuarios'),
  ('forum_enabled',     'true'::jsonb,  'Habilita el foro de la comunidad'),
  ('decks_enabled',     'true'::jsonb,  'Habilita el constructor de mazos'),
  ('album_enabled',     'true'::jsonb,  'Habilita el álbum de colección digital'),
  ('premium_enabled',   'true'::jsonb,  'Habilita las suscripciones Premium')
ON CONFLICT (key) DO NOTHING;
