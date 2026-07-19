// Pure entitlement/membership classification — no react-native or native-module imports,
// so it is unit-testable in plain Node and shared by both RevenueCatService (restore/purchase)
// and EntitlementContext (app-wide premium state). Everything here is derived from the
// RevenueCat CustomerInfo the store returns — never from display text or local flags.

import { RevenueCatIds } from "./MonetizationCatalog";

/** The minimal shape of CustomerInfo these helpers read. */
export type EntitlementCustomerInfo = {
  entitlements: { active: Record<string, unknown> };
  /** Product identifiers of the account's currently-active auto-renewing subscriptions. */
  activeSubscriptions?: string[];
};

export type MembershipKind = "none" | "subscription" | "lifetime";

/**
 * True only when the EXACT AuraLunis entitlement ("AuraLunis Premium") is active. Never
 * matches on "any entitlement" and never falls back to a different identifier. The bare
 * fact that a restore/purchase call completed is NOT sufficient — only an active entitlement.
 */
export function hasAuraLunisEntitlement(
  customerInfo: EntitlementCustomerInfo,
  entitlementId: typeof RevenueCatIds.entitlement = RevenueCatIds.entitlement
): boolean {
  return Boolean(customerInfo.entitlements.active[entitlementId]);
}

/**
 * Classify the customer's AuraLunis membership from the store's CustomerInfo:
 *   - "none":         entitlement not active.
 *   - "subscription": entitlement active AND an active auto-renewing monthly/annual sub.
 *   - "lifetime":     entitlement active via the one-time lifetime product (no active sub).
 * Subscription-vs-lifetime is derived from `activeSubscriptions` product IDs, so a lifetime
 * owner is never told they have a subscription to manage.
 */
export function classifyAuraLunisMembership(customerInfo: EntitlementCustomerInfo): MembershipKind {
  if (!hasAuraLunisEntitlement(customerInfo)) return "none";
  const active = customerInfo.activeSubscriptions ?? [];
  const hasActiveSubscription =
    active.includes(RevenueCatIds.products.premiumMonthly) ||
    active.includes(RevenueCatIds.products.premiumAnnual);
  return hasActiveSubscription ? "subscription" : "lifetime";
}
