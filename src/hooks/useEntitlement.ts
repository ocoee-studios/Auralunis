// useEntitlement.ts
// Single source of truth for premium status across the app.
// Checks RevenueCat on mount and when the app foregrounds.
// Returns isPremium, isLoading, and a refresh function.
//
// Usage:
//   const { isPremium } = useEntitlement();
//   if (!isPremium) return <PaywallGate />;

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { RevenueCatIds } from "@/features/paywall/MonetizationCatalog";

// Typed locally — react-native-purchases types may not resolve under all
// module resolution modes; the runtime API matches these signatures.
let Purchases: {
  configure: (opts: { apiKey: string }) => void;
  getCustomerInfo: () => Promise<{
    entitlements: { active: Record<string, unknown> };
  }>;
} | null = null;

try {
  Purchases = require("react-native-purchases").default;
} catch {
  // react-native-purchases not available in Expo Go
}

async function fetchIsPremium(): Promise<boolean> {
  if (!Purchases) {
    // RevenueCat unavailable (Expo Go) — grant premium in dev for testing
    if (__DEV__) return true;
    return false;
  }
  try {
    const info = await Purchases.getCustomerInfo();
    return Boolean(info.entitlements.active[RevenueCatIds.entitlement]);
  } catch {
    // RC configured but errored (placeholder key, network, etc.)
    // Grant premium in dev so the app is testable
    if (__DEV__) return true;
    return false;
  }
}

export function useEntitlement() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const premium = await fetchIsPremium();
    setIsPremium(premium);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  // Re-check when app comes back to foreground (user may have purchased)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appStateRef.current.match(/inactive|background/) && next === "active") {
        refresh();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [refresh]);

  return { isPremium, isLoading, refresh };
}
