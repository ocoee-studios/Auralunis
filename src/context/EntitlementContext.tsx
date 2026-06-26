// EntitlementContext.tsx
// Single shared source of truth for premium status. One provider holds the state;
// every screen reads the SAME isPremium via useEntitlement(), so a purchase/restore
// updates the whole app at once (previously each useEntitlement() call had its own
// state and only refreshed on app-foreground). Fails CLOSED to `false` everywhere.

import React, { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { RevenueCatIds } from "@/features/paywall/MonetizationCatalog";

let Purchases: {
  getCustomerInfo: () => Promise<{ entitlements: { active: Record<string, unknown> } }>;
} | null = null;

try {
  Purchases = require("react-native-purchases").default;
} catch {
  // not available in Expo Go
}

// Local-testing override: unlock premium when RevenueCat isn't available (e.g. Expo
// Go) so the gated UI is testable WITHOUT a real purchase. Double-guarded — it is
// only ever true when BOTH this flag is on AND the build is a dev build (`__DEV__` is
// compiled to false in release), so it can never ship the App Store app unlocked.
// Set ALLOW_DEV_PREMIUM to false to exercise the real paywall during development.
const ALLOW_DEV_PREMIUM = true;
const devPremium = (): boolean => __DEV__ && ALLOW_DEV_PREMIUM;

async function fetchIsPremium(): Promise<boolean> {
  // DEV BYPASS: in a dev build, unlock premium unconditionally so every gated feature
  // is visible/testable on device without a purchase. Short-circuits BEFORE RevenueCat
  // — previously the bypass only fired when RC was unavailable/errored, so on a working
  // dev build getCustomerInfo() succeeded, returned false, and the app stayed locked.
  // Double-guarded (__DEV__ compiles to false in release), so it can never ship the
  // App Store app unlocked. Flip ALLOW_DEV_PREMIUM to false to exercise the paywall.
  if (devPremium()) return true;
  if (!Purchases) return false; // RevenueCat unavailable in a release build
  try {
    const info = await Purchases.getCustomerInfo();
    return Boolean(info.entitlements.active[RevenueCatIds.entitlement]);
  } catch {
    return false; // RC configured but errored — fail CLOSED in production
  }
}

export interface EntitlementValue {
  isPremium: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const EntitlementContext = createContext<EntitlementValue | null>(null);

// Module-level handle so non-React / out-of-provider code (e.g. the purchase flow in
// App.tsx, which renders the provider and so sits above it) can force a global
// re-check after a successful purchase or restore.
let externalRefresh: (() => Promise<void>) | null = null;
export async function refreshEntitlement(): Promise<void> {
  await externalRefresh?.();
}

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const premium = await fetchIsPremium();
    setIsPremium(premium);
    setIsLoading(false);
  }, []);

  // Expose this provider's refresh to the module-level helper while mounted.
  useEffect(() => {
    externalRefresh = refresh;
    return () => {
      if (externalRefresh === refresh) externalRefresh = null;
    };
  }, [refresh]);

  // Initial check.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-check when the app returns to the foreground (purchase made elsewhere, etc.).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appStateRef.current.match(/inactive|background/) && next === "active") {
        refresh();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [refresh]);

  return (
    <EntitlementContext.Provider value={{ isPremium, isLoading, refresh }}>
      {children}
    </EntitlementContext.Provider>
  );
}
