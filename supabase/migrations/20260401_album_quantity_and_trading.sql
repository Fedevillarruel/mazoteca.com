-- ============================================================
-- Migration: album quantity + card_listings + private_chats
-- ============================================================

-- 1. Agregar quantity a user_album
ALTER TABLE public.user_album
  ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0);

-- 2. Tabla de publicaciones de cartas (venta / intercambio)
CREATE TABLE IF NOT EXISTS public.card_listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_code     TEXT NOT NULL,
  listing_type  TEXT NOT NULL CHECK (listing_type IN ('sale', 'trade', 'both')),
  price         NUMERIC(10,2),                   -- solo para sale / both
  condition     TEXT NOT NULL DEFAULT 'near_mint',
  quantity      INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  note          TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'reserved', 'sold', 'cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_listings_seller   ON public.card_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_card_listings_code     ON public.card_listings(card_code);
CREATE INDEX IF NOT EXISTS idx_card_listings_status   ON public.card_listings(status);

ALTER TABLE public.card_listings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver publicaciones activas
CREATE POLICY "card_listings_select_active"
  ON public.card_listings FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

-- Solo el dueño puede insertar
CREATE POLICY "card_listings_insert_own"
  ON public.card_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Solo el dueño puede actualizar/cancelar
CREATE POLICY "card_listings_update_own"
  ON public.card_listings FOR UPDATE
  USING (auth.uid() = seller_id);

-- 3. Ofertas sobre publicaciones
CREATE TABLE IF NOT EXISTS public.listing_offers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID NOT NULL REFERENCES public.card_listings(id) ON DELETE CASCADE,
  buyer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_type   TEXT NOT NULL CHECK (offer_type IN ('buy', 'trade')),
  offer_card_code TEXT,            -- si es intercambio, qué carta ofrece
  offer_price  NUMERIC(10,2),      -- si es compra, cuánto ofrece
  note         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para evitar que el vendedor se ofrezca a sí mismo
CREATE OR REPLACE FUNCTION public.check_offer_not_seller()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.buyer_id = (SELECT seller_id FROM public.card_listings WHERE id = NEW.listing_id) THEN
    RAISE EXCEPTION 'El comprador no puede ser el mismo vendedor de la publicación';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_offer_not_seller
  BEFORE INSERT OR UPDATE ON public.listing_offers
  FOR EACH ROW EXECUTE FUNCTION public.check_offer_not_seller();

CREATE INDEX IF NOT EXISTS idx_listing_offers_listing ON public.listing_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_offers_buyer   ON public.listing_offers(buyer_id);

ALTER TABLE public.listing_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listing_offers_select"
  ON public.listing_offers FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR listing_id IN (SELECT id FROM public.card_listings WHERE seller_id = auth.uid())
  );

CREATE POLICY "listing_offers_insert_own"
  ON public.listing_offers FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "listing_offers_update_own"
  ON public.listing_offers FOR UPDATE
  USING (
    buyer_id = auth.uid()
    OR listing_id IN (SELECT id FROM public.card_listings WHERE seller_id = auth.uid())
  );

-- 4. Chats privados (1-a-1, ligados a un listing_offer)
CREATE TABLE IF NOT EXISTS public.private_chats (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id      UUID REFERENCES public.listing_offers(id) ON DELETE SET NULL,
  participant_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_chat_parties CHECK (participant_a != participant_b),
  CONSTRAINT uq_chat_offer UNIQUE (offer_id)
);

CREATE INDEX IF NOT EXISTS idx_private_chats_a ON public.private_chats(participant_a);
CREATE INDEX IF NOT EXISTS idx_private_chats_b ON public.private_chats(participant_b);

ALTER TABLE public.private_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "private_chats_select"
  ON public.private_chats FOR SELECT
  USING (participant_a = auth.uid() OR participant_b = auth.uid());

CREATE POLICY "private_chats_insert"
  ON public.private_chats FOR INSERT
  WITH CHECK (participant_a = auth.uid() OR participant_b = auth.uid());

-- 5. Mensajes del chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id    UUID NOT NULL REFERENCES public.private_chats(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat   ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select"
  ON public.chat_messages FOR SELECT
  USING (
    chat_id IN (
      SELECT id FROM public.private_chats
      WHERE participant_a = auth.uid() OR participant_b = auth.uid()
    )
  );

CREATE POLICY "chat_messages_insert"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND chat_id IN (
      SELECT id FROM public.private_chats
      WHERE participant_a = auth.uid() OR participant_b = auth.uid()
    )
  );

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_offers;
