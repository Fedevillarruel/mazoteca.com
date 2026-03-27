// ============================================================
// Card Seed Data — Parsed from KTCG - Listado de Cartas.xlsx
// ============================================================

export type KTCGCardType =
  | "tropa"
  | "coronado"
  | "realeza"
  | "estrategia"
  | "estrategia_primigenia"
  | "arroje";

export type KTCGCategory =
  | "Tropas"
  | "Coronados"
  | "Realeza"
  | "Estrategia"
  | "Estrategia Primigenia"
  | "Arroje";

export interface KTCGCard {
  name: string;
  code: string;
  card_type: KTCGCardType;
  level: number | null;
  edition: string;
  slug: string;
  category: KTCGCategory;
  crowned?: string | null;
  finishes?: string[];
  cost?: number | null;
  flavor_text?: string | null;
}

// ---- Tropas (79 cards) ----

const tropas: KTCGCard[] = [
  { name: "ALDEANO", code: "KT001", card_type: "tropa", level: 1, edition: "1-25", slug: "aldeano", category: "Tropas" },
  { name: "ESBIRRO DE FAHRIDOR", code: "KT002", card_type: "tropa", level: 1, edition: "1-25", slug: "esbirro-de-fahridor", category: "Tropas" },
  { name: "MINERO DE GOLDINFEIT", code: "KT003", card_type: "tropa", level: 1, edition: "1-25", slug: "minero-de-goldinfeit", category: "Tropas" },
  { name: "GRANJERO", code: "KT004", card_type: "tropa", level: 1, edition: "1-25", slug: "granjero", category: "Tropas" },
  { name: "HERRERO", code: "KT005", card_type: "tropa", level: 1, edition: "1-25", slug: "herrero", category: "Tropas" },
  { name: "LEÑADOR", code: "KT006", card_type: "tropa", level: 1, edition: "1-25", slug: "lenador", category: "Tropas" },
  { name: "ALDEANO CALVO", code: "KT007", card_type: "tropa", level: 1, edition: "1-25", slug: "aldeano-calvo", category: "Tropas" },
  { name: "LANCERO", code: "KT008", card_type: "tropa", level: 2, edition: "2-25", slug: "lancero", category: "Tropas" },
  { name: "SOLDADO", code: "KT009", card_type: "tropa", level: 2, edition: "1-25", slug: "soldado", category: "Tropas" },
  { name: "CLÉRIGO", code: "KT010", card_type: "tropa", level: 2, edition: "1-25", slug: "clerigo", category: "Tropas" },
  { name: "SOLDADO DE FAHRIDOR", code: "KT011", card_type: "tropa", level: 2, edition: "1-25", slug: "soldado-de-fahridor", category: "Tropas" },
  { name: "LANCERO DE GOLDINFEIT", code: "KT012", card_type: "tropa", level: 2, edition: "1-25", slug: "lancero-de-goldinfeit", category: "Tropas" },
  { name: "MERCENARIO COMÚN", code: "KT013", card_type: "tropa", level: 2, edition: "2-25", slug: "mercenario-comun", category: "Tropas" },
  { name: "ESCUDERO", code: "KT014", card_type: "tropa", level: 2, edition: "1-25", slug: "escudero", category: "Tropas" },
  { name: "DESOLLADOR", code: "KT015", card_type: "tropa", level: 2, edition: "1-25", slug: "desollador", category: "Tropas" },
  { name: "DUELISTA", code: "KT016", card_type: "tropa", level: 3, edition: "1-25", slug: "duelista", category: "Tropas" },
  { name: "TEMPLARIO", code: "KT017", card_type: "tropa", level: 3, edition: "1-25", slug: "templario", category: "Tropas" },
  { name: "ASESINO", code: "KT018", card_type: "tropa", level: 3, edition: "1-25", slug: "asesino", category: "Tropas" },
  { name: "GLADIADOR DE FAHRIDOR", code: "KT019", card_type: "tropa", level: 3, edition: "1-25", slug: "gladiador-de-fahridor", category: "Tropas" },
  { name: "DEFENSOR DE GOLDINFEIT", code: "KT020", card_type: "tropa", level: 3, edition: "1-25", slug: "defensor-de-goldinfeit", category: "Tropas" },
  { name: "ALABARDERO", code: "KT021", card_type: "tropa", level: 3, edition: "1-25", slug: "alabardero", category: "Tropas" },
  { name: "PIRÓMANO", code: "KT022", card_type: "tropa", level: 3, edition: "2-25", slug: "piromano", category: "Tropas" },
  { name: "PROTECTOR", code: "KT023", card_type: "tropa", level: 4, edition: "1-25", slug: "protector", category: "Tropas" },
  { name: "BÁRBARO DE FAHRIDOR", code: "KT024", card_type: "tropa", level: 4, edition: "1-25", slug: "barbaro-de-fahridor", category: "Tropas" },
  { name: "COLOSO", code: "KT025", card_type: "tropa", level: 4, edition: "1-25", slug: "coloso", category: "Tropas" },
  { name: "GUARDIÁN", code: "KT026", card_type: "tropa", level: 4, edition: "2-25", slug: "guardian", category: "Tropas" },
  { name: "VERDUGO", code: "KT027", card_type: "tropa", level: 4, edition: "2-25", slug: "verdugo", category: "Tropas" },
  { name: "PALADIN DE GOLDINFEIT", code: "KT028", card_type: "tropa", level: 4, edition: "1-25", slug: "paladin-de-goldinfeit", category: "Tropas" },
  { name: "GRANJERO DE FAHRIDOR", code: "KT029", card_type: "tropa", level: 1, edition: "1-25", slug: "granjero-de-fahridor", category: "Tropas" },
  { name: "BANQUERA DE GOLDINFEIT", code: "KT030", card_type: "tropa", level: 1, edition: "1-25", slug: "banquera-de-goldinfeit", category: "Tropas" },
  { name: "BUSCAPLEITOS", code: "KT031", card_type: "tropa", level: 1, edition: "1-25", slug: "buscapleitos", category: "Tropas" },
  { name: "CIUDADANO DE GOLDINFEIT", code: "KT032", card_type: "tropa", level: 1, edition: "1-25", slug: "ciudadano-de-goldinfeit", category: "Tropas" },
  { name: "MENDIGO", code: "KT033", card_type: "tropa", level: 1, edition: "2-25", slug: "mendigo", category: "Tropas" },
  { name: "PRESIDIARIO", code: "KT034", card_type: "tropa", level: 1, edition: "1-25", slug: "presidiario", category: "Tropas" },
  { name: "SAQUEADOR DE TUMBAS", code: "KT035", card_type: "tropa", level: 1, edition: "1-25", slug: "saqueador-de-tumbas", category: "Tropas" },
  { name: "SEPULTURERO DE FAHRIDOR", code: "KT036", card_type: "tropa", level: 1, edition: "1-25", slug: "sepulturero-de-fahridor", category: "Tropas" },
  { name: "SACERDOTIZA DE GOLDINFEIT", code: "KT037", card_type: "tropa", level: 2, edition: "1-25", slug: "sacerdotiza-de-goldinfeit", category: "Tropas" },
  { name: "ACÓLITO DE GOLDINFEIT", code: "KT038", card_type: "tropa", level: 2, edition: "1-25", slug: "acolito-de-goldinfeit", category: "Tropas" },
  { name: "ARQUERO", code: "KT039", card_type: "tropa", level: 2, edition: "2-25", slug: "arquero", category: "Tropas" },
  { name: "BANDIDO", code: "KT040", card_type: "tropa", level: 2, edition: "2-25", slug: "bandido", category: "Tropas" },
  { name: "DESOLADO DE FAHRIDOR", code: "KT041", card_type: "tropa", level: 2, edition: "1-25", slug: "desolado-de-fahridor", category: "Tropas" },
  { name: "ESPADACHIN MANCO", code: "KT042", card_type: "tropa", level: 2, edition: "1-25", slug: "espadachin-manco", category: "Tropas" },
  { name: "TEMERARIO", code: "KT043", card_type: "tropa", level: 2, edition: "2-25", slug: "temerario", category: "Tropas" },
  { name: "VIGILANTE DE FAHRIDOR", code: "KT044", card_type: "tropa", level: 2, edition: "1-25", slug: "vigilante-de-fahridor", category: "Tropas" },
  { name: "ARQUERO REAL", code: "KT045", card_type: "tropa", level: 3, edition: "2-25", slug: "arquero-real", category: "Tropas" },
  { name: "BRUTO DE FAHRIDOR", code: "KT046", card_type: "tropa", level: 3, edition: "1-25", slug: "bruto-de-fahridor", category: "Tropas" },
  { name: "CARCELERO", code: "KT047", card_type: "tropa", level: 3, edition: "1-25", slug: "carcelero", category: "Tropas" },
  { name: "CENTINELA DE GOLDINFEIT", code: "KT048", card_type: "tropa", level: 3, edition: "1-25", slug: "centinela-de-goldinfeit", category: "Tropas" },
  { name: "JUSTICIERO", code: "KT049", card_type: "tropa", level: 3, edition: "1-25", slug: "justiciero", category: "Tropas" },
  { name: "SANGUINARIO DE FAHRIDOR", code: "KT050", card_type: "tropa", level: 3, edition: "1-25", slug: "sanguinario-de-fahridor", category: "Tropas" },
  { name: "INQUISIDOR DE GOLDINFEIT", code: "KT051", card_type: "tropa", level: 3, edition: "1-25", slug: "inquisidor-de-goldinfeit", category: "Tropas" },
  { name: "ACORAZADO DE FAHRIDOR", code: "KT052", card_type: "tropa", level: 4, edition: "1-25", slug: "acorazado-de-fahridor", category: "Tropas" },
  { name: "EJECUTORA DE FAHRIDOR", code: "KT053", card_type: "tropa", level: 4, edition: "1-25", slug: "ejecutora-de-fahridor", category: "Tropas" },
  { name: "FLAMÍGERO", code: "KT054", card_type: "tropa", level: 4, edition: "1-25", slug: "flamigero", category: "Tropas" },
  { name: "GARRA DE GOLDINFEIT", code: "KT055", card_type: "tropa", level: 4, edition: "1-25", slug: "garra-de-goldinfeit", category: "Tropas" },
  { name: "ZARPA DE GOLDINFEIT", code: "KT056", card_type: "tropa", level: 4, edition: "1-25", slug: "zarpa-de-goldinfeit", category: "Tropas" },
  { name: "ESCORIA", code: "KT057", card_type: "tropa", level: 1, edition: "2-25", slug: "escoria", category: "Tropas" },
  { name: "BASALTO", code: "KT058", card_type: "tropa", level: 2, edition: "2-25", slug: "basalto", category: "Tropas" },
  { name: "ESPINELA", code: "KT059", card_type: "tropa", level: 3, edition: "2-25", slug: "espinela", category: "Tropas" },
  { name: "ONIX", code: "KT060", card_type: "tropa", level: 4, edition: "2-25", slug: "onix", category: "Tropas" },
  { name: "ÓPALO", code: "KT061", card_type: "tropa", level: 3, edition: "2-25", slug: "opalo", category: "Tropas" },
  { name: "GUERRERO DEL TEJÓN", code: "KT062", card_type: "tropa", level: 3, edition: "2-25", slug: "guerrero-del-tejon", category: "Tropas" },
  { name: "ROMPEROCA", code: "KT063", card_type: "tropa", level: 1, edition: "1-25", slug: "romperoca", category: "Tropas" },
  { name: "ESCULTOR", code: "KT064", card_type: "tropa", level: 1, edition: "1-25", slug: "escultor", category: "Tropas" },
  { name: "CUARZO", code: "KT065", card_type: "tropa", level: 1, edition: "1-25", slug: "cuarzo", category: "Tropas" },
  { name: "HERBORISTA", code: "KT066", card_type: "tropa", level: 1, edition: "1-25", slug: "herborista", category: "Tropas" },
  { name: "COATÍ COLAESPINA", code: "KT067", card_type: "tropa", level: 1, edition: "1-25", slug: "coati-colaespina", category: "Tropas" },
  { name: "GUERRERA KAIHAT", code: "KT068", card_type: "tropa", level: 1, edition: "1-25", slug: "guerrera-kaihat", category: "Tropas" },
  { name: "LICAÓN KAIHAT", code: "KT069", card_type: "tropa", level: 1, edition: "1-25", slug: "licaon-kaihat", category: "Tropas" },
  { name: "JASPE", code: "KT070", card_type: "tropa", level: 2, edition: "1-25", slug: "jaspe", category: "Tropas" },
  { name: "GUERRERO DESERTOR", code: "KT071", card_type: "tropa", level: 2, edition: "1-25", slug: "guerrero-desertor", category: "Tropas" },
  { name: "LOBO GUKHAL", code: "KT072", card_type: "tropa", level: 2, edition: "1-25", slug: "lobo-gukhal", category: "Tropas" },
  { name: "VIGÍA GUKHAL", code: "KT073", card_type: "tropa", level: 2, edition: "1-25", slug: "vigia-gukhal", category: "Tropas" },
  { name: "GRANATE", code: "KT074", card_type: "tropa", level: 3, edition: "1-25", slug: "granate", category: "Tropas" },
  { name: "PANTERA CAMALEÓN", code: "KT075", card_type: "tropa", level: 3, edition: "1-25", slug: "pantera-camaleon", category: "Tropas" },
  { name: "CAZADORA AIATHEL", code: "KT076", card_type: "tropa", level: 3, edition: "1-25", slug: "cazadora-aiathel", category: "Tropas" },
  { name: "ZAFIRO", code: "KT077", card_type: "tropa", level: 4, edition: "1-25", slug: "zafiro", category: "Tropas" },
  { name: "PROTECTOR PARDO DAIHAT", code: "KT078", card_type: "tropa", level: 4, edition: "1-25", slug: "protector-pardo-daihat", category: "Tropas" },
  { name: "KUDÚ REAL", code: "KT079", card_type: "tropa", level: 4, edition: "1-25", slug: "kudu-real", category: "Tropas" },
];

// ---- Coronados (4 characters) ----

const coronados: KTCGCard[] = [
  {
    name: "VIGGO DE FAHRIDOR", code: "KC001", card_type: "coronado", level: null, edition: "1-25", slug: "viggo-de-fahridor", category: "Coronados",
    finishes: ["Común", "Holo", "Arte Alt. F.A. Legacy", "Arte Alt. Común", "Arte Alt. S.T.", "Arte Alt. F.A. Holo", "Shadow Gold", "Shadow Silver", "Poster Común", "Poster F.A.", "Poster F.A. Holo"],
  },
  {
    name: "NEMEA DE GOLDINFEIT", code: "KC002", card_type: "coronado", level: null, edition: "1-25", slug: "nemea-de-goldinfeit", category: "Coronados",
    finishes: ["Común", "Holo", "Arte Alt. F.A. Legacy", "Arte Alt. Común", "Arte Alt. S.T.", "Arte Alt. F.A. Holo", "Shadow Gold", "Shadow Silver", "Poster Común", "Poster F.A.", "Poster F.A. Holo"],
  },
  {
    name: "IGNO DE ESTONBLEIZ", code: "KC003", card_type: "coronado", level: null, edition: "1-25", slug: "igno-de-estonbleiz", category: "Coronados",
    finishes: ["Común", "Holo", "Arte Alt. Común", "Arte Alt. S.T.", "Arte Alt. F.A. Holo", "Shadow Gold", "Shadow Silver", "Poster Común", "Poster F.A.", "Poster F.A. Holo"],
  },
  {
    name: "ERYA DE GRINGUD", code: "KC004", card_type: "coronado", level: null, edition: "1-25", slug: "erya-de-gringud", category: "Coronados",
    finishes: ["Común", "Holo", "Arte Alt. Común", "Arte Alt. S.T.", "Arte Alt. F.A. Holo", "Shadow Gold", "Shadow Silver", "Poster Común", "Poster F.A.", "Poster F.A. Holo"],
  },
];

// ---- Realeza (46 cards) ----

const realeza: KTCGCard[] = [
  { name: "ARROJE ARRASADOR", code: "KR001", card_type: "realeza", level: null, edition: "1-25", slug: "arroje-arrasador", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "ROMPE FLANQUEOS", code: "KR002", card_type: "realeza", level: null, edition: "1-25", slug: "rompe-flanqueos", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "FURIA DE FAHRIDOR", code: "KR003", card_type: "realeza", level: null, edition: "1-25", slug: "furia-de-fahridor", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "AVANCE AL ENFRENTAMIENTO", code: "KR004", card_type: "realeza", level: null, edition: "1-25", slug: "avance-al-enfrentamiento", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "REFUERZOS DE FAHRIDOR", code: "KR005", card_type: "realeza", level: null, edition: "1-25", slug: "refuerzos-de-fahridor", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "PRESENCIA INTIMIDANTE", code: "KR006", card_type: "realeza", level: null, edition: "1-25", slug: "presencia-intimidante", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "PODER DEL EJÉRCITO", code: "KR007", card_type: "realeza", level: null, edition: "1-25", slug: "poder-del-ejercito", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "POSTURA OFENSIVA", code: "KR008", card_type: "realeza", level: null, edition: "1-25", slug: "postura-ofensiva", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "GUARDIÁN ESPECTRAL", code: "KR009", card_type: "realeza", level: null, edition: "1-25", slug: "guardian-espectral", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "ESTOQUE CEGADOR", code: "KR010", card_type: "realeza", level: null, edition: "1-25", slug: "estoque-cegador", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "DEFENSA FORTIFICADA", code: "KR011", card_type: "realeza", level: null, edition: "1-25", slug: "defensa-fortificada", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "PLEGARIA DE PROTECCIÓN", code: "KR012", card_type: "realeza", level: null, edition: "1-25", slug: "plegaria-de-proteccion", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "SOBORNO DE TROPAS", code: "KR013", card_type: "realeza", level: null, edition: "1-25", slug: "soborno-de-tropas", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "PAZ DE PROTEA", code: "KR014", card_type: "realeza", level: null, edition: "1-25", slug: "paz-de-protea", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "LANZA DIVINA", code: "KR015", card_type: "realeza", level: null, edition: "1-25", slug: "lanza-divina", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "GARRAS ESPECTRALES", code: "KR016", card_type: "realeza", level: null, edition: "1-25", slug: "garras-espectrales", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "ESCUDO DE ALMAS", code: "KR017", card_type: "realeza", level: null, edition: "1-25", slug: "escudo-de-almas", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "SACRIFICIO DEFENSIVO", code: "KR018", card_type: "realeza", level: null, edition: "1-25", slug: "sacrificio-defensivo", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "EXPLOSIÓN DE MARCAS", code: "KR019", card_type: "realeza", level: null, edition: "1-25", slug: "explosion-de-marcas", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "FUOCOARDENTE", code: "KR020", card_type: "realeza", level: null, edition: "1-25", slug: "fuocoardente", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "EXPLOSIÓN MAGMÁTICA", code: "KR021", card_type: "realeza", level: null, edition: "1-25", slug: "explosion-magmatica", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "INTERCAMBIO EN LLAMAS", code: "KR022", card_type: "realeza", level: null, edition: "1-25", slug: "intercambio-en-llamas", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "MARCA MAGMÁPYRA", code: "KR023", card_type: "realeza", level: null, edition: "1-25", slug: "marca-magmapyra", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "ERUPCIÓN DEL MAGMÁPYRO", code: "KR024", card_type: "realeza", level: null, edition: "1-25", slug: "erupcion-del-magmapyro", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "COMBATE ARDIENTE", code: "KR025", card_type: "realeza", level: null, edition: "1-25", slug: "combate-ardiente", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "PROTECCIÓN DE EMBEROR", code: "KR026", card_type: "realeza", level: null, edition: "1-25", slug: "proteccion-de-emberor", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "PORTADOR DE LAS LLAMAS", code: "KR027", card_type: "realeza", level: null, edition: "1-25", slug: "portador-de-las-llamas", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "ESENCIA LLAMEANTE", code: "KR028", card_type: "realeza", level: null, edition: "1-25", slug: "esencia-llameante", category: "Realeza", crowned: "Igno de Estonbleiz" },
  { name: "BALANCE DE TROPAS", code: "KR029", card_type: "realeza", level: null, edition: "1-25", slug: "balance-de-tropas", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "BALANCE DE PODER", code: "KR030", card_type: "realeza", level: null, edition: "1-25", slug: "balance-de-poder", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "FUERZA SALVAJE", code: "KR031", card_type: "realeza", level: null, edition: "1-25", slug: "fuerza-salvaje", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "FORMA ANIMAL", code: "KR032", card_type: "realeza", level: null, edition: "1-25", slug: "forma-animal", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "DISPARO DE CAZADORA", code: "KR033", card_type: "realeza", level: null, edition: "1-25", slug: "disparo-de-cazadora", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "ACECHO DE CAZA", code: "KR034", card_type: "realeza", level: null, edition: "1-25", slug: "acecho-de-caza", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "ESPÍRITU SALVAJE", code: "KR035", card_type: "realeza", level: null, edition: "1-25", slug: "espiritu-salvaje", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "KHYLK", code: "KR036", card_type: "realeza", level: null, edition: "1-25", slug: "khylk", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "CORTEZA PROTECTORA", code: "KR037", card_type: "realeza", level: null, edition: "1-25", slug: "corteza-protectora", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "DISTRACCIÓN AÉREA", code: "KR038", card_type: "realeza", level: null, edition: "1-25", slug: "distraccion-aerea", category: "Realeza", crowned: "Erya de Gringud" },
  { name: "COSECHA DE ALMAS", code: "KR039", card_type: "realeza", level: null, edition: "1-25", slug: "cosecha-de-almas", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "AVANCE DEVASTADOR", code: "KR040", card_type: "realeza", level: null, edition: "1-25", slug: "avance-devastador", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "PACTO DE BLUDKUT", code: "KR041", card_type: "realeza", level: null, edition: "1-25", slug: "pacto-de-bludkut", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "LA PILA", code: "KR042", card_type: "realeza", level: null, edition: "1-25", slug: "la-pila", category: "Realeza", crowned: "Viggo de Fahridor" },
  { name: "MILAGRO DE PROTEA", code: "KR043", card_type: "realeza", level: null, edition: "1-25", slug: "milagro-de-protea", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "REZO DE ABUNDANCIA", code: "KR044", card_type: "realeza", level: null, edition: "1-25", slug: "rezo-de-abundancia", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "RENDICIÓN DIVINA", code: "KR045", card_type: "realeza", level: null, edition: "1-25", slug: "rendicion-divina", category: "Realeza", crowned: "Nemea de Goldinfeit" },
  { name: "SACRIFICIO DE PAZ", code: "KR046", card_type: "realeza", level: null, edition: "1-25", slug: "sacrificio-de-paz", category: "Realeza", crowned: "Nemea de Goldinfeit" },
];

// ---- Estrategia (52 cards) ----

const estrategia: KTCGCard[] = [
  { name: "¡REFUERZOS!", code: "KE001", card_type: "estrategia", level: null, edition: "2-25", slug: "refuerzos", category: "Estrategia" },
  { name: "ORDEN DE AVANCE", code: "KE002", card_type: "estrategia", level: null, edition: "2-25", slug: "orden-de-avance", category: "Estrategia" },
  { name: "ENTRENAMIENTO BÉLICO", code: "KE003", card_type: "estrategia", level: null, edition: "1-25", slug: "entrenamiento-belico", category: "Estrategia" },
  { name: "LLAMADO DEL HÉROE", code: "KE004", card_type: "estrategia", level: null, edition: "1-25", slug: "llamado-del-heroe", category: "Estrategia" },
  { name: "ATACANTE INESPERADO", code: "KE005", card_type: "estrategia", level: null, edition: "1-25", slug: "atacante-inesperado", category: "Estrategia" },
  { name: "¡SORPRESA!", code: "KE006", card_type: "estrategia", level: null, edition: "1-25", slug: "sorpresa", category: "Estrategia" },
  { name: "EXPLOSIÓN SORPRESIVA", code: "KE007", card_type: "estrategia", level: null, edition: "1-25", slug: "explosion-sorpresiva", category: "Estrategia" },
  { name: "HUIDA", code: "KE008", card_type: "estrategia", level: null, edition: "2-25", slug: "huida", category: "Estrategia" },
  { name: "SED DE SANGRE", code: "KE009", card_type: "estrategia", level: null, edition: "2-25", slug: "sed-de-sangre", category: "Estrategia" },
  { name: "ATURDIMIENTO", code: "KE010", card_type: "estrategia", level: null, edition: "1-25", slug: "aturdimiento", category: "Estrategia" },
  { name: "DOBLE ATAQUE", code: "KE011", card_type: "estrategia", level: null, edition: "2-25", slug: "doble-ataque", category: "Estrategia" },
  { name: "FUERZA SOBREHUMANA", code: "KE012", card_type: "estrategia", level: null, edition: "1-25", slug: "fuerza-sobrehumana", category: "Estrategia" },
  { name: "SEGUNDA OPORTUNIDAD", code: "KE013", card_type: "estrategia", level: null, edition: "1-25", slug: "segunda-oportunidad", category: "Estrategia" },
  { name: "AUDACIA", code: "KE014", card_type: "estrategia", level: null, edition: "2-25", slug: "audacia", category: "Estrategia" },
  { name: "AUDACIA RIESGOSA", code: "KE015", card_type: "estrategia", level: null, edition: "1-25", slug: "audacia-riesgosa", category: "Estrategia" },
  { name: "DEFENSA CONJUNTA", code: "KE016", card_type: "estrategia", level: null, edition: "1-25", slug: "defensa-conjunta", category: "Estrategia" },
  { name: "AUDACIA DIABÓLICA", code: "KE017", card_type: "estrategia", level: null, edition: "1-25", slug: "audacia-diabolica", category: "Estrategia" },
  { name: "GRAN CONVOCACIÓN", code: "KE018", card_type: "estrategia", level: null, edition: "1-25", slug: "gran-convocacion", category: "Estrategia" },
  { name: "PASO TÁCTICO", code: "KE019", card_type: "estrategia", level: null, edition: "1-25", slug: "paso-tactico", category: "Estrategia" },
  { name: "INTERCAMBIO DE POSICIÓN", code: "KE020", card_type: "estrategia", level: null, edition: "2-25", slug: "intercambio-de-posicion", category: "Estrategia" },
  { name: "CAMBIO DE ESTRATEGIA", code: "KE021", card_type: "estrategia", level: null, edition: "1-25", slug: "cambio-de-estrategia", category: "Estrategia" },
  { name: "CONVOCACIÓN SACRIFICADA", code: "KE022", card_type: "estrategia", level: null, edition: "1-25", slug: "convocacion-sacrificada", category: "Estrategia" },
  { name: "ALZAR ESCUDO", code: "KE023", card_type: "estrategia", level: null, edition: "1-25", slug: "alzar-escudo", category: "Estrategia" },
  { name: "AUDACIA SAGRADA", code: "KE024", card_type: "estrategia", level: null, edition: "1-25", slug: "audacia-sagrada", category: "Estrategia" },
  { name: "AUDACIA TÁCTICA", code: "KE025", card_type: "estrategia", level: null, edition: "1-25", slug: "audacia-tactica", category: "Estrategia" },
  { name: "OSADÍA DEL VALIENTE", code: "KE026", card_type: "estrategia", level: null, edition: "1-25", slug: "osadia-del-valiente", category: "Estrategia" },
  { name: "ATAQUE FURIOSO", code: "KE027", card_type: "estrategia", level: null, edition: "1-25", slug: "ataque-furioso", category: "Estrategia" },
  { name: "ESPADA AFILADA", code: "KE028", card_type: "estrategia", level: null, edition: "1-25", slug: "espada-afilada", category: "Estrategia" },
  { name: "ESCUDO REFORZADO", code: "KE029", card_type: "estrategia", level: null, edition: "1-25", slug: "escudo-reforzado", category: "Estrategia" },
  { name: "ACTITUD COMBATIVA", code: "KE030", card_type: "estrategia", level: null, edition: "1-25", slug: "actitud-combativa", category: "Estrategia" },
  { name: "PASOS SIGILOSOS", code: "KE031", card_type: "estrategia", level: null, edition: "1-25", slug: "pasos-sigilosos", category: "Estrategia" },
  { name: "DISTRACCIÓN DE NOVATOS", code: "KE032", card_type: "estrategia", level: null, edition: "1-25", slug: "distraccion-de-novatos", category: "Estrategia" },
  { name: "RELEVO", code: "KE033", card_type: "estrategia", level: null, edition: "2-25", slug: "relevo", category: "Estrategia" },
  { name: "EMPUJE", code: "KE034", card_type: "estrategia", level: null, edition: "1-25", slug: "empuje", category: "Estrategia" },
  { name: "ESCUDO AÉREO", code: "KE035", card_type: "estrategia", level: null, edition: "1-25", slug: "escudo-aereo", category: "Estrategia" },
  { name: "REBOTE AÉREO", code: "KE036", card_type: "estrategia", level: null, edition: "1-25", slug: "rebote-aereo", category: "Estrategia" },
  { name: "ADRENALINA", code: "KE037", card_type: "estrategia", level: null, edition: "2-25", slug: "adrenalina", category: "Estrategia" },
  { name: "DEFENSA COMBATIVA", code: "KE038", card_type: "estrategia", level: null, edition: "1-25", slug: "defensa-combativa", category: "Estrategia" },
  { name: "GOLPE DE ESCUDO", code: "KE039", card_type: "estrategia", level: null, edition: "1-25", slug: "golpe-de-escudo", category: "Estrategia" },
  { name: "LLUVIA DE FLECHAS", code: "KE040", card_type: "estrategia", level: null, edition: "2-25", slug: "lluvia-de-flechas", category: "Estrategia" },
  { name: "MUERTE CODICIOSA", code: "KE041", card_type: "estrategia", level: null, edition: "2-25", slug: "muerte-codiciosa", category: "Estrategia" },
  { name: "APREMIO DE BATALLA", code: "KE042", card_type: "estrategia", level: null, edition: "1-25", slug: "apremio-de-batalla", category: "Estrategia" },
  { name: "MAESTRÍA DE COMBATE", code: "KE043", card_type: "estrategia", level: null, edition: "1-25", slug: "maestria-de-combate", category: "Estrategia" },
  { name: "PUERTAS BLOQUEADAS", code: "KE044", card_type: "estrategia", level: null, edition: "1-25", slug: "puertas-bloqueadas", category: "Estrategia" },
  { name: "RECLUTAMIENTO", code: "KE045", card_type: "estrategia", level: null, edition: "1-25", slug: "reclutamiento", category: "Estrategia" },
  { name: "ATAQUE IMPLACABLE", code: "KE046", card_type: "estrategia", level: null, edition: "1-25", slug: "ataque-implacable", category: "Estrategia" },
  { name: "MOVIMIENTO ÁGIL", code: "KE047", card_type: "estrategia", level: null, edition: "1-25", slug: "movimiento-agil", category: "Estrategia" },
  { name: "ATAQUE COMBINADO", code: "KE048", card_type: "estrategia", level: null, edition: "1-25", slug: "ataque-combinado", category: "Estrategia" },
  { name: "CAMUFLAJE SELVÁTICO", code: "KE049", card_type: "estrategia", level: null, edition: "1-25", slug: "camuflaje-selvatico", category: "Estrategia" },
  { name: "MANO A MANO", code: "KE050", card_type: "estrategia", level: null, edition: "1-25", slug: "mano-a-mano", category: "Estrategia" },
  { name: "LLAMADO DE LA MANADA", code: "KE051", card_type: "estrategia", level: null, edition: "1-25", slug: "llamado-de-la-manada", category: "Estrategia" },
  { name: "DEFENSA IMPLACABLE", code: "KE052", card_type: "estrategia", level: null, edition: "1-25", slug: "defensa-implacable", category: "Estrategia" },
];

// ---- Estrategia Primigenia (10 cards) ----

const estrategiaPrimigenia: KTCGCard[] = [
  { name: "AUDACIA SUPREMA", code: "KP001", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "audacia-suprema", category: "Estrategia Primigenia" },
  { name: "DESTREZA EXTREMA", code: "KP002", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "destreza-extrema", category: "Estrategia Primigenia" },
  { name: "HUIDA MAESTRA", code: "KP003", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "huida-maestra", category: "Estrategia Primigenia" },
  { name: "OCUPAR POSICIÓN", code: "KP004", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "ocupar-posicion", category: "Estrategia Primigenia" },
  { name: "DOBLE ATAQUE REAL", code: "KP005", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "doble-ataque-real", category: "Estrategia Primigenia" },
  { name: "ATAQUE MAESTRO", code: "KP006", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "ataque-maestro", category: "Estrategia Primigenia" },
  { name: "DEFENSA MAESTRA", code: "KP007", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "defensa-maestra", category: "Estrategia Primigenia" },
  { name: "SED DE BATALLA", code: "KP008", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "sed-de-batalla", category: "Estrategia Primigenia" },
  { name: "ESCUDO ALIADO", code: "KP009", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "escudo-aliado", category: "Estrategia Primigenia" },
  { name: "ESPADA ALIADA", code: "KP010", card_type: "estrategia_primigenia", level: null, edition: "1-25", slug: "espada-aliada", category: "Estrategia Primigenia" },
];

// ---- Arroje (18 cards) ----

const arroje: KTCGCard[] = [
  { name: "LANZA", code: "KA001", card_type: "arroje", level: 2, edition: "1-25", slug: "lanza", category: "Arroje" },
  { name: "DAGA ARROJADIZA", code: "KA002", card_type: "arroje", level: 2, edition: "1-25", slug: "daga-arrojadiza", category: "Arroje" },
  { name: "BOMBA DE METRALLA", code: "KA003", card_type: "arroje", level: 3, edition: "1-25", slug: "bomba-de-metralla", category: "Arroje" },
  { name: "BOMBA INCENDIARIA", code: "KA004", card_type: "arroje", level: 3, edition: "1-25", slug: "bomba-incendiaria", category: "Arroje" },
  { name: "HACHA ARROJADIZA", code: "KA005", card_type: "arroje", level: 3, edition: "1-25", slug: "hacha-arrojadiza", category: "Arroje" },
  { name: "PIEDRA", code: "KA006", card_type: "arroje", level: 1, edition: "1-25", slug: "piedra", category: "Arroje" },
  { name: "FLECHA", code: "KA007", card_type: "arroje", level: 2, edition: "1-25", slug: "flecha", category: "Arroje" },
  { name: "FLECHA PERFORANTE", code: "KA008", card_type: "arroje", level: 2, edition: "1-25", slug: "flecha-perforante", category: "Arroje" },
  { name: "FLECHA CONTUNDENTE", code: "KA009", card_type: "arroje", level: 2, edition: "1-25", slug: "flecha-contundente", category: "Arroje" },
  { name: "FLECHA DE LARGO ALCANCE", code: "KA010", card_type: "arroje", level: 3, edition: "1-25", slug: "flecha-de-largo-alcance", category: "Arroje" },
  { name: "FLECHA DESTRUCTORA", code: "KA011", card_type: "arroje", level: 3, edition: "1-25", slug: "flecha-destructora", category: "Arroje" },
  { name: "CADENA ATRAPANTE", code: "KA012", card_type: "arroje", level: 3, edition: "1-25", slug: "cadena-atrapante", category: "Arroje" },
  { name: "LANZA LIGERA", code: "KA013", card_type: "arroje", level: 2, edition: "1-25", slug: "lanza-ligera", category: "Arroje" },
  { name: "DAGA PRECISA", code: "KA014", card_type: "arroje", level: 2, edition: "1-25", slug: "daga-precisa", category: "Arroje" },
  { name: "MARTILLÓMERANG", code: "KA015", card_type: "arroje", level: 2, edition: "1-25", slug: "martillomerang", category: "Arroje" },
  { name: "BRAZAS LLAMEANTES", code: "KA016", card_type: "arroje", level: 1, edition: "1-25", slug: "brazas-llameantes", category: "Arroje" },
  { name: "FLECHA SELVÁTICA", code: "KA017", card_type: "arroje", level: 2, edition: "1-25", slug: "flecha-selvatica", category: "Arroje" },
  { name: "HACHA DE CAZA", code: "KA018", card_type: "arroje", level: 2, edition: "1-25", slug: "hacha-de-caza", category: "Arroje" },
];

// ---- Combined Export ----

// Ensure every exported card has a numeric `cost` field so UI can safely render it.
// Rule: use `level` when present; otherwise default to 3.
// Flavor texts inspired by the official lore (paraphrased/original). Keys are card codes.
const flavorTexts: Record<string, string> = {
  KC001: "Viggo mira el campo de batalla como quien cuenta capítulos: sabe cuándo incendiar y cuándo perdonar.",
  KC002: "Nemea vela por Goldinfeit; su palabra es ley y su escudo, promesa de abundancia.",
  KC003: "Igno trae en la piel la memoria del magma; donde pasa, la tierra renace en brasas.",
  KC004: "Erya habla en runas con los bosques; sus aliados no conocen el miedo.",
  KR001: "Cuando la marea de acero avanza, el destino de las fortificaciones se escribe con ruido de metal.",
  KR008: "Posturas ordenadas y disciplina: la victoria es un conjunto de pasos bien dados.",
  KR029: "Balancear las fuerzas es tan viejo como las estaciones; Erya lo hace con la calma de un robledal.",
  KT001: "No subestimes al aldeano: su constancia sostiene ejércitos y ciudades por igual.",
  KT008: "La punta de su lanza corta dudas y abre paso al resto de la falange.",
  KT009: "Soldado de mirada firme, forjado entre marchas y guardias nocturnas.",
  KT018: "Actúa en silencio y se recoge como sombra; su firma son las heridas precisas.",
  KT024: "Los bárbaros de Fahridor llevan el rugido de la estepa en el pecho y la tormenta en los puños.",
  KT068: "La guerrera Kaihat recorre las dunas con la destreza de quien conoce el viento.",
  KT072: "El lobo del norte aúlla una llamada antigua; sus dientes guardan historias de caza.",
  KT078: "Su pelaje oculta cicatrices y juramentos: el Protector Pardo cumple con la ley del clan.",
};

export const allCards: KTCGCard[] = [
  ...tropas,
  ...coronados,
  ...realeza,
  ...estrategia,
  ...estrategiaPrimigenia,
  ...arroje,
].map((c) => ({
  // preserve original shape and add cost/flavor_text if missing
  ...c,
  cost: c.cost ?? (c.level != null ? c.level : 3),
  flavor_text: c.flavor_text ?? flavorTexts[c.code] ?? null,
}));

// ---- Helper Constants ----

export const cardCategories: KTCGCategory[] = [
  "Tropas",
  "Coronados",
  "Realeza",
  "Estrategia",
  "Estrategia Primigenia",
  "Arroje",
];

export const factions = [
  "Fahridor",
  "Goldinfeit",
  "Estonbleiz",
  "Gringud",
] as const;

// Aliases / sub-factions: when filtering by 'Gringud' we also want to include
// cards that reference the historical sub-factions Gukhal, Daihat or Kaihat.
export const factionAliases: Record<string, string[]> = {
  gringud: ["gringud", "gukhal", "daihat", "kaihat"],
};

export const coronadoNames = [
  "VIGGO DE FAHRIDOR",
  "NEMEA DE GOLDINFEIT",
  "IGNO DE ESTONBLEIZ",
  "ERYA DE GRINGUD",
] as const;

// ---- Helper Functions ----

export function getCardsByCategory(category: KTCGCategory): KTCGCard[] {
  return allCards.filter((c) => c.category === category);
}

export function getCardByCode(code: string): KTCGCard | undefined {
  return allCards.find((c) => c.code === code);
}

export function getCardBySlug(slug: string): KTCGCard | undefined {
  return allCards.find((c) => c.slug === slug);
}

export function getCardsByFaction(faction: string): KTCGCard[] {
  const key = faction.toLowerCase();
  const aliases = factionAliases[key] ?? [key];
  return allCards.filter((c) =>
    aliases.some((a) => c.name.toLowerCase().includes(a) || c.crowned?.toLowerCase().includes(a))
  );
}

export function getCardsByLevel(level: number): KTCGCard[] {
  return allCards.filter((c) => c.level === level);
}

export const cardStats = {
  total: allCards.length,
  tropas: tropas.length,
  coronados: coronados.length,
  realeza: realeza.length,
  estrategia: estrategia.length,
  estrategiaPrimigenia: estrategiaPrimigenia.length,
  arroje: arroje.length,
} as const;
