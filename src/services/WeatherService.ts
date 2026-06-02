import Constants from "expo-constants";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface WeatherSnapshot {
  cloudPercent: number;
  humidity: number;
  tempCelsius: number;
  description: string;
  source: "live" | "unavailable";
}

const FALLBACK: WeatherSnapshot = {
  cloudPercent: 30,
  humidity: 50,
  tempCelsius: 20,
  description: "weather data unavailable",
  source: "unavailable"
};

function getApiKey(): string | undefined {
  return (Constants.expoConfig?.extra as Record<string, unknown> | undefined)
    ?.openWeatherMapApiKey as string | undefined;
}

function isPlaceholder(key?: string): boolean {
  return !key || key.startsWith("REPLACE_WITH_");
}

export async function fetchCurrentWeather(
  location: ObserverLocation
): Promise<WeatherSnapshot> {
  const apiKey = getApiKey();
  if (isPlaceholder(apiKey)) return FALLBACK;

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather?` +
      `lat=${location.latitudeDegrees}&lon=${location.longitudeDegrees}` +
      `&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather ${response.status}`);

    const data = (await response.json()) as {
      clouds?: { all?: number };
      main?: { humidity?: number; temp?: number };
      weather?: Array<{ description?: string }>;
    };

    return {
      cloudPercent: data.clouds?.all ?? 30,
      humidity: data.main?.humidity ?? 50,
      tempCelsius: data.main?.temp ?? 20,
      description: data.weather?.[0]?.description ?? "clear",
      source: "live"
    };
  } catch {
    return FALLBACK;
  }
}
