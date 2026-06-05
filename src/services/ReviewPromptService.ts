// Asks for a rating after the 5th app session. Uses expo-store-review to show
// the native iOS/Android review dialog (limited to 3 prompts per year by Apple).
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "chronaura.sessions";
const PROMPTED_KEY = "chronaura.review.prompted";
const PROMPT_AFTER = 5;

let StoreReview: { requestReview: () => Promise<void> } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  StoreReview = require("expo-store-review") as typeof StoreReview;
} catch { /* Not available */ }

export async function recordSession(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    const count = raw ? parseInt(raw, 10) + 1 : 1;
    await AsyncStorage.setItem(SESSION_KEY, String(count));

    if (count === PROMPT_AFTER) {
      const prompted = await AsyncStorage.getItem(PROMPTED_KEY);
      if (!prompted && StoreReview) {
        await StoreReview.requestReview();
        await AsyncStorage.setItem(PROMPTED_KEY, "true");
      }
    }
  } catch { /* Analytics should never crash the app */ }
}
