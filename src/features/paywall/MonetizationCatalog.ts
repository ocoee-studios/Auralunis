// Chronaura pricing — simplified for launch.
// Free + Premium only. No Aura Pro or Sovereign at launch.

export const RevenueCatIds = {
  products: {
    premiumMonthly: "com.ocoee.chronaura.premium.monthly",
    premiumAnnual: "com.ocoee.chronaura.premium.annual"
  },
  packages: {
    premiumMonthly: "premium_monthly",
    premiumAnnual: "premium_annual"
  },
  entitlement: "chronaura_premium"
} as const;

export interface PlanOption {
  id: string;
  productId: string;
  name: string;
  interval: "monthly" | "annual";
  displayPrice: string;
  effectiveMonthly: string;
  revenueCatPackageId: string;
  badge?: string;
  trial: boolean;
}

export const plans: PlanOption[] = [
  {
    id: "premium_annual",
    productId: RevenueCatIds.products.premiumAnnual,
    name: "Chronaura Premium",
    interval: "annual",
    displayPrice: "$39.99/year",
    effectiveMonthly: "$3.33/mo",
    revenueCatPackageId: RevenueCatIds.packages.premiumAnnual,
    badge: "BEST VALUE",
    trial: true
  },
  {
    id: "premium_monthly",
    productId: RevenueCatIds.products.premiumMonthly,
    name: "Chronaura Premium",
    interval: "monthly",
    displayPrice: "$6.99/month",
    effectiveMonthly: "$6.99/mo",
    revenueCatPackageId: RevenueCatIds.packages.premiumMonthly,
    trial: true
  }
];

export const freeFeatures = [
  "Tonight Score",
  "Basic Learn (Planets, Moon)",
  "3 constellation entries",
  "5-day streak limit"
];

export const premiumFeatures = [
  "Everything in Free",
  "AI Sky Companion (Claude-powered)",
  "Full astronomy encyclopedia (88 constellations, 21 deep-sky objects)",
  "Birth Sky Profile + Cosmic Compatibility",
  "Cosmic Vault (encrypted)",
  "Night Vision Mode",
  "Sky Timelapse",
  "Constellation Challenge",
  "Dark Sky Finder",
  "Eclipse & Celestial Events Calendar",
  "Astrophotography guides",
  "Achievement badges & Annual Sky Recap",
  "Apple Watch companion",
  "iOS widgets (Tonight Score, Moon Phase, Next Event)",
  "Unlimited streaks",
  "Cultural sky stories from 12 traditions",
  "Share cards"
];
