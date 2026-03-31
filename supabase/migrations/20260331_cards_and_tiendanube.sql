-- ============================================================
-- Migration: Cards catalog + Tiendanube sync tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. cards table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text UNIQUE NOT NULL,          -- e.g. KT001, KC001
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  card_type     text NOT NULL,                 -- tropa | coronado | realeza | estrategia | estrategia_primigenia | arroje
  category      text NOT NULL,                 -- Tropas | Coronados | Realeza | Estrategia | Estrategia Primigenia | Arroje
  level         smallint,                      -- 1-4 for tropas/arroje, null for others
  edition       text,
  crowned       text,                          -- for realeza: which coronado it belongs to
  finishes      text[],                        -- for coronados: array of finish types
  flavor_text   text,
  is_banned     boolean NOT NULL DEFAULT false,
  is_restricted boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast slug lookup (catalog page)
CREATE INDEX IF NOT EXISTS idx_cards_slug ON public.cards(slug);
CREATE INDEX IF NOT EXISTS idx_cards_code ON public.cards(code);
CREATE INDEX IF NOT EXISTS idx_cards_category ON public.cards(category);

-- RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards_public_read" ON public.cards FOR SELECT USING (true);
CREATE POLICY "cards_admin_write" ON public.cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','moderator')
    )
  );

-- ── 2. tiendanube_products: cache of TN product data ────────
CREATE TABLE IF NOT EXISTS public.tiendanube_products (
  id                   bigint PRIMARY KEY,          -- TN product id
  card_code            text REFERENCES public.cards(code) ON DELETE SET NULL,
  name                 text NOT NULL,
  description          text,
  handle               text,                        -- TN slug / handle
  published            boolean NOT NULL DEFAULT false,
  variants             jsonb NOT NULL DEFAULT '[]', -- raw TN variants array
  images               jsonb NOT NULL DEFAULT '[]', -- raw TN images array
  synced_at            timestamptz NOT NULL DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tn_products_card_code ON public.tiendanube_products(card_code);
CREATE INDEX IF NOT EXISTS idx_tn_products_published ON public.tiendanube_products(published);

ALTER TABLE public.tiendanube_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tn_products_public_read" ON public.tiendanube_products FOR SELECT USING (published = true);
CREATE POLICY "tn_products_admin_all"   ON public.tiendanube_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','moderator')
    )
  );

-- ── 3. tiendanube_variants: flattened variant rows ──────────
CREATE TABLE IF NOT EXISTS public.tiendanube_variants (
  id                bigint PRIMARY KEY,              -- TN variant id
  product_id        bigint NOT NULL REFERENCES public.tiendanube_products(id) ON DELETE CASCADE,
  card_code         text REFERENCES public.cards(code) ON DELETE SET NULL,
  sku               text,
  finish            text,                            -- e.g. "Común", "Holo", "Arte Alt."
  condition         text DEFAULT 'Near Mint',
  price             numeric(12,2),
  promotional_price numeric(12,2),
  stock             int NOT NULL DEFAULT 0,
  image_url         text,
  synced_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tn_variants_card_code ON public.tiendanube_variants(card_code);
CREATE INDEX IF NOT EXISTS idx_tn_variants_product   ON public.tiendanube_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_tn_variants_stock     ON public.tiendanube_variants(stock) WHERE stock > 0;

ALTER TABLE public.tiendanube_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tn_variants_public_read" ON public.tiendanube_variants FOR SELECT USING (stock > 0);
CREATE POLICY "tn_variants_admin_all"   ON public.tiendanube_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','moderator')
    )
  );

-- ── 4. tiendanube_sync_log ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tiendanube_sync_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger     text NOT NULL,                   -- 'cron' | 'webhook' | 'manual'
  status      text NOT NULL DEFAULT 'running', -- 'running' | 'success' | 'error'
  products_synced int DEFAULT 0,
  error_msg   text,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

ALTER TABLE public.tiendanube_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_log_admin_read" ON public.tiendanube_sync_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','moderator')
    )
  );

-- ── 5. updated_at trigger helper ────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cards_set_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 6. Seed all 209 cards ────────────────────────────────────
INSERT INTO public.cards (code, name, slug, card_type, category, level, edition, crowned, finishes, flavor_text)
VALUES
-- ── Tropas (79) ──
('KT001','ALDEANO','aldeano','tropa','Tropas',1,'1-25',NULL,NULL,'Antes de que Viggo devolviera la libertad a Fahridor, el aldeano ya resistía a su manera: plantando sin que le quedara nada.'),
('KT002','ESBIRRO DE FAHRIDOR','esbirro-de-fahridor','tropa','Tropas',1,'1-25',NULL,NULL,'Los esbirros de Fahridor aprendieron bajo Tarreghon cómo obedecer; bajo Viggo, aprendieron para qué.'),
('KT003','MINERO DE GOLDINFEIT','minero-de-goldinfeit','tropa','Tropas',1,'1-25',NULL,NULL,'El minero de Goldinfeit sabe que las vetas de oro no se encuentran: se merecen.'),
('KT004','GRANJERO','granjero','tropa','Tropas',1,'1-25',NULL,NULL,'Los granjeros de Aridhal alimentaron a un reino entero y aun así Tarreghon los llamó insuficientes.'),
('KT005','HERRERO','herrero','tropa','Tropas',1,'1-25',NULL,NULL,'El herrero de Blodkhail no eligió la guerra; la guerra eligió sus manos.'),
('KT006','LEÑADOR','lenador','tropa','Tropas',1,'1-25',NULL,NULL,'El leñador conoce cada árbol del bosque de Terruthum; también sabe cuál rama rompe mejor.'),
('KT007','ALDEANO CALVO','aldeano-calvo','tropa','Tropas',1,'1-25',NULL,NULL,'Un aldeano calvo con una pala ha detenido más invasiones que muchos soldados con espada.'),
('KT008','LANCERO','lancero','tropa','Tropas',2,'2-25',NULL,NULL,'La falange fahridorésa que derrocó a Tarreghon empezó con lanceros como este.'),
('KT009','SOLDADO','soldado','tropa','Tropas',2,'1-25',NULL,NULL,'«Libres desde ahora y para siempre.» Los soldados de Viggo grabaron esa frase en sus escudos.'),
('KT010','CLÉRIGO','clerigo','tropa','Tropas',2,'1-25',NULL,NULL,'El clérigo de Goldinfeit lleva la fe de Protea en el campo de batalla; a veces la fe salva más que la espada.'),
('KT011','SOLDADO DE FAHRIDOR','soldado-de-fahridor','tropa','Tropas',2,'1-25',NULL,NULL,'El soldado de Fahridor no pelea por un rey; pelea por la promesa que ese rey hizo.'),
('KT012','LANCERO DE GOLDINFEIT','lancero-de-goldinfeit','tropa','Tropas',2,'1-25',NULL,NULL,'El lancero de Goldinfeit aprendió su oficio en las murallas de Santa Protea, donde la precisión salva vidas.'),
('KT013','MERCENARIO COMÚN','mercenario-comun','tropa','Tropas',2,'2-25',NULL,NULL,'El mercenario común no tiene bandera; en Fahridor, eso lo hace más peligroso, no menos.'),
('KT014','ESCUDERO','escudero','tropa','Tropas',2,'1-25',NULL,NULL,'El escudero de Blodkhail creció oyendo la leyenda de Bludkut; hoy la vive cada vez que el enemigo avanza.'),
('KT015','DESOLLADOR','desollador','tropa','Tropas',2,'1-25',NULL,NULL,'El desollador de Fahridor trabaja en silencio; los susurros de Bludkut le enseñaron a no desperdiciar.'),
('KT016','DUELISTA','duelista','tropa','Tropas',3,'1-25',NULL,NULL,'El duelista fahridorés no busca victoria limpia; busca que el otro no pueda volver a levantarse.'),
('KT017','TEMPLARIO','templario','tropa','Tropas',3,'1-25',NULL,NULL,'Los templarios de Fahridor juran por Viggo, no por un dios; es el único juramento que no se rompe.'),
('KT018','ASESINO','asesino','tropa','Tropas',3,'1-25',NULL,NULL,'El asesino opera donde la guerra no puede: en los pasillos de Blodkhail, en posadas como Las Cinco Garras.'),
('KT019','GLADIADOR DE FAHRIDOR','gladiador-de-fahridor','tropa','Tropas',3,'1-25',NULL,NULL,'El gladiador de Fahridor fue entrenado en las arenas de Cos Drakhea donde perder significa no regresar.'),
('KT020','DEFENSOR DE GOLDINFEIT','defensor-de-goldinfeit','tropa','Tropas',3,'1-25',NULL,NULL,'El defensor de Goldinfeit fue el escudo de Arca Eidal cuando las noticias de Narcisus Tarreghon llegaron a la ciudad.'),
('KT021','ALABARDERO','alabardero','tropa','Tropas',3,'1-25',NULL,NULL,'La alabarda del ejército de Viggo barrió las calles de Blodkhail la noche que Tarreghon cayó.'),
('KT022','PIRÓMANO','piromano','tropa','Tropas',3,'2-25',NULL,NULL,'El pirómano de Fahridor conoce algo que los demás ignoran: que el fuego bien dirigido solo consume lo que debe.'),
('KT023','PROTECTOR','protector','tropa','Tropas',4,'1-25',NULL,NULL,'El protector no es el más fuerte; es el que sigue en pie cuando todos los demás caen.'),
('KT024','BÁRBARO DE FAHRIDOR','barbaro-de-fahridor','tropa','Tropas',4,'1-25',NULL,NULL,'«La sangre del valiente, de quien todo lo ha perdido.» Los bárbaros de Fahridor toman eso al pie de la letra.'),
('KT025','COLOSO','coloso','tropa','Tropas',4,'1-25',NULL,NULL,'El coloso de Fahridor empuja como si el peso de todos los años de opresión se acumulara en sus hombros.'),
('KT026','GUARDIÁN','guardian','tropa','Tropas',4,'2-25',NULL,NULL,'El guardián de Blodkhail vio a Viggo entrar con Bludkut y no olvidó jamás ese momento.'),
('KT027','VERDUGO','verdugo','tropa','Tropas',4,'2-25',NULL,NULL,'El verdugo no juzga; eso ya lo hizo Viggo.'),
('KT028','PALADIN DE GOLDINFEIT','paladin-de-goldinfeit','tropa','Tropas',4,'1-25',NULL,NULL,'El paladín de Goldinfeit juró ante el Templo de Protea; ese juramento pesa más que cualquier armadura.'),
('KT029','GRANJERO DE FAHRIDOR','granjero-de-fahridor','tropa','Tropas',1,'1-25',NULL,NULL,'El granjero de Fahridor aprendió a pelear cuando Tarreghon le quitó la cosecha por tercera vez.'),
('KT030','BANQUERA DE GOLDINFEIT','banquera-de-goldinfeit','tropa','Tropas',1,'1-25',NULL,NULL,'La banquera de Goldinfeit administra el oro que sostiene al Ejército Dorado; sin ella, las arcas se vacían.'),
('KT031','BUSCAPLEITOS','buscapleitos','tropa','Tropas',1,'1-25',NULL,NULL,'El buscapleitos de los mercados de Blodkhail sabe que la mejor pelea es la que el enemigo no espera.'),
('KT032','CIUDADANO DE GOLDINFEIT','ciudadano-de-goldinfeit','tropa','Tropas',1,'1-25',NULL,NULL,'Los ciudadanos de Santa Protea construyeron el mayor templo de Nujóm con sus propias manos; en la guerra hacen lo mismo.'),
('KT033','MENDIGO','mendigo','tropa','Tropas',1,'2-25',NULL,NULL,'El mendigo de Goldinfeit conoce todos los callejones de las seis Arcas; es el mejor espía que existe.'),
('KT034','PRESIDIARIO','presidiario','tropa','Tropas',1,'1-25',NULL,NULL,'El presidiario lleva en el cuerpo las marcas de lo que Tarreghon consideraba disciplina.'),
('KT035','SAQUEADOR DE TUMBAS','saqueador-de-tumbas','tropa','Tropas',1,'1-25',NULL,NULL,NULL),
('KT036','SEPULTURERO DE FAHRIDOR','sepulturero-de-fahridor','tropa','Tropas',1,'1-25',NULL,NULL,'El sepulturero de Fahridor trabaja cerca de La Pila; aprendió a no hacer preguntas.'),
('KT037','SACERDOTIZA DE GOLDINFEIT','sacerdotiza-de-goldinfeit','tropa','Tropas',2,'1-25',NULL,NULL,'La sacerdotiza de Goldinfeit oficia los rituales de Protea antes de cada campaña; los guerreros no parten sin su bendición.'),
('KT038','ACÓLITO DE GOLDINFEIT','acolito-de-goldinfeit','tropa','Tropas',2,'1-25',NULL,NULL,'El acólito de Goldinfeit practica la fe y el combate en proporciones iguales.'),
('KT039','ARQUERO','arquero','tropa','Tropas',2,'2-25',NULL,NULL,'El arquero entrenado en Arca Rajnel puede acertar una flecha donde el ojo dorado de Protea mira.'),
('KT040','BANDIDO','bandido','tropa','Tropas',2,'2-25',NULL,NULL,'El bandido de las rutas de Aridhal conoce cada piedra del camino; y exactamente dónde esconderse.'),
('KT041','DESOLADO DE FAHRIDOR','desolado-de-fahridor','tropa','Tropas',2,'1-25',NULL,NULL,'El desolado de Fahridor perdió todo bajo Tarreghon; por eso no le queda nada que perder en la batalla.'),
('KT042','ESPADACHIN MANCO','espadachin-manco','tropa','Tropas',2,'1-25',NULL,NULL,'Perdió la mano en el ataque a Blodkhail; conservó el orgullo de haber estado ahí.'),
('KT043','TEMERARIO','temerario','tropa','Tropas',2,'2-25',NULL,NULL,'El temerario de Fahridor aprendió el valor de lo que arriesga de Viggo: todo o nada.'),
('KT044','VIGILANTE DE FAHRIDOR','vigilante-de-fahridor','tropa','Tropas',2,'1-25',NULL,NULL,'El vigilante de Fahridor patrulla desde las ruinas de Bludutherúm hasta las costas de Cos Drakhea.'),
('KT045','ARQUERO REAL','arquero-real','tropa','Tropas',3,'2-25',NULL,NULL,'El arquero real de Goldinfeit lleva la misma puntería que los leones proteanos llevan en los ojos.'),
('KT046','BRUTO DE FAHRIDOR','bruto-de-fahridor','tropa','Tropas',3,'1-25',NULL,NULL,'El bruto de Fahridor no necesita estrategia: su tamaño ya es la estrategia.'),
('KT047','CARCELERO','carcelero','tropa','Tropas',3,'1-25',NULL,NULL,'El carcelero de Blodkhail sirvió al tirano Tarreghon; ahora sirve a Viggo, y no siente la diferencia.'),
('KT048','CENTINELA DE GOLDINFEIT','centinela-de-goldinfeit','tropa','Tropas',3,'1-25',NULL,NULL,'El centinela de Goldinfeit patrulla las seis Arcas; si algo se mueve sin permiso, él ya lo vio.'),
('KT049','JUSTICIERO','justiciero','tropa','Tropas',3,'1-25',NULL,NULL,'El justiciero de Fahridor sabe que la verdadera justicia no siempre tiene forma legal.'),
('KT050','SANGUINARIO DE FAHRIDOR','sanguinario-de-fahridor','tropa','Tropas',3,'1-25',NULL,NULL,'El sanguinario de Fahridor se alimenta del mismo furor que alimentó a Viggo la noche de la cripta.'),
('KT051','INQUISIDOR DE GOLDINFEIT','inquisidor-de-goldinfeit','tropa','Tropas',3,'1-25',NULL,NULL,'El inquisidor de Goldinfeit trabaja directamente para la corona; su veredicto es inapelable.'),
('KT052','ACORAZADO DE FAHRIDOR','acorazado-de-fahridor','tropa','Tropas',4,'1-25',NULL,NULL,'El acorazado de Fahridor fue forjado con el mismo acero que se usa para cubrir los establos de los pura sangre fahridoréses.'),
('KT053','EJECUTORA DE FAHRIDOR','ejecutora-de-fahridor','tropa','Tropas',4,'1-25',NULL,NULL,'La ejecutora de Fahridor lleva los mismos colores que portaba el ejército que Tarreghon deshizo. Ahora los usa para vengarse.'),
('KT054','FLAMÍGERO','flamigero','tropa','Tropas',4,'1-25',NULL,NULL,'El flamígero de Fahridor nació en las costas de Cos Drakhea; el fuego del mar le dio su nombre.'),
('KT055','GARRA DE GOLDINFEIT','garra-de-goldinfeit','tropa','Tropas',4,'1-25',NULL,NULL,'La garra de Goldinfeit es parte del Ejército Dorado: montada en león proteo, rastreando por orden de la reina.'),
('KT056','ZARPA DE GOLDINFEIT','zarpa-de-goldinfeit','tropa','Tropas',4,'1-25',NULL,NULL,'La zarpa de Goldinfeit lleva en el guantelete el oro de las minas de Valle Lingote; nadie la toma a la ligera.'),
('KT057','ESCORIA','escoria','tropa','Tropas',1,'2-25',NULL,NULL,'La escoria de Magmápia nació del castigo de Igno; lo que fue guardia de Piritio ahora obedece al verdadero portador.'),
('KT058','BASALTO','basalto','tropa','Tropas',2,'2-25',NULL,NULL,'El basalto de Estonbleiz fue formado por siglos de presión volcánica; así también sus guerreros.'),
('KT059','ESPINELA','espinela','tropa','Tropas',3,'2-25',NULL,NULL,'La espinela fue encontrada incrustada en un esqueleto con señales de quema. Los bardos dicen que era un guerrero de cristal.'),
('KT060','ONIX','onix','tropa','Tropas',4,'2-25',NULL,NULL,'El ónix negro brotó de los cuerpos transformados por el guantelete de Igno; parte hombre, parte piedra volcánica.'),
('KT061','ÓPALO','opalo','tropa','Tropas',3,'2-25',NULL,NULL,'El ópalo de Estonbleiz captura la luz como el volcán captura la ira: en silencio, hasta que ya no puede.'),
('KT062','GUERRERO DEL TEJÓN','guerrero-del-tejon','tropa','Tropas',3,'2-25',NULL,NULL,'El guerrero del tejón excava en la roca volcánica de Estonbleiz sin importar la temperatura ni el azufre.'),
('KT063','ROMPEROCA','romperoca','tropa','Tropas',1,'1-25',NULL,NULL,'El romperoca recolecta la obsidiana bléizica del Magmápyro; es la materia prima de las armas más letales de Nujóm.'),
('KT064','ESCULTOR','escultor','tropa','Tropas',1,'1-25',NULL,NULL,'El escultor de Estonbleiz trabaja la obsidiana bléizica con precisión quirúrgica; sus armas expulsan fuego de sus hojas.'),
('KT065','CUARZO','cuarzo','tropa','Tropas',1,'1-25',NULL,NULL,'El cuarzo de las cavernas de Estonbleiz brilla con luz propia, como el fuego que lo creó.'),
('KT066','HERBORISTA','herborista','tropa','Tropas',1,'1-25',NULL,NULL,'El herborista de Estonbleiz conoce cada planta que crece entre ríos de lava; sus pociones curan y queman por igual.'),
('KT067','COATÍ COLAESPINA','coati-colaespina','tropa','Tropas',1,'1-25',NULL,NULL,'El coatí colaespina de Gringud tiene espinas más duras que las ramas del roble negro.'),
('KT068','GUERRERA KAIHAT','guerrera-kaihat','tropa','Tropas',1,'1-25',NULL,NULL,'La guerrera Kaihat sigue a Erya con la misma devoción que las plantas siguen a la luz del sol.'),
('KT069','LICAÓN KAIHAT','licaon-kaihat','tropa','Tropas',1,'1-25',NULL,NULL,'El licaón Kaihat corre con el ritmo del viento de Gringud; quien lo persigue ya perdió.'),
('KT070','JASPE','jaspe','tropa','Tropas',2,'1-25',NULL,NULL,'El jaspe de Gringud nació en la tierra donde el volcán y el bosque se disputan el territorio.'),
('KT071','GUERRERO DESERTOR','guerrero-desertor','tropa','Tropas',2,'1-25',NULL,NULL,'El guerrero desertor sabe lo que es pelear del lado equivocado; ahora elige con más cuidado.'),
('KT072','LOBO GUKHAL','lobo-gukhal','tropa','Tropas',2,'1-25',NULL,NULL,'El lobo Gukhal responde al llamado de Erya antes de que el sonido llegue al oído de los demás.'),
('KT073','VIGÍA GUKHAL','vigia-gukhal','tropa','Tropas',2,'1-25',NULL,NULL,'La vigía Gukhal ve desde las copas más altas del bosque lo que a nivel del suelo es invisible.'),
('KT074','GRANATE','granate','tropa','Tropas',3,'1-25',NULL,NULL,'El granate de Gringud es la piedra que brilla como brasa y corta como espada.'),
('KT075','PANTERA CAMALEÓN','pantera-camaleon','tropa','Tropas',3,'1-25',NULL,NULL,'La pantera camaleón de Gringud desaparece en la espesura; cuando vuelve a ser visible, el combate ya terminó.'),
('KT076','CAZADORA AIATHEL','cazadora-aiathel','tropa','Tropas',3,'1-25',NULL,NULL,'La cazadora Aiathel aprendió de Erya que el mejor disparo es el que el enemigo nunca escucha.'),
('KT077','ZAFIRO','zafiro','tropa','Tropas',4,'1-25',NULL,NULL,'El zafiro de Gringud es tan duro como la voluntad de los que protegen el bosque.'),
('KT078','PROTECTOR PARDO DAIHAT','protector-pardo-daihat','tropa','Tropas',4,'1-25',NULL,NULL,'El Protector Pardo Daihat lleva las cicatrices del bosque en el pelaje; cada una es un enemigo que no volvió.'),
('KT079','KUDÚ REAL','kudu-real','tropa','Tropas',4,'1-25',NULL,NULL,'El kudú real de Gringud se mueve entre la maleza con una gracia que hace parecer al bosque cómplice.'),
-- ── Coronados (4) ──
('KC001','VIGGO DE FAHRIDOR','viggo-de-fahridor','coronado','Coronados',NULL,'1-25',NULL,ARRAY['Común','Holo','Arte Alt. F.A. Legacy','Arte Alt. Común','Arte Alt. S.T.','Arte Alt. F.A. Holo','Shadow Gold','Shadow Silver','Poster Común','Poster F.A.','Poster F.A. Holo'],'«Ahora tú me perteneces.» Bludkut le concedió el poder de derrocar a un tirano; los susurros que llegaron después fueron el verdadero precio.'),
('KC002','NEMEA DE GOLDINFEIT','nemea-de-goldinfeit','coronado','Coronados',NULL,'1-25',NULL,ARRAY['Común','Holo','Arte Alt. F.A. Legacy','Arte Alt. Común','Arte Alt. S.T.','Arte Alt. F.A. Holo','Shadow Gold','Shadow Silver','Poster Común','Poster F.A.','Poster F.A. Holo'],'Gobernar, proteger, conquistar: las tres sendas que Nemea juró recorrer el día que la corona de Goldinfeit cayó sobre el polvo ensangrentado.'),
('KC003','IGNO DE ESTONBLEIZ','igno-de-estonbleiz','coronado','Coronados',NULL,'1-25',NULL,ARRAY['Común','Holo','Arte Alt. Común','Arte Alt. S.T.','Arte Alt. F.A. Holo','Shadow Gold','Shadow Silver','Poster Común','Poster F.A.','Poster F.A. Holo'],'Cuando la Piedra Magmápyra tocó su hombro, los símbolos ardieron sobre su piel. El volcán había encontrado a su portador.'),
('KC004','ERYA DE GRINGUD','erya-de-gringud','coronado','Coronados',NULL,'1-25',NULL,ARRAY['Común','Holo','Arte Alt. Común','Arte Alt. S.T.','Arte Alt. F.A. Holo','Shadow Gold','Shadow Silver','Poster Común','Poster F.A.','Poster F.A. Holo'],'Erya escucha el lenguaje antiguo de los bosques de Gringud; quienes la siguen nunca necesitan ver el camino para avanzar.'),
-- ── Realeza (46) ──
('KR001','ARROJE ARRASADOR','arroje-arrasador','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'El arroje arrasador de Fahridor no distingue entre formación ni rango: todo cae igual ante Bludkut.'),
('KR002','ROMPE FLANQUEOS','rompe-flanqueos','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'Romper el flanqueo del enemigo es la primera lección que se aprende en Blodkhail.'),
('KR003','FURIA DE FAHRIDOR','furia-de-fahridor','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'La furia de Fahridor no nació en un trono; nació en los campos arrasados de Aridhal.'),
('KR004','AVANCE AL ENFRENTAMIENTO','avance-al-enfrentamiento','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'Viggo avanzó hacia la sala del trono sin detenerse. Los que se interponían simplemente dejaban de estar.'),
('KR005','REFUERZOS DE FAHRIDOR','refuerzos-de-fahridor','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'Cada kahridorés libre es un refuerzo que no necesita ser llamado dos veces.'),
('KR006','PRESENCIA INTIMIDANTE','presencia-intimidante','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'Quien ha visto a Viggo sostener la cabeza de Tarreghon en la mano no necesita más razón para huir.'),
('KR007','PODER DEL EJÉRCITO','poder-del-ejercito','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'Un ejército unido bajo promesa de libertad vale más que diez ejércitos de esclavos.'),
('KR008','POSTURA OFENSIVA','postura-ofensiva','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'La postura ofensiva de Goldinfeit fue heredada de reyes que entendieron que el oro sin acero no dura.'),
('KR009','GUARDIÁN ESPECTRAL','guardian-espectral','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'Los leones proteos de Santa Protea no son guardianes ordinarios: rastrean por instinto lo que ningún centinela podría ver.'),
('KR010','ESTOQUE CEGADOR','estoque-cegador','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'El estoque cegador de Goldinfeit lleva la bendición de Protea grabada en su hoja.'),
('KR011','DEFENSA FORTIFICADA','defensa-fortificada','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'Dieciocho generaciones de Waiswel construyeron las defensas de Santa Protea; Nemea las perfeccionó.'),
('KR012','PLEGARIA DE PROTECCIÓN','plegaria-de-proteccion','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'Protea no abandona a quienes elevan su nombre con sinceridad.'),
('KR013','SOBORNO DE TROPAS','soborno-de-tropas','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'El oro de Goldinfeit puede comprar lealtades; las garras de Nemea se encargan del resto.'),
('KR014','PAZ DE PROTEA','paz-de-protea','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'La paz de Protea no es ausencia de guerra; es la certeza de que el enemigo ya no puede atacar.'),
('KR015','LANZA DIVINA','lanza-divina','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'La lanza divina fue la primera arma que Nemea sostuvo en nombre de la corona.'),
('KR016','GARRAS ESPECTRALES','garras-espectrales','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'Las garras espectrales de los leones de Protea son tan reales como el miedo que provocan.'),
('KR017','ESCUDO DE ALMAS','escudo-de-almas','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'Las almas de quienes murieron defendiendo Fahridor son el verdadero escudo de Viggo.'),
('KR018','SACRIFICIO DEFENSIVO','sacrificio-defensivo','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'A veces sacrificar al que está de pie salva a los diez que vienen detrás.'),
('KR019','EXPLOSIÓN DE MARCAS','explosion-de-marcas','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'Las marcas que dejó la Piedra Magmápyra sobre su piel son el alfabeto que solo Emberor sabe leer.'),
('KR020','FUOCOARDENTE','fuocoardente','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'El Fuocoardente fue forjado en la primera gran erupción del Magmápyro; Igno lo blandió como si siempre le hubiese pertenecido.'),
('KR021','EXPLOSIÓN MAGMÁTICA','explosion-magmatica','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'La explosión magmática de Estonbleiz no es solo fuego: es la ira acumulada de siglos de reyes impostores.'),
('KR022','INTERCAMBIO EN LLAMAS','intercambio-en-llamas','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'Bajo el volcán todo intercambio termina en llamas; solo queda lo que resistió.'),
('KR023','MARCA MAGMÁPYRA','marca-magmapyra','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'La Marca Magmápyra aparece en la piel de los iniciados; los que no la soportan no regresan.'),
('KR024','ERUPCIÓN DEL MAGMÁPYRO','erupcion-del-magmapyro','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'El Magmápyro lleva siglos en silencio, pero el estruendo que acompañó a Igno demostró que solo esperaba al portador verdadero.'),
('KR025','COMBATE ARDIENTE','combate-ardiente','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'En Magmápia el combate se practica cerca del volcán para recordar que hay cosas más ardientes que la pelea.'),
('KR026','PROTECCIÓN DE EMBEROR','proteccion-de-emberor','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'Emberor no protege a los débiles; protege a quienes están dispuestos a arder por Estonbleiz.'),
('KR027','PORTADOR DE LAS LLAMAS','portador-de-las-llamas','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'El portador de las llamas lleva la Piedra Magmápyra en el guantelete; con ella, puede hacer y deshacer ejércitos.'),
('KR028','ESENCIA LLAMEANTE','esencia-llameante','realeza','Realeza',NULL,'1-25','Igno de Estonbleiz',NULL,'La esencia llameante de la obsidiana bléizica convierte un simple golpe en un recordatorio permanente.'),
('KR029','BALANCE DE TROPAS','balance-de-tropas','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'Erya equilibra las fuerzas de Gringud con la paciencia de quien sabe que la naturaleza siempre vuelve a su centro.'),
('KR030','BALANCE DE PODER','balance-de-poder','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'El balance de poder en Gringud no se negocia: se siente en el viento antes de que llegue la tormenta.'),
('KR031','FUERZA SALVAJE','fuerza-salvaje','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'La fuerza salvaje de Gringud no es violencia; es la ley natural del bosque aplicada al campo de batalla.'),
('KR032','FORMA ANIMAL','forma-animal','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'Erya puede adoptar la forma animal cuando el bosque lo requiere; y el bosque raramente se equivoca.'),
('KR033','DISPARO DE CAZADORA','disparo-de-cazadora','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'El disparo de cazadora llega antes de que el blanco sepa que fue apuntado.'),
('KR034','ACECHO DE CAZA','acecho-de-caza','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'El acecho de caza en Gringud se aprende observando a los predadores, no a los guerreros.'),
('KR035','ESPÍRITU SALVAJE','espiritu-salvaje','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'El espíritu salvaje de Gringud habita en cada árbol; Erya es solo su voz más audible.'),
('KR036','KHYLK','khylk','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'Khylk es el grito del bosque cuando alguien rompe el equilibrio que Erya protege.'),
('KR037','CORTEZA PROTECTORA','corteza-protectora','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'La corteza protectora no es un escudo ordinario; es el pacto entre el árbol y el guerrero.'),
('KR038','DISTRACCIÓN AÉREA','distraccion-aerea','realeza','Realeza',NULL,'1-25','Erya de Gringud',NULL,'La distracción aérea de Gringud llega desde lo alto, donde los enemigos nunca miran.'),
('KR039','COSECHA DE ALMAS','cosecha-de-almas','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'La Pila en Bludutherúm crece un poco más cada noche: es la ofrenda que Bludkut exige.'),
('KR040','AVANCE DEVASTADOR','avance-devastador','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'El avance devastador que arrasó con el castillo de Tarreghon lo hizo un solo hombre.'),
('KR041','PACTO DE BLUDKUT','pacto-de-bludkut','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'«La sangre del valiente, de quien todo lo ha perdido, lo liberará con fervor ardiente.» — Leyenda de Bludkut'),
('KR042','LA PILA','la-pila','realeza','Realeza',NULL,'1-25','Viggo de Fahridor',NULL,'La Pila es recordatorio, advertencia y promesa; y Viggo la alimenta con devoción.'),
('KR043','MILAGRO DE PROTEA','milagro-de-protea','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'Cuando Nemea reza, el Ejército Dorado escucha.'),
('KR044','REZO DE ABUNDANCIA','rezo-de-abundancia','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'Los graneros de Goldinfeit nunca se vacían; Protea prometió abundancia y sus devotos cumplieron su parte.'),
('KR045','RENDICIÓN DIVINA','rendicion-divina','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'Rendirse ante Nemea no es derrota: es reconocer que la diosa ya decidió.'),
('KR046','SACRIFICIO DE PAZ','sacrificio-de-paz','realeza','Realeza',NULL,'1-25','Nemea de Goldinfeit',NULL,'Paz obtenida por sacrificio es la única paz que dura en Nujóm.'),
-- ── Estrategia (52) ──
('KE001','¡REFUERZOS!','refuerzos','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'¡Refuerzos! El grito que el ejército de Viggo lanzó la madrugada en que Blodkhail fue liberado.'),
('KE002','ORDEN DE AVANCE','orden-de-avance','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'La orden de avance en Fahridor no se da dos veces; la segunda ya es demasiado tarde.'),
('KE003','ENTRENAMIENTO BÉLICO','entrenamiento-belico','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'Viggo entrenó a cada ciudadano libre de Fahridor; los susurros de Bludkut exigían que su ejército no tuviera límite.'),
('KE004','LLAMADO DEL HÉROE','llamado-del-heroe','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El llamado del héroe resuena en Nujóm desde que Viggo derrocó a Tarreghon; cada generación espera el suyo.'),
('KE005','ATACANTE INESPERADO','atacante-inesperado','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'Un atacante inesperado en las filas enemigas vale por tres soldados en la línea del frente.'),
('KE006','¡SORPRESA!','sorpresa','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'¡Sorpresa! La misma que sintieron los guardias de Tarreghon cuando un solo hombre tomó el castillo.'),
('KE007','EXPLOSIÓN SORPRESIVA','explosion-sorpresiva','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La explosión sorpresiva es el idioma de los apóstoles de las llamas: nadie los ve venir.'),
('KE008','HUIDA','huida','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'La huida estratégica no es cobardía; Igno huyó de Arca Eidal y luego reclamó Estonbleiz.'),
('KE009','SED DE SANGRE','sed-de-sangre','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'La sed de sangre de Bludkut se transfería a Viggo en susurros; no era una metáfora.'),
('KE010','ATURDIMIENTO','aturdimiento','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El aturdimiento llega antes de la espada en las tácticas que Nemea aprendió de su padre Paladio.'),
('KE011','DOBLE ATAQUE','doble-ataque','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'El doble ataque es la firma de Viggo: dos hojas, una acción, una sola oportunidad para el enemigo.'),
('KE012','FUERZA SOBREHUMANA','fuerza-sobrehumana','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La fuerza sobrehumana que Viggo sintió al tocar Bludkut era algo más allá de lo mortal.'),
('KE013','SEGUNDA OPORTUNIDAD','segunda-oportunidad','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'Segunda oportunidad: lo que Nemea le dio a los guerreros de Goldinfeit que cayeron al borde de Santa Protea.'),
('KE014','AUDACIA','audacia','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'La audacia de atacar primero en Nujóm separa a los vivos de los que debieron actuar antes.'),
('KE015','AUDACIA RIESGOSA','audacia-riesgosa','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La audacia riesgosa de Igno al fugarse de Arca Eidal lo llevó a los apóstoles de las llamas y al Magmápyro.'),
('KE016','DEFENSA CONJUNTA','defensa-conjunta','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La defensa conjunta de las seis Arcas de Goldinfeit ha rechazado más invasiones de las que los libros registran.'),
('KE017','AUDACIA DIABÓLICA','audacia-diabolica','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La audacia diabólica es la que tienen quienes saben que ya no tienen nada que perder.'),
('KE018','GRAN CONVOCACIÓN','gran-convocacion','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La gran convocación que levantó el ejército de cristal de Igno fue el mayor evento sísmico que Nujóm había visto.'),
('KE019','PASO TÁCTICO','paso-tactico','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El paso táctico en Estonbleiz se practica sobre suelo volcánico; el que pisa mal, no regresa.'),
('KE020','INTERCAMBIO DE POSICIÓN','intercambio-de-posicion','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'El intercambio de posición fue la maniobra que salvó a Igno cuando el león proteo lo acechaba en Arca Eidal.'),
('KE021','CAMBIO DE ESTRATEGIA','cambio-de-estrategia','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'Cambio de estrategia: lo que hacen los reinos cuando alguien como Viggo aparece de la nada.'),
('KE022','CONVOCACIÓN SACRIFICADA','convocacion-sacrificada','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La convocación sacrificada es el precio que los apóstoles de las llamas pagan para despertar al ejército de cristal.'),
('KE023','ALZAR ESCUDO','alzar-escudo','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'Alzar el escudo en Goldinfeit es un gesto sagrado; significa que Protea está siendo invocada.'),
('KE024','AUDACIA SAGRADA','audacia-sagrada','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La audacia sagrada de los guerreros de Goldinfeit tiene su origen en la promesa de Aurelio Waiswel.'),
('KE025','AUDACIA TÁCTICA','audacia-tactica','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La audacia táctica de Nemea combina la fe de su linaje con la brutalidad del Ejército Dorado.'),
('KE026','OSADÍA DEL VALIENTE','osadia-del-valiente','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La osadía del valiente: el mismo temple que tuvo Viggo al cortar su mano en la cripta de Bludutherúm.'),
('KE027','ATAQUE FURIOSO','ataque-furioso','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El ataque furioso que arrasó a los lacayos de Tarreghon no duró más que una noche.'),
('KE028','ESPADA AFILADA','espada-afilada','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La espada afilada de Fahridor se forja en Cos Drakhea con el metal más duro del reino.'),
('KE029','ESCUDO REFORZADO','escudo-reforzado','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El escudo reforzado de Goldinfeit lleva la insignia de Protea; eso solo ya detiene muchos ataques.'),
('KE030','ACTITUD COMBATIVA','actitud-combativa','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La actitud combativa de Gringud se practica desde la niñez; el bosque no tolera la debilidad.'),
('KE031','PASOS SIGILOSOS','pasos-sigilosos','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'Los pasos sigilosos son el dominio de quienes crecieron en los bosques de Gringud.'),
('KE032','DISTRACCIÓN DE NOVATOS','distraccion-de-novatos','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La distracción de novatos funciona con ejércitos entrenados por tiranos; todos los de Tarreghon caían en ella.'),
('KE033','RELEVO','relevo','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'El relevo en Goldinfeit es tan preciso como el cambio de guardia en el Templo de Protea.'),
('KE034','EMPUJE','empuje','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El empuje de Fahridor es el primer movimiento cuando Bludkut susurra.'),
('KE035','ESCUDO AÉREO','escudo-aereo','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El escudo aéreo de Gringud proviene de las copas de los árboles; allí donde los arqueros enemigos no esperan respuesta.'),
('KE036','REBOTE AÉREO','rebote-aereo','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El rebote aéreo de Gringud convierte cada flecha enemiga en una lección de precisión.'),
('KE037','ADRENALINA','adrenalina','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'La adrenalina de los guerreros de Fahridor fue descripta por Viggo como «el fuego que Bludkut pone en las venas».'),
('KE038','DEFENSA COMBATIVA','defensa-combativa','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La defensa combativa no espera al ataque: va al encuentro del peligro antes de que llegue.'),
('KE039','GOLPE DE ESCUDO','golpe-de-escudo','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El golpe de escudo fue lo que Igno recibió de los guardias de Piritio; fue también lo que les devolvió.'),
('KE040','LLUVIA DE FLECHAS','lluvia-de-flechas','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'La lluvia de flechas desde las Arcas de Goldinfeit fue lo que hizo retroceder al último ejército invasor.'),
('KE041','MUERTE CODICIOSA','muerte-codiciosa','estrategia','Estrategia',NULL,'2-25',NULL,NULL,'La muerte codiciosa es la que busca Bludkut: no una, sino todas.'),
('KE042','APREMIO DE BATALLA','apremio-de-batalla','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El apremio de batalla que Nemea transmite a sus tropas viene de saber que el oro de Goldinfeit siempre habrá quien quiera robarlo.'),
('KE043','MAESTRÍA DE COMBATE','maestria-de-combate','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La maestría de combate de los leones proteanos de Goldinfeit tardó seis generaciones en perfeccionarse.'),
('KE044','PUERTAS BLOQUEADAS','puertas-bloqueadas','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'Las puertas bloqueadas del castillo de obsidiana no frenaron a Igno ni por un momento.'),
('KE045','RECLUTAMIENTO','reclutamiento','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El reclutamiento en Fahridor es voluntario; eso lo hace más poderoso que cualquier conscripción.'),
('KE046','ATAQUE IMPLACABLE','ataque-implacable','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El ataque implacable es el que no da tiempo a pensar; Viggo fue el primero en enseñarlo.'),
('KE047','MOVIMIENTO ÁGIL','movimiento-agil','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El movimiento ágil de Gringud se aprende corriendo entre raíces y matorrales desde los primeros años.'),
('KE048','ATAQUE COMBINADO','ataque-combinado','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El ataque combinado de los clanes de Gringud fue descripto como «el bosque entero que se mueve».'),
('KE049','CAMUFLAJE SELVÁTICO','camuflaje-selvatico','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El camuflaje selvático en Gringud no es magia; es simplemente saber que la naturaleza siempre ocultará a quien la respeta.'),
('KE050','MANO A MANO','mano-a-mano','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El mano a mano es la única táctica que todos los guerreros de Nujóm comparten, sin importar el reino.'),
('KE051','LLAMADO DE LA MANADA','llamado-de-la-manada','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'El llamado de la manada retumba en los bosques de Gringud; quien lo escucha sabe que la batalla ya comenzó.'),
('KE052','DEFENSA IMPLACABLE','defensa-implacable','estrategia','Estrategia',NULL,'1-25',NULL,NULL,'La defensa implacable de Gringud fue lo que protegió el bosque cuando los ejércitos de Fahridor y Goldinfeit disputaban territorio.'),
-- ── Estrategia Primigenia (10) ──
('KP001','AUDACIA SUPREMA','audacia-suprema','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'La audacia suprema es la de quien entiende que el poder verdadero siempre tiene un costo.'),
('KP002','DESTREZA EXTREMA','destreza-extrema','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'La destreza extrema de los portadores de las llamas fue registrada antes de que existieran los libros de historia.'),
('KP003','HUIDA MAESTRA','huida-maestra','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'La huida maestra es la de Igno: no se huye para escapar, sino para regresar con más.'),
('KP004','OCUPAR POSICIÓN','ocupar-posicion','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'Ocupar posición en Nujóm no es cuestión de fuerza; es cuestión de llegar antes.'),
('KP005','DOBLE ATAQUE REAL','doble-ataque-real','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'El doble ataque real fue la técnica que Viggo usó cuando Bludkut le mostró todo su potencial.'),
('KP006','ATAQUE MAESTRO','ataque-maestro','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'El ataque maestro no se improvisa; es el resultado de años combatiendo en tierra volcánica, bosque cerrado o llanura abierta.'),
('KP007','DEFENSA MAESTRA','defensa-maestra','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'La defensa maestra de los reinos de Nujóm es la razón por la que ninguno ha caído sin pelear.'),
('KP008','SED DE BATALLA','sed-de-batalla','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'La sed de batalla que nació en Estonbleiz con Igno se transmitió al ejército de cristal que él mismo creó.'),
('KP009','ESCUDO ALIADO','escudo-aliado','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'El escudo aliado fue el gesto con el que el Ejército Dorado juró lealtad a Nemea el día de su coronación.'),
('KP010','ESPADA ALIADA','espada-aliada','estrategia_primigenia','Estrategia Primigenia',NULL,'1-25',NULL,NULL,'La espada aliada es la que se empuña cuando la causa es mayor que la propia vida.'),
-- ── Arroje (18) ──
('KA001','LANZA','lanza','arroje','Arroje',2,'1-25',NULL,NULL,'La lanza fahridorésa fue forjada en Cos Drakhea; su peso está calibrado para el largo brazo de los bárbaros del reino.'),
('KA002','DAGA ARROJADIZA','daga-arrojadiza','arroje','Arroje',2,'1-25',NULL,NULL,'La daga arrojadiza es el arma preferida de los espías de Blodkhail: silenciosa, certera, irreversible.'),
('KA003','BOMBA DE METRALLA','bomba-de-metralla','arroje','Arroje',3,'1-25',NULL,NULL,'La bomba de metralla fue diseñada en Estonbleiz aprovechando los fragmentos de obsidiana bléizica que el Magmápyro expulsa.'),
('KA004','BOMBA INCENDIARIA','bomba-incendiaria','arroje','Arroje',3,'1-25',NULL,NULL,'La bomba incendiaria es la versión de campaña del fuego que Igno porta en el guantelete.'),
('KA005','HACHA ARROJADIZA','hacha-arrojadiza','arroje','Arroje',3,'1-25',NULL,NULL,'El hacha arrojadiza de Fahridor recorre el aire con el mismo rugido que acompañó a Viggo en Bludutherúm.'),
('KA006','PIEDRA','piedra','arroje','Arroje',1,'1-25',NULL,NULL,'La piedra fue el primer arroje; los guerreros de Gringud nunca olvidaron la lección.'),
('KA007','FLECHA','flecha','arroje','Arroje',2,'1-25',NULL,NULL,'La flecha de Goldinfeit viaja más lejos que la vista; Protea guía su vuelo.'),
('KA008','FLECHA PERFORANTE','flecha-perforante','arroje','Arroje',2,'1-25',NULL,NULL,'La flecha perforante atraviesa las armaduras doradas de Goldinfeit como recuerdo de que ningún metal es invulnerable.'),
('KA009','FLECHA CONTUNDENTE','flecha-contundente','arroje','Arroje',2,'1-25',NULL,NULL,'La flecha contundente no mata al instante; detiene, y eso a veces es peor.'),
('KA010','FLECHA DE LARGO ALCANCE','flecha-de-largo-alcance','arroje','Arroje',3,'1-25',NULL,NULL,'La flecha de largo alcance de las Arcas de Goldinfeit llega a objetivos que el arquero no alcanza a ver.'),
('KA011','FLECHA DESTRUCTORA','flecha-destructora','arroje','Arroje',3,'1-25',NULL,NULL,'La flecha destructora de Gringud lleva veneno de la planta que solo crece al borde del Magmápyro.'),
('KA012','CADENA ATRAPANTE','cadena-atrapante','arroje','Arroje',3,'1-25',NULL,NULL,'La cadena atrapante fue inventada en Fahridor para los que intentaban huir de La Pila.'),
('KA013','LANZA LIGERA','lanza-ligera','arroje','Arroje',2,'1-25',NULL,NULL,'La lanza ligera es la que prefieren los soldados de Goldinfeit para campaña: fácil de llevar, difícil de desviar.'),
('KA014','DAGA PRECISA','daga-precisa','arroje','Arroje',2,'1-25',NULL,NULL,'La daga precisa del Ejército Dorado tiene la bendición de Protea grabada en la empuñadura.'),
('KA015','MARTILLÓMERANG','martillomerang','arroje','Arroje',2,'1-25',NULL,NULL,'El martillómerang de Estonbleiz fue forjado con obsidiana bléizica; vuelve al lanzador tan caliente como salió.'),
('KA016','BRAZAS LLAMEANTES','brazas-llameantes','arroje','Arroje',1,'1-25',NULL,NULL,'Las brazas llameantes son el arroje favorito de los apóstoles de las llamas: llegan sin aviso y recuerdan el fuego del Magmápyro.'),
('KA017','FLECHA SELVÁTICA','flecha-selvatica','arroje','Arroje',2,'1-25',NULL,NULL,'La flecha selvática de Gringud está tallada de un árbol que nunca se tala; solo se toman las ramas caídas.'),
('KA018','HACHA DE CAZA','hacha-de-caza','arroje','Arroje',2,'1-25',NULL,NULL,'El hacha de caza de Gringud vuelve siempre a la mano que la lanzó; el bosque la devuelva.')
ON CONFLICT (code) DO UPDATE SET
  name        = EXCLUDED.name,
  slug        = EXCLUDED.slug,
  card_type   = EXCLUDED.card_type,
  category    = EXCLUDED.category,
  level       = EXCLUDED.level,
  edition     = EXCLUDED.edition,
  crowned     = EXCLUDED.crowned,
  finishes    = EXCLUDED.finishes,
  flavor_text = EXCLUDED.flavor_text,
  updated_at  = now();

-- ── 7. Helper view: singles availability per card ────────────
CREATE OR REPLACE VIEW public.card_singles_availability AS
SELECT
  c.code                              AS card_code,
  c.name                              AS card_name,
  c.slug                              AS card_slug,
  COUNT(v.id) FILTER (WHERE v.stock > 0) AS variants_available,
  MIN(v.price) FILTER (WHERE v.stock > 0) AS min_price,
  MAX(v.price) FILTER (WHERE v.stock > 0) AS max_price,
  SUM(v.stock)                        AS total_stock,
  MAX(p.synced_at)                    AS last_synced
FROM public.cards c
LEFT JOIN public.tiendanube_products p ON p.card_code = c.code AND p.published = true
LEFT JOIN public.tiendanube_variants v ON v.card_code = c.code
GROUP BY c.code, c.name, c.slug;

-- ── 8. Grant service role access ────────────────────────────
-- (needed for Next.js admin client to bypass RLS on sync)
GRANT ALL ON public.tiendanube_products TO service_role;
GRANT ALL ON public.tiendanube_variants TO service_role;
GRANT ALL ON public.tiendanube_sync_log TO service_role;
GRANT ALL ON public.cards TO service_role;
