// Font loader for Cinzel (display) and Montserrat (body).
// Wraps expo-font with the Google Fonts packages.
import { useEffect, useState } from "react";

let loadFonts: (() => Promise<void>) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Font = require("expo-font") as { loadAsync: (map: Record<string, unknown>) => Promise<void> };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Cinzel = require("@expo-google-fonts/cinzel") as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Montserrat = require("@expo-google-fonts/montserrat") as Record<string, unknown>;

  loadFonts = async () => {
    await Font.loadAsync({
      Cinzel_400Regular: Cinzel.Cinzel_400Regular,
      Cinzel_700Bold: Cinzel.Cinzel_700Bold,
      Montserrat_300Light: Montserrat.Montserrat_300Light,
      Montserrat_400Regular: Montserrat.Montserrat_400Regular,
      Montserrat_500Medium: Montserrat.Montserrat_500Medium,
      Montserrat_700Bold: Montserrat.Montserrat_700Bold
    });
  };
} catch {
  // Fonts not available — system fallbacks used.
}

export function useAuraLunisFonts(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loadFonts) {
      loadFonts().then(() => setLoaded(true)).catch(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, []);

  return loaded;
}
