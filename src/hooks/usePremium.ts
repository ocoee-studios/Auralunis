// usePremium.ts
// Convenience alias of the shared useEntitlement() hook, exposing the simpler
// { isPremium, loading } shape some screens/docs expect.
//
// IMPORTANT: this does NOT poll RevenueCat itself. Premium status has exactly one
// source of truth — EntitlementProvider (mounted once at the app root), which is
// RevenueCat-backed, fails closed to false, and refreshes every consumer at once on
// purchase/restore/foreground. A second independent getCustomerInfo() poller here
// would desync from that shared state, which is the bug EntitlementContext was built
// to remove — so we delegate instead of re-implementing.

import { useEntitlement } from "./useEntitlement";

export function usePremium(): { isPremium: boolean; loading: boolean } {
  const { isPremium, isLoading } = useEntitlement();
  return { isPremium, loading: isLoading };
}
