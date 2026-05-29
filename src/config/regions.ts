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
