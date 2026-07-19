// useEntitlement.ts
// Reads the SHARED premium status from EntitlementContext (single source of truth,
// mounted once at the app root). Same API as before — { isPremium, isLoading,
// refresh } — so existing call sites are unchanged, but every consumer now sees the
// same value and a purchase/restore updates them all at once.
//
// Usage:
//   const { isPremium } = useEntitlement();
//   if (!isPremium) openPaywall();

import { useContext } from "react";
import { EntitlementContext, type EntitlementValue } from "@/context/EntitlementContext";

const SAFE_DEFAULT: EntitlementValue = { isPremium: false, membershipKind: "none", isLoading: false, refresh: async () => {} };

export function useEntitlement(): EntitlementValue {
  // Fails closed to a non-premium default if ever rendered outside the provider.
  return useContext(EntitlementContext) ?? SAFE_DEFAULT;
}
