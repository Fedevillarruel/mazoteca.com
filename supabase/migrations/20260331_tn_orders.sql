-- ============================================================
-- Tabla de pedidos de TiendaNube vinculados a usuarios de la app
-- ============================================================

-- ── 1. Tabla principal de pedidos ────────────────────────────
CREATE TABLE IF NOT EXISTS public.tn_orders (
  id              bigint PRIMARY KEY,          -- order ID de TiendaNube
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  store_id        bigint,
  status          text NOT NULL DEFAULT 'open',
  -- Valores: open | closed | cancelled | pending | voided
  payment_status  text,
  -- Valores: pending | authorized | paid | voided | refunded | unpaid | in_mediation | charged_back
  shipping_status text,
  -- Valores: unshipped | unpacked | fulfilled | unfulfilled
  gateway         text,
  -- Pasarela de pago (mercadopago, etc.)
  currency        text NOT NULL DEFAULT 'ARS',
  total           numeric(12,2),
  subtotal        numeric(12,2),
  discount        numeric(12,2),
  shipping_cost   numeric(12,2),
  -- Datos del comprador (en caso de que user_id sea null)
  customer_email  text,
  customer_name   text,
  -- Líneas del pedido (snapshot JSON de lo que se compró)
  line_items      jsonb NOT NULL DEFAULT '[]',
  -- Datos de envío
  shipping_address jsonb,
  tracking_number  text,
  tracking_url     text,
  -- Timestamps de TN
  tn_created_at   timestamptz,
  tn_updated_at   timestamptz,
  -- Timestamps locales
  synced_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tn_orders_user_id        ON public.tn_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_tn_orders_customer_email ON public.tn_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_tn_orders_status         ON public.tn_orders(status);
CREATE INDEX IF NOT EXISTS idx_tn_orders_tn_created_at  ON public.tn_orders(tn_created_at DESC);

-- ── 2. RLS ───────────────────────────────────────────────────
ALTER TABLE public.tn_orders ENABLE ROW LEVEL SECURITY;

-- Usuario autenticado puede ver solo sus propios pedidos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tn_orders' AND policyname = 'tn_orders_user_read'
  ) THEN
    CREATE POLICY "tn_orders_user_read" ON public.tn_orders
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Admins pueden ver y modificar todo
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tn_orders' AND policyname = 'tn_orders_admin_all'
  ) THEN
    CREATE POLICY "tn_orders_admin_all" ON public.tn_orders
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
      );
  END IF;
END $$;

-- ── 3. Grants ────────────────────────────────────────────────
GRANT ALL  ON public.tn_orders TO service_role;
GRANT SELECT ON public.tn_orders TO authenticated;
