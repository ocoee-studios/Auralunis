// Font loader for Cinzel (display headings) and Playfair Display (body text).
// Brand guide: Trajan Pro primary → Cinzel (free alternative), Playfair Display secondary.
// Wraps expo-font with the Google Fonts packages.
import { useEffect, useState } from "react";

let loadFonts: (() => Promise<void>) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Font = require("expo-font") as { loadAsync: (map: Record<string, unknown>) => Promise<void> };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Cinzel = require("@expo-google-fonts/cinzel") as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Playfair = require("@expo-google-fonts/playfair-display") as Record<string, unknown>;

  loadFonts = async () => {
    await Font.loadAsync({
      Cinzel_400Regular: Cinzel.Cinzel_400Regular,
      Cinzel_700Bold: Cinzel.Cinzel_700Bold,
      PlayfairDisplay_400Regular: Playfair.PlayfairDisplay_400Regular,
      PlayfairDisplay_500Medium: Playfair.PlayfairDisplay_500Medium,
      PlayfairDisplay_600SemiBold: Playfair.PlayfairDisplay_600SemiBold,
      PlayfairDisplay_700Bold: Playfair.PlayfairDisplay_700Bold,
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
