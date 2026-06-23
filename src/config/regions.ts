// Italian Regions and their major cities
// Source: ISTAT administrative divisions

export type ItalianRegion = {
  code: string;
  name: string;
  cities: string[];
};

export const ITALIAN_REGIONS: ItalianRegion[] = [
  {
    code: "PIE",
    name: "Piemonte",
    cities: ["Torino", "Novara", "Alessandria", "Asti", "Cuneo", "Vercelli", "Biella", "Verbania"],
  },
  {
    code: "VDA",
    name: "Valle d'Aosta",
    cities: ["Aosta"],
  },
  {
    code: "LOM",
    name: "Lombardia",
    cities: ["Milano", "Bergamo", "Brescia", "Como", "Cremona", "Lecco", "Lodi", "Mantova", "Monza", "Pavia", "Sondrio", "Varese"],
  },
  {
    code: "TAA",
    name: "Trentino-Alto Adige",
    cities: ["Trento", "Bolzano"],
  },
  {
    code: "VEN",
    name: "Veneto",
    cities: ["Venezia", "Verona", "Padova", "Vicenza", "Treviso", "Rovigo", "Belluno"],
  },
  {
    code: "FVG",
    name: "Friuli Venezia Giulia",
    cities: ["Trieste", "Udine", "Pordenone", "Gorizia"],
  },
  {
    code: "LIG",
    name: "Liguria",
    cities: ["Genova", "La Spezia", "Savona", "Imperia"],
  },
  {
    code: "EMR",
    name: "Emilia-Romagna",
    cities: ["Bologna", "Modena", "Parma", "Reggio Emilia", "Ravenna", "Ferrara", "Forlì", "Rimini", "Piacenza", "Cesena"],
  },
  {
    code: "TOS",
    name: "Toscana",
    cities: ["Firenze", "Prato", "Livorno", "Arezzo", "Pisa", "Lucca", "Pistoia", "Siena", "Massa", "Grosseto"],
  },
  {
    code: "UMB",
    name: "Umbria",
    cities: ["Perugia", "Terni"],
  },
  {
    code: "MAR",
    name: "Marche",
    cities: ["Ancona", "Pesaro", "Fano", "Ascoli Piceno", "Macerata"],
  },
  {
    code: "LAZ",
    name: "Lazio",
    cities: ["Roma", "Latina", "Frosinone", "Viterbo", "Rieti"],
  },
  {
    code: "ABR",
    name: "Abruzzo",
    cities: ["L'Aquila", "Pescara", "Chieti", "Teramo"],
  },
  {
    code: "MOL",
    name: "Molise",
    cities: ["Campobasso", "Isernia"],
  },
  {
    code: "CAM",
    name: "Campania",
    cities: ["Napoli", "Salerno", "Caserta", "Avellino", "Benevento"],
  },
  {
    code: "PUG",
    name: "Puglia",
    cities: ["Bari", "Lecce", "Taranto", "Foggia", "Brindisi", "Andria"],
  },
  {
    code: "BAS",
    name: "Basilicata",
    cities: ["Potenza", "Matera"],
  },
  {
    code: "CAL",
    name: "Calabria",
    cities: ["Catanzaro", "Cosenza", "Reggio Calabria", "Crotone", "Vibo Valentia"],
  },
  {
    code: "SIC",
    name: "Sicilia",
    cities: ["Palermo", "Catania", "Messina", "Siracusa", "Ragusa", "Trapani", "Agrigento", "Caltanissetta", "Enna"],
  },
  {
    code: "SAR",
    name: "Sardegna",
    cities: ["Cagliari", "Sassari", "Nuoro", "Oristano"],
  },
];

export const ALL_CITIES = ITALIAN_REGIONS.flatMap((r) => r.cities).sort();
export const ALL_REGION_NAMES = ITALIAN_REGIONS.map((r) => r.name).sort();

export function getCitiesByRegion(regionName: string): string[] {
  const region = ITALIAN_REGIONS.find((r) => r.name === regionName);
  return region?.cities ?? [];
}

export function getRegionByCity(cityName: string): string | undefined {
  const region = ITALIAN_REGIONS.find((r) => r.cities.includes(cityName));
  return region?.name;
}

// ISO 3166-2:IT province code → administrative region.
// Mapbox v5 geocoding returns the PROVINCE (e.g. short_code "IT-VR",
// text "provincia di Verona") at its `region` context level for Italy,
// so we map the province code up to the real region (e.g. "Veneto").
export const PROVINCE_CODE_TO_REGION: Record<string, string> = {
  TO: "Piemonte", VC: "Piemonte", NO: "Piemonte", CN: "Piemonte", AT: "Piemonte",
  AL: "Piemonte", BI: "Piemonte", VB: "Piemonte",
  AO: "Valle d'Aosta",
  MI: "Lombardia", BG: "Lombardia", BS: "Lombardia", CO: "Lombardia", CR: "Lombardia",
  LC: "Lombardia", LO: "Lombardia", MN: "Lombardia", MB: "Lombardia", PV: "Lombardia",
  SO: "Lombardia", VA: "Lombardia",
  TN: "Trentino-Alto Adige", BZ: "Trentino-Alto Adige",
  VE: "Veneto", VR: "Veneto", PD: "Veneto", VI: "Veneto", TV: "Veneto", RO: "Veneto", BL: "Veneto",
  TS: "Friuli Venezia Giulia", UD: "Friuli Venezia Giulia", PN: "Friuli Venezia Giulia", GO: "Friuli Venezia Giulia",
  GE: "Liguria", SP: "Liguria", SV: "Liguria", IM: "Liguria",
  BO: "Emilia-Romagna", MO: "Emilia-Romagna", PR: "Emilia-Romagna", RE: "Emilia-Romagna",
  PC: "Emilia-Romagna", FE: "Emilia-Romagna", RA: "Emilia-Romagna", FC: "Emilia-Romagna", RN: "Emilia-Romagna",
  FI: "Toscana", PO: "Toscana", LU: "Toscana", PI: "Toscana", LI: "Toscana", AR: "Toscana",
  SI: "Toscana", GR: "Toscana", PT: "Toscana", MS: "Toscana",
  PG: "Umbria", TR: "Umbria",
  AN: "Marche", PU: "Marche", MC: "Marche", AP: "Marche", FM: "Marche",
  RM: "Lazio", VT: "Lazio", RI: "Lazio", LT: "Lazio", FR: "Lazio",
  AQ: "Abruzzo", TE: "Abruzzo", PE: "Abruzzo", CH: "Abruzzo",
  CB: "Molise", IS: "Molise",
  NA: "Campania", SA: "Campania", CE: "Campania", AV: "Campania", BN: "Campania",
  BA: "Puglia", TA: "Puglia", LE: "Puglia", FG: "Puglia", BR: "Puglia", BT: "Puglia",
  PZ: "Basilicata", MT: "Basilicata",
  CZ: "Calabria", CS: "Calabria", RC: "Calabria", KR: "Calabria", VV: "Calabria",
  PA: "Sicilia", CT: "Sicilia", ME: "Sicilia", AG: "Sicilia", CL: "Sicilia",
  EN: "Sicilia", RG: "Sicilia", SR: "Sicilia", TP: "Sicilia",
  CA: "Sardegna", SS: "Sardegna", NU: "Sardegna", OR: "Sardegna", SU: "Sardegna",
};

const REGION_NAME_SET = new Set(ALL_REGION_NAMES);

/**
 * Resolve a Mapbox `region`-level context entry to the real Italian administrative
 * region. For IT, Mapbox gives the province (short_code "IT-VR" / text
 * "provincia di Verona"); we map it up to the region (e.g. "Veneto").
 */
export function resolveItalianRegion(shortCode?: string | null, text?: string | null): string {
  const sc = (shortCode ?? "").toUpperCase();
  const code = sc.startsWith("IT-") ? sc.slice(3) : sc;
  if (PROVINCE_CODE_TO_REGION[code]) return PROVINCE_CODE_TO_REGION[code];
  const t = (text ?? "").trim();
  if (REGION_NAME_SET.has(t)) return t;
  return t.replace(/^(provincia di|citt\u00e0 metropolitana di|libero consorzio comunale di)\s+/i, "");
}
