-- ============================================================
-- Migration: premium_payments (pago único lifetime)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.premium_payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mp_payment_id  TEXT NOT NULL UNIQUE,
  amount_ars     NUMERIC(12,2),
  blue_rate      NUMERIC(10,2),
  price_usd      NUMERIC(8,2),
  status         TEXT NOT NULL DEFAULT 'approved',
  paid_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_premium_payments_profile ON public.premium_payments(profile_id);

ALTER TABLE public.premium_payments ENABLE ROW LEVEL SECURITY;

-- Solo el propio usuario puede ver sus pagos
CREATE POLICY "premium_payments_select_own"
  ON public.premium_payments FOR SELECT
  USING (profile_id = auth.uid());

-- Solo el service role puede insertar (via webhook)
CREATE POLICY "premium_payments_insert_service"
  ON public.premium_payments FOR INSERT
  WITH CHECK (false); -- blocked for anon/user; service role bypasses RLS
