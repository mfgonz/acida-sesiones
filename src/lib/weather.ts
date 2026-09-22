const PANAMA_LAT = 8.9824;
const PANAMA_LON = -79.5199;

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla",
  51: "Llovizna ligera",
  53: "Llovizna",
  55: "Llovizna intensa",
  61: "Lluvia ligera",
  63: "Lluvia",
  65: "Lluvia intensa",
  80: "Chubascos",
  81: "Chubascos",
  82: "Chubascos intensos",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta con granizo",
};

export interface PanamaWeather {
  temperature: number;
  feelsLike: number;
  description: string;
}

/**
 * Open-Meteo needs no API key. Cached for 30 min (independent of the page's
 * own force-dynamic rendering) since weather doesn't need per-request
 * freshness and this keeps us well under any rate limits.
 */
export async function getPanamaWeather(): Promise<PanamaWeather | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${PANAMA_LAT}&longitude=${PANAMA_LON}&current=temperature_2m,apparent_temperature,weather_code&timezone=America%2FPanama`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const code = data?.current?.weather_code;
    const temperature = data?.current?.temperature_2m;
    const feelsLike = data?.current?.apparent_temperature;
    if (typeof temperature !== "number" || typeof feelsLike !== "number") return null;
    return {
      temperature: Math.round(temperature),
      feelsLike: Math.round(feelsLike),
      description: WEATHER_DESCRIPTIONS[code] ?? "—",
    };
  } catch (err) {
    console.error("Failed to fetch Panama weather", err);
    return null;
  }
}
