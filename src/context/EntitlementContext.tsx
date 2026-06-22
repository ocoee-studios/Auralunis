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

async function fetchIsPremium(): Promise<boolean> {
  if (!Purchases) {
    // RevenueCat unavailable (e.g. Expo Go) — grant premium in dev so the app is
    // testable. __DEV__ is false in release builds, so this never ships unlocked.
    return __DEV__;
  }
  try {
    const info = await Purchases.getCustomerInfo();
    return Boolean(info.entitlements.active[RevenueCatIds.entitlement]);
  } catch {
    // RC configured but errored (placeholder key, network) — premium in dev only.
    return __DEV__;
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
