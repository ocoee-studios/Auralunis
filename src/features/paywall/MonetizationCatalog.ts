import type { WatchComplicationId } from "@/features/watch/WatchFaceCatalog";

export type ChronauraPaidTierId = "horizon_plus" | "aura_pro" | "sovereign";
export type ChronauraDisplayTierId = "horizon_free" | ChronauraPaidTierId;
export type BillingPeriod = "monthly" | "annual";

export type SubscriptionProductConfig = {
  productId: string;
  tierId: ChronauraPaidTierId;
  billingPeriod: BillingPeriod;
  displayPrice: string;
  revenueCatPackageId: string;
  introductoryTrial: string;
  availableAtLaunch: boolean;
};

export type MonetizationTier = {
  id: ChronauraDisplayTierId;
  name: string;
  eyebrow: string;
  description: string;
  monthlyPrice?: string;
  annualPrice?: string;
  founderAnnualPrice?: string;
  trialCopy?: string;
  highlights: readonly string[];
  featured?: boolean;
  availableAtLaunch: boolean;
  actionLabel: string;
};

export const RevenueCatIds = {
  offering: "chronaura_launch",
  entitlements: {
    horizonPlus: "horizon_plus",
    auraPro: "aura_pro",
    sovereign: "sovereign"
  },
  products: {
    horizonMonthly: "com.ocoee.chronaura.horizon.monthly",
    horizonAnnual: "com.ocoee.chronaura.horizon.annual",
    auraMonthly: "com.ocoee.chronaura.aura.monthly",
    auraAnnual: "com.ocoee.chronaura.aura.annual",
    sovereignAnnual: "com.ocoee.chronaura.sovereign.annual"
  },
  packages: {
    horizonMonthly: "horizon_monthly",
    horizonAnnual: "horizon_annual",
    auraMonthly: "aura_monthly",
    auraAnnual: "aura_annual",
    sovereignAnnual: "sovereign_annual"
  }
} as const;

export const SEVEN_DAY_TRIAL_COPY =
  "7-day free trial for eligible new subscribers";

export const FOUNDER_ANNUAL_COPY =
  "$24.99 first-year founder annual offer for eligible subscribers";

export const subscriptionProducts: SubscriptionProductConfig[] = [
  {
    productId: RevenueCatIds.products.horizonMonthly,
    tierId: "horizon_plus",
    billingPeriod: "monthly",
    displayPrice: "$4.99/month",
    revenueCatPackageId: RevenueCatIds.packages.horizonMonthly,
    introductoryTrial: SEVEN_DAY_TRIAL_COPY,
    availableAtLaunch: true
  },
  {
    productId: RevenueCatIds.products.horizonAnnual,
    tierId: "horizon_plus",
    billingPeriod: "annual",
    displayPrice: "$29.99/year",
    revenueCatPackageId: RevenueCatIds.packages.horizonAnnual,
    introductoryTrial: SEVEN_DAY_TRIAL_COPY,
    availableAtLaunch: true
  },
  {
    productId: RevenueCatIds.products.auraMonthly,
    tierId: "aura_pro",
    billingPeriod: "monthly",
    displayPrice: "$5.99/month",
    revenueCatPackageId: RevenueCatIds.packages.auraMonthly,
    introductoryTrial: SEVEN_DAY_TRIAL_COPY,
    availableAtLaunch: false
  },
  {
    productId: RevenueCatIds.products.auraAnnual,
    tierId: "aura_pro",
    billingPeriod: "annual",
    displayPrice: "$49.99/year",
    revenueCatPackageId: RevenueCatIds.packages.auraAnnual,
    introductoryTrial: SEVEN_DAY_TRIAL_COPY,
    availableAtLaunch: false
  },
  {
    productId: RevenueCatIds.products.sovereignAnnual,
    tierId: "sovereign",
    billingPeriod: "annual",
    displayPrice: "$299/year",
    revenueCatPackageId: RevenueCatIds.packages.sovereignAnnual,
    introductoryTrial: SEVEN_DAY_TRIAL_COPY,
    availableAtLaunch: false
  }
];

export const monetizationTiers: MonetizationTier[] = [
  {
    id: "horizon_free",
    name: "Horizon",
    eyebrow: "FREE FOREVER",
    description:
      "A beautiful entry point for casual stargazing and organic discovery.",
    highlights: [
      "Basic point-and-look Sky Lens scaffold",
      "Standard constellation exploration",
      "Manual Sky Map fallback",
      "Selected Learn content",
      "Selected daily sky highlights"
    ],
    availableAtLaunch: true,
    actionLabel: "Continue with Horizon Free"
  },
  {
    id: "horizon_plus",
    name: "Horizon+",
    eyebrow: "EVERYDAY STARGAZING",
    description:
      "A clean ad-free upgrade for users who want the full casual Chronaura rhythm.",
    monthlyPrice: "$4.99/month",
    annualPrice: "$29.99/year",
    founderAnnualPrice: "$24.99 first year",
    trialCopy: SEVEN_DAY_TRIAL_COPY,
    highlights: [
      "Expanded Sky Lens exploration",
      "All 88 constellation lessons",
      "Celestial alarms and rituals",
      "Premium themes",
      "Expanded Notes and Vault"
    ],
    featured: true,
    availableAtLaunch: true,
    actionLabel: "Start Horizon+ Trial"
  },
  {
    id: "aura_pro",
    name: "Aura Pro",
    eyebrow: "COMING LATER",
    description:
      "The complete premium experience for dedicated sky watchers and astronomy enthusiasts.",
    monthlyPrice: "$5.99/month",
    annualPrice: "$49.99/year",
    trialCopy: SEVEN_DAY_TRIAL_COPY,
    highlights: [
      "Full Deep Sky and Milky Way layers",
      "Light-pollution and astrophotography predictor",
      "Time-Scrub Matrix",
      "Advanced Watch gallery and complication preferences",
      "Astral Sound Bath and premium utilities"
    ],
    featured: false,
    availableAtLaunch: false,
    actionLabel: "Coming Later"
  },
  {
    id: "sovereign",
    name: "Sovereign",
    eyebrow: "WAITLIST · COMING LATER",
    description:
      "An annual-only prestige concept for future luxury hardware and spatial experiences.",
    annualPrice: "$299/year",
    trialCopy: SEVEN_DAY_TRIAL_COPY,
    highlights: [
      "Desk Obelisk StandBy concept",
      "Apple Vision Pro Stellar Portal concept",
      "Personalized Sovereign Sigil concept",
      "Physical Astral Artifact concept"
    ],
    featured: false,
    availableAtLaunch: false,
    actionLabel: "Waitlist · Coming Later"
  }
];

export function getProductForTier(
  tierId: ChronauraPaidTierId,
  billingPeriod: BillingPeriod
) {
  return subscriptionProducts.find(
    (product) =>
      product.tierId === tierId &&
      product.billingPeriod === billingPeriod
  );
}
