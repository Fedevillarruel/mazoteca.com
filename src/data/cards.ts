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
// ---- Flavor Texts — based on official Kingdom TCG lore ----
// Source: https://kingdom-tcg.com/lore/ (Fahridor, Goldinfeit, Estonbleiz)
// Phrases are paraphrased / original inspired by the official narrative. Keys are card codes.
const flavorTexts: Record<string, string> = {
  // ── Coronados ──────────────────────────────────────────────────────────────
  KC001: "«Ahora tú me perteneces.» Bludkut le concedió el poder de derrocar a un tirano; los susurros que llegaron después fueron el verdadero precio.",
  KC002: "Gobernar, proteger, conquistar: las tres sendas que Nemea juró recorrer el día que la corona de Goldinfeit cayó sobre el polvo ensangrentado.",
  KC003: "Cuando la Piedra Magmápyra tocó su hombro, los símbolos ardieron sobre su piel. El volcán había encontrado a su portador.",
  KC004: "Erya escucha el lenguaje antiguo de los bosques de Gringud; quienes la siguen nunca necesitan ver el camino para avanzar.",

  // ── Realeza — Viggo ────────────────────────────────────────────────────────
  KR001: "El arroje arrasador de Fahridor no distingue entre formación ni rango: todo cae igual ante Bludkut.",
  KR002: "Romper el flanqueo del enemigo es la primera lección que se aprende en Blodkhail.",
  KR003: "La furia de Fahridor no nació en un trono; nació en los campos arrasados de Aridhal.",
  KR004: "Viggo avanzó hacia la sala del trono sin detenerse. Los que se interponían simplemente dejaban de estar.",
  KR005: "Cada kahridorés libre es un refuerzo que no necesita ser llamado dos veces.",
  KR006: "Quien ha visto a Viggo sostener la cabeza de Tarreghon en la mano no necesita más razón para huir.",
  KR007: "Un ejército unido bajo promesa de libertad vale más que diez ejércitos de esclavos.",
  KR017: "Las almas de quienes murieron defendiendo Fahridor son el verdadero escudo de Viggo.",
  KR018: "A veces sacrificar al que está de pie salva a los diez que vienen detrás.",
  KR039: "La Pila en Bludutherúm crece un poco más cada noche: es la ofrenda que Bludkut exige.",
  KR040: "El avance devastador que arrasó con el castillo de Tarreghon lo hizo un solo hombre.",
  KR041: "«La sangre del valiente, de quien todo lo ha perdido, lo liberará con fervor ardiente.» — Leyenda de Bludkut",
  KR042: "La Pila es recordatorio, advertencia y promesa; y Viggo la alimenta con devoción.",

  // ── Realeza — Nemea ───────────────────────────────────────────────────────
  KR008: "La postura ofensiva de Goldinfeit fue heredada de reyes que entendieron que el oro sin acero no dura.",
  KR009: "Los leones proteos de Santa Protea no son guardianes ordinarios: rastrean por instinto lo que ningún centinela podría ver.",
  KR010: "El estoque cegador de Goldinfeit lleva la bendición de Protea grabada en su hoja.",
  KR011: "Dieciocho generaciones de Waiswel construyeron las defensas de Santa Protea; Nemea las perfeccionó.",
  KR012: "Protea no abandona a quienes elevan su nombre con sinceridad.",
  KR013: "El oro de Goldinfeit puede comprar lealtades; las garras de Nemea se encargan del resto.",
  KR014: "La paz de Protea no es ausencia de guerra; es la certeza de que el enemigo ya no puede atacar.",
  KR015: "La lanza divina fue la primera arma que Nemea sostuvo en nombre de la corona.",
  KR016: "Las garras espectrales de los leones de Protea son tan reales como el miedo que provocan.",
  KR043: "Cuando Nemea reza, el Ejército Dorado escucha.",
  KR044: "Los graneros de Goldinfeit nunca se vacían; Protea prometió abundancia y sus devotos cumplieron su parte.",
  KR045: "Rendirse ante Nemea no es derrota: es reconocer que la diosa ya decidió.",
  KR046: "Paz obtenida por sacrificio es la única paz que dura en Nujóm.",

  // ── Realeza — Igno ────────────────────────────────────────────────────────
  KR019: "Las marcas que dejó la Piedra Magmápyra sobre su piel son el alfabeto que solo Emberor sabe leer.",
  KR020: "El Fuocoardente fue forjado en la primera gran erupción del Magmápyro; Igno lo blandió como si siempre le hubiese pertenecido.",
  KR021: "La explosión magmática de Estonbleiz no es solo fuego: es la ira acumulada de siglos de reyes impostores.",
  KR022: "Bajo el volcán todo intercambio termina en llamas; solo queda lo que resistió.",
  KR023: "La Marca Magmápyra aparece en la piel de los iniciados; los que no la soportan no regresan.",
  KR024: "El Magmápyro lleva siglos en silencio, pero el estruendo que acompañó a Igno demostró que solo esperaba al portador verdadero.",
  KR025: "En Magmápia el combate se practica cerca del volcán para recordar que hay cosas más ardientes que la pelea.",
  KR026: "Emberor no protege a los débiles; protege a quienes están dispuestos a arder por Estonbleiz.",
  KR027: "El portador de las llamas lleva la Piedra Magmápyra en el guantelete; con ella, puede hacer y deshacer ejércitos.",
  KR028: "La esencia llameante de la obsidiana bléizica convierte un simple golpe en un recordatorio permanente.",

  // ── Realeza — Erya ────────────────────────────────────────────────────────
  KR029: "Erya equilibra las fuerzas de Gringud con la paciencia de quien sabe que la naturaleza siempre vuelve a su centro.",
  KR030: "El balance de poder en Gringud no se negocia: se siente en el viento antes de que llegue la tormenta.",
  KR031: "La fuerza salvaje de Gringud no es violencia; es la ley natural del bosque aplicada al campo de batalla.",
  KR032: "Erya puede adoptar la forma animal cuando el bosque lo requiere; y el bosque raramente se equivoca.",
  KR033: "El disparo de cazadora llega antes de que el blanco sepa que fue apuntado.",
  KR034: "El acecho de caza en Gringud se aprende observando a los predadores, no a los guerreros.",
  KR035: "El espíritu salvaje de Gringud habita en cada árbol; Erya es solo su voz más audible.",
  KR036: "Khylk es el grito del bosque cuando alguien rompe el equilibrio que Erya protege.",
  KR037: "La corteza protectora no es un escudo ordinario; es el pacto entre el árbol y el guerrero.",
  KR038: "La distracción aérea de Gringud llega desde lo alto, donde los enemigos nunca miran.",

  // ── Tropas — Fahridor ─────────────────────────────────────────────────────
  KT001: "Antes de que Viggo devolviera la libertad a Fahridor, el aldeano ya resistía a su manera: plantando sin que le quedara nada.",
  KT002: "Los esbirros de Fahridor aprendieron bajo Tarreghon cómo obedecer; bajo Viggo, aprendieron para qué.",
  KT004: "Los granjeros de Aridhal alimentaron a un reino entero y aun así Tarreghon los llamó insuficientes.",
  KT005: "El herrero de Blodkhail no eligió la guerra; la guerra eligió sus manos.",
  KT006: "El leñador conoce cada árbol del bosque de Terruthum; también sabe cuál rama rompe mejor.",
  KT007: "Un aldeano calvo con una pala ha detenido más invasiones que muchos soldados con espada.",
  KT008: "La falange fahridorésa que derrocó a Tarreghon empezó con lanceros como este.",
  KT009: "«Libres desde ahora y para siempre.» Los soldados de Viggo grabaron esa frase en sus escudos.",
  KT011: "El soldado de Fahridor no pelea por un rey; pelea por la promesa que ese rey hizo.",
  KT013: "El mercenario común no tiene bandera; en Fahridor, eso lo hace más peligroso, no menos.",
  KT014: "El escudero de Blodkhail creció oyendo la leyenda de Bludkut; hoy la vive cada vez que el enemigo avanza.",
  KT015: "El desollador de Fahridor trabaja en silencio; los susurros de Bludkut le enseñaron a no desperdiciar.",
  KT016: "El duelista fahridorés no busca victoria limpia; busca que el otro no pueda volver a levantarse.",
  KT017: "Los templarios de Fahridor juran por Viggo, no por un dios; es el único juramento que no se rompe.",
  KT018: "El asesino opera donde la guerra no puede: en los pasillos de Blodkhail, en posadas como Las Cinco Garras.",
  KT019: "El gladiador de Fahridor fue entrenado en las arenas de Cos Drakhea donde perder significa no regresar.",
  KT021: "La alabarda del ejército de Viggo barrió las calles de Blodkhail la noche que Tarreghon cayó.",
  KT022: "El pirómano de Fahridor conoce algo que los demás ignoran: que el fuego bien dirigido solo consume lo que debe.",
  KT023: "El protector no es el más fuerte; es el que sigue en pie cuando todos los demás caen.",
  KT024: "«La sangre del valiente, de quien todo lo ha perdido.» Los bárbaros de Fahridor toman eso al pie de la letra.",
  KT025: "El coloso de Fahridor empuja como si el peso de todos los años de opresión se acumulara en sus hombros.",
  KT026: "El guardián de Blodkhail vio a Viggo entrar con Bludkut y no olvidó jamás ese momento.",
  KT027: "El verdugo no juzga; eso ya lo hizo Viggo.",
  KT029: "El granjero de Fahridor aprendió a pelear cuando Tarreghon le quitó la cosecha por tercera vez.",
  KT031: "El buscapleitos de los mercados de Blodkhail sabe que la mejor pelea es la que el enemigo no espera.",
  KT034: "El presidiario lleva en el cuerpo las marcas de lo que Tarreghon consideraba disciplina.",
  KT036: "El sepulturero de Fahridor trabaja cerca de La Pila; aprendió a no hacer preguntas.",
  KT040: "El bandido de las rutas de Aridhal conoce cada piedra del camino; y exactamente dónde esconderse.",
  KT041: "El desolado de Fahridor perdió todo bajo Tarreghon; por eso no le queda nada que perder en la batalla.",
  KT042: "Perdió la mano en el ataque a Blodkhail; conservó el orgullo de haber estado ahí.",
  KT043: "El temerario de Fahridor aprendió el valor de lo que arriesga de Viggo: todo o nada.",
  KT044: "El vigilante de Fahridor patrulla desde las ruinas de Bludutherúm hasta las costas de Cos Drakhea.",
  KT046: "El bruto de Fahridor no necesita estrategia: su tamaño ya es la estrategia.",
  KT047: "El carcelero de Blodkhail sirvió al tirano Tarreghon; ahora sirve a Viggo, y no siente la diferencia.",
  KT049: "El justiciero de Fahridor sabe que la verdadera justicia no siempre tiene forma legal.",
  KT050: "El sanguinario de Fahridor se alimenta del mismo furor que alimentó a Viggo la noche de la cripta.",
  KT052: "El acorazado de Fahridor fue forjado con el mismo acero que se usa para cubrir los establos de los pura sangre fahridoréses.",
  KT053: "La ejecutora de Fahridor lleva los mismos colores que portaba el ejército que Tarreghon deshizo. Ahora los usa para vengarse.",
  KT054: "El flamígero de Fahridor nació en las costas de Cos Drakhea; el fuego del mar le dio su nombre.",

  // ── Tropas — Goldinfeit ───────────────────────────────────────────────────
  KT003: "El minero de Goldinfeit sabe que las vetas de oro no se encuentran: se merecen.",
  KT010: "El clérigo de Goldinfeit lleva la fe de Protea en el campo de batalla; a veces la fe salva más que la espada.",
  KT012: "El lancero de Goldinfeit aprendió su oficio en las murallas de Santa Protea, donde la precisión salva vidas.",
  KT020: "El defensor de Goldinfeit fue el escudo de Arca Eidal cuando las noticias de Narcisus Tarreghon llegaron a la ciudad.",
  KT028: "El paladín de Goldinfeit juró ante el Templo de Protea; ese juramento pesa más que cualquier armadura.",
  KT030: "La banquera de Goldinfeit administra el oro que sostiene al Ejército Dorado; sin ella, las arcas se vacían.",
  KT032: "Los ciudadanos de Santa Protea construyeron el mayor templo de Nujóm con sus propias manos; en la guerra hacen lo mismo.",
  KT033: "El mendigo de Goldinfeit conoce todos los callejones de las seis Arcas; es el mejor espía que existe.",
  KT037: "La sacerdotiza de Goldinfeit oficia los rituales de Protea antes de cada campaña; los guerreros no parten sin su bendición.",
  KT038: "El acólito de Goldinfeit practica la fe y el combate en proporciones iguales.",
  KT039: "El arquero entrenado en Arca Rajnel puede acertar una flecha donde el ojo dorado de Protea mira.",
  KT045: "El arquero real de Goldinfeit lleva la misma puntería que los leones proteanos llevan en los ojos.",
  KT048: "El centinela de Goldinfeit patrulla las seis Arcas; si algo se mueve sin permiso, él ya lo vio.",
  KT051: "El inquisidor de Goldinfeit trabaja directamente para la corona; su veredicto es inapelable.",
  KT055: "La garra de Goldinfeit es parte del Ejército Dorado: montada en león proteo, rastreando por orden de la reina.",
  KT056: "La zarpa de Goldinfeit lleva en el guantelete el oro de las minas de Valle Lingote; nadie la toma a la ligera.",

  // ── Tropas — Estonbleiz ───────────────────────────────────────────────────
  KT057: "La escoria de Magmápia nació del castigo de Igno; lo que fue guardia de Piritio ahora obedece al verdadero portador.",
  KT058: "El basalto de Estonbleiz fue formado por siglos de presión volcánica; así también sus guerreros.",
  KT059: "La espinela fue encontrada incrustada en un esqueleto con señales de quema. Los bardos dicen que era un guerrero de cristal.",
  KT060: "El ónix negro brotó de los cuerpos transformados por el guantelete de Igno; parte hombre, parte piedra volcánica.",
  KT061: "El ópalo de Estonbleiz captura la luz como el volcán captura la ira: en silencio, hasta que ya no puede.",
  KT062: "El guerrero del tejón excava en la roca volcánica de Estonbleiz sin importar la temperatura ni el azufre.",
  KT063: "El romperoca recolecta la obsidiana bléizica del Magmápyro; es la materia prima de las armas más letales de Nujóm.",
  KT064: "El escultor de Estonbleiz trabaja la obsidiana bléizica con precisión quirúrgica; sus armas expulsan fuego de sus hojas.",
  KT065: "El cuarzo de las cavernas de Estonbleiz brilla con luz propia, como el fuego que lo creó.",
  KT066: "El herborista de Estonbleiz conoce cada planta que crece entre ríos de lava; sus pociones curan y queman por igual.",
  KT067: "El coatí colaespina de Gringud tiene espinas más duras que las ramas del roble negro.",
  KT070: "El jaspe de Gringud nació en la tierra donde el volcán y el bosque se disputan el territorio.",

  // ── Tropas — Gringud (incluye Kaihat, Daihat, Gukhal) ────────────────────
  KT068: "La guerrera Kaihat sigue a Erya con la misma devoción que las plantas siguen a la luz del sol.",
  KT069: "El licaón Kaihat corre con el ritmo del viento de Gringud; quien lo persigue ya perdió.",
  KT071: "El guerrero desertor sabe lo que es pelear del lado equivocado; ahora elige con más cuidado.",
  KT072: "El lobo Gukhal responde al llamado de Erya antes de que el sonido llegue al oído de los demás.",
  KT073: "La vigía Gukhal ve desde las copas más altas del bosque lo que a nivel del suelo es invisible.",
  KT074: "El granate de Gringud es la piedra que brilla como brasa y corta como espada.",
  KT075: "La pantera camaleón de Gringud desaparece en la espesura; cuando vuelve a ser visible, el combate ya terminó.",
  KT076: "La cazadora Aiathel aprendió de Erya que el mejor disparo es el que el enemigo nunca escucha.",
  KT077: "El zafiro de Gringud es tan duro como la voluntad de los que protegen el bosque.",
  KT078: "El Protector Pardo Daihat lleva las cicatrices del bosque en el pelaje; cada una es un enemigo que no volvió.",
  KT079: "El kudú real de Gringud se mueve entre la maleza con una gracia que hace parecer al bosque cómplice.",

  // ── Estrategia ────────────────────────────────────────────────────────────
  KE001: "¡Refuerzos! El grito que el ejército de Viggo lanzó la madrugada en que Blodkhail fue liberado.",
  KE002: "La orden de avance en Fahridor no se da dos veces; la segunda ya es demasiado tarde.",
  KE003: "Viggo entrenó a cada ciudadano libre de Fahridor; los susurros de Bludkut exigían que su ejército no tuviera límite.",
  KE004: "El llamado del héroe resuena en Nujóm desde que Viggo derrocó a Tarreghon; cada generación espera el suyo.",
  KE005: "Un atacante inesperado en las filas enemigas vale por tres soldados en la línea del frente.",
  KE006: "¡Sorpresa! La misma que sintieron los guardias de Tarreghon cuando un solo hombre tomó el castillo.",
  KE007: "La explosión sorpresiva es el idioma de los apóstoles de las llamas: nadie los ve venir.",
  KE008: "La huida estratégica no es cobardía; Igno huyó de Arca Eidal y luego reclamó Estonbleiz.",
  KE009: "La sed de sangre de Bludkut se transfería a Viggo en susurros; no era una metáfora.",
  KE010: "El aturdimiento llega antes de la espada en las tácticas que Nemea aprendió de su padre Paladio.",
  KE011: "El doble ataque es la firma de Viggo: dos hojas, una acción, una sola oportunidad para el enemigo.",
  KE012: "La fuerza sobrehumana que Viggo sintió al tocar Bludkut era algo más allá de lo mortal.",
  KE013: "Segunda oportunidad: lo que Nemea le dio a los guerreros de Goldinfeit que cayeron al borde de Santa Protea.",
  KE014: "La audacia de atacar primero en Nujóm separa a los vivos de los que debieron actuar antes.",
  KE015: "La audacia riesgosa de Igno al fugarse de Arca Eidal lo llevó a los apóstoles de las llamas y al Magmápyro.",
  KE016: "La defensa conjunta de las seis Arcas de Goldinfeit ha rechazado más invasiones de las que los libros registran.",
  KE017: "La audacia diabólica es la que tienen quienes saben que ya no tienen nada que perder.",
  KE018: "La gran convocación que levantó el ejército de cristal de Igno fue el mayor evento sísmico que Nujóm había visto.",
  KE019: "El paso táctico en Estonbleiz se practica sobre suelo volcánico; el que pisa mal, no regresa.",
  KE020: "El intercambio de posición fue la maniobra que salvó a Igno cuando el león proteo lo acechaba en Arca Eidal.",
  KE021: "Cambio de estrategia: lo que hacen los reinos cuando alguien como Viggo aparece de la nada.",
  KE022: "La convocación sacrificada es el precio que los apóstoles de las llamas pagan para despertar al ejército de cristal.",
  KE023: "Alzar el escudo en Goldinfeit es un gesto sagrado; significa que Protea está siendo invocada.",
  KE024: "La audacia sagrada de los guerreros de Goldinfeit tiene su origen en la promesa de Aurelio Waiswel.",
  KE025: "La audacia táctica de Nemea combina la fe de su linaje con la brutalidad del Ejército Dorado.",
  KE026: "La osadía del valiente: el mismo temple que tuvo Viggo al cortar su mano en la cripta de Bludutherúm.",
  KE027: "El ataque furioso que arrasó a los lacayos de Tarreghon no duró más que una noche.",
  KE028: "La espada afilada de Fahridor se forja en Cos Drakhea con el metal más duro del reino.",
  KE029: "El escudo reforzado de Goldinfeit lleva la insignia de Protea; eso solo ya detiene muchos ataques.",
  KE030: "La actitud combativa de Gringud se practica desde la niñez; el bosque no tolera la debilidad.",
  KE031: "Los pasos sigilosos son el dominio de quienes crecieron en los bosques de Gringud.",
  KE032: "La distracción de novatos funciona con ejércitos entrenados por tiranos; todos los de Tarreghon caían en ella.",
  KE033: "El relevo en Goldinfeit es tan preciso como el cambio de guardia en el Templo de Protea.",
  KE034: "El empuje de Fahridor es el primer movimiento cuando Bludkut susurra.",
  KE035: "El escudo aéreo de Gringud proviene de las copas de los árboles; allí donde los arqueros enemigos no esperan respuesta.",
  KE036: "El rebote aéreo de Gringud convierte cada flecha enemiga en una lección de precisión.",
  KE037: "La adrenalina de los guerreros de Fahridor fue descripta por Viggo como «el fuego que Bludkut pone en las venas».",
  KE038: "La defensa combativa no espera al ataque: va al encuentro del peligro antes de que llegue.",
  KE039: "El golpe de escudo fue lo que Igno recibió de los guardias de Piritio; fue también lo que les devolvió.",
  KE040: "La lluvia de flechas desde las Arcas de Goldinfeit fue lo que hizo retroceder al último ejército invasor.",
  KE041: "La muerte codiciosa es la que busca Bludkut: no una, sino todas.",
  KE042: "El apremio de batalla que Nemea transmite a sus tropas viene de saber que el oro de Goldinfeit siempre habrá quien quiera robarlo.",
  KE043: "La maestría de combate de los leones proteanos de Goldinfeit tardó seis generaciones en perfeccionarse.",
  KE044: "Las puertas bloqueadas del castillo de obsidiana no frenaron a Igno ni por un momento.",
  KE045: "El reclutamiento en Fahridor es voluntario; eso lo hace más poderoso que cualquier conscripción.",
  KE046: "El ataque implacable es el que no da tiempo a pensar; Viggo fue el primero en enseñarlo.",
  KE047: "El movimiento ágil de Gringud se aprende corriendo entre raíces y matorrales desde los primeros años.",
  KE048: "El ataque combinado de los clanes de Gringud fue descripto como «el bosque entero que se mueve».",
  KE049: "El camuflaje selvático en Gringud no es magia; es simplemente saber que la naturaleza siempre ocultará a quien la respeta.",
  KE050: "El mano a mano es la única táctica que todos los guerreros de Nujóm comparten, sin importar el reino.",
  KE051: "El llamado de la manada retumba en los bosques de Gringud; quien lo escucha sabe que la batalla ya comenzó.",
  KE052: "La defensa implacable de Gringud fue lo que protegió el bosque cuando los ejércitos de Fahridor y Goldinfeit disputaban territorio.",

  // ── Estrategia Primigenia ─────────────────────────────────────────────────
  KP001: "La audacia suprema es la de quien entiende que el poder verdadero siempre tiene un costo.",
  KP002: "La destreza extrema de los portadores de las llamas fue registrada antes de que existieran los libros de historia.",
  KP003: "La huida maestra es la de Igno: no se huye para escapar, sino para regresar con más.",
  KP004: "Ocupar posición en Nujóm no es cuestión de fuerza; es cuestión de llegar antes.",
  KP005: "El doble ataque real fue la técnica que Viggo usó cuando Bludkut le mostró todo su potencial.",
  KP006: "El ataque maestro no se improvisa; es el resultado de años combatiendo en tierra volcánica, bosque cerrado o llanura abierta.",
  KP007: "La defensa maestra de los reinos de Nujóm es la razón por la que ninguno ha caído sin pelear.",
  KP008: "La sed de batalla que nació en Estonbleiz con Igno se transmitió al ejército de cristal que él mismo creó.",
  KP009: "El escudo aliado fue el gesto con el que el Ejército Dorado juró lealtad a Nemea el día de su coronación.",
  KP010: "La espada aliada es la que se empuña cuando la causa es mayor que la propia vida.",

  // ── Arroje ─────────────────────────────────────────────────────────────────
  KA001: "La lanza fahridorésa fue forjada en Cos Drakhea; su peso está calibrado para el largo brazo de los bárbaros del reino.",
  KA002: "La daga arrojadiza es el arma preferida de los espías de Blodkhail: silenciosa, certera, irreversible.",
  KA003: "La bomba de metralla fue diseñada en Estonbleiz aprovechando los fragmentos de obsidiana bléizica que el Magmápyro expulsa.",
  KA004: "La bomba incendiaria es la versión de campaña del fuego que Igno porta en el guantelete.",
  KA005: "El hacha arrojadiza de Fahridor recorre el aire con el mismo rugido que acompañó a Viggo en Bludutherúm.",
  KA006: "La piedra fue el primer arroje; los guerreros de Gringud nunca olvidaron la lección.",
  KA007: "La flecha de Goldinfeit viaja más lejos que la vista; Protea guía su vuelo.",
  KA008: "La flecha perforante atraviesa las armaduras doradas de Goldinfeit como recuerdo de que ningún metal es invulnerable.",
  KA009: "La flecha contundente no mata al instante; detiene, y eso a veces es peor.",
  KA010: "La flecha de largo alcance de las Arcas de Goldinfeit llega a objetivos que el arquero no alcanza a ver.",
  KA011: "La flecha destructora de Gringud lleva veneno de la planta que solo crece al borde del Magmápyro.",
  KA012: "La cadena atrapante fue inventada en Fahridor para los que intentaban huir de La Pila.",
  KA013: "La lanza ligera es la que prefieren los soldados de Goldinfeit para campaña: fácil de llevar, difícil de desviar.",
  KA014: "La daga precisa del Ejército Dorado tiene la bendición de Protea grabada en la empuñadura.",
  KA015: "El martillómerang de Estonbleiz fue forjado con obsidiana bléizica; vuelve al lanzador tan caliente como salió.",
  KA016: "Las brazas llameantes son el arroje favorito de los apóstoles de las llamas: llegan sin aviso y recuerdan el fuego del Magmápyro.",
  KA017: "La flecha selvática de Gringud está tallada de un árbol que nunca se tala; solo se toman las ramas caídas.",
  KA018: "El hacha de caza de Gringud vuelve siempre a la mano que la lanzó; el bosque la devuelve.",
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
