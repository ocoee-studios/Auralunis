// MonetizationCatalog.ts
// AuraLunis pricing — optimized for launch.
// Three products: Monthly (no trial), Annual (7-day trial), Lifetime Founders (one-time).
// Trial is ANNUAL ONLY — prevents weekend trial-and-cancel on monthly.

export const RevenueCatIds = {
  products: {
    premiumMonthly:    "com.ocoeestudios.auralunis.premium.monthly",
    premiumAnnual:     "com.ocoeestudios.auralunis.premium.annual",
    lifetimeFounders:  "com.ocoeestudios.auralunis.lifetime.founders",
  },
  packages: {
    premiumMonthly:    "premium_monthly",
    premiumAnnual:     "premium_annual",
    lifetimeFounders:  "lifetime_founders",
  },
  // All three products unlock this single entitlement. This MUST match the
  // entitlement IDENTIFIER in the RevenueCat dashboard EXACTLY — it is literally
  // "AuraLunis Premium" (with the space and capitals), not a snake_case slug. A
  // mismatch means purchases succeed but never unlock premium, so do not "tidy"
  // this into auralunis_premium.
  entitlement: "AuraLunis Premium",
} as const;

export interface PlanOption {
  id: string;
  productId: string;
  name: string;
  interval: "monthly" | "annual" | "lifetime";
  /** Primary price display — e.g. "$39.99/year" */
  displayPrice: string;
  /** Secondary line — monthly equivalent or subtitle */
  subtitle: string;
  revenueCatPackageId: string;
  badge?: string;
  /** Effective monthly price for an annual plan — e.g. "$3.33/mo" */
  effectiveMonthly?: string;
  /** Trial only on annual */
  trial: boolean;
  /** Anchor price shown as strikethrough on lifetime card */
  anchorPrice?: string;
}

export const plans: PlanOption[] = [
  {
    id: "premium_annual",
    productId: RevenueCatIds.products.premiumAnnual,
    name: "AuraLunis Premium",
    interval: "annual",
    displayPrice: "$39.99/year",
    subtitle: "$3.33/month, billed annually",
    revenueCatPackageId: RevenueCatIds.packages.premiumAnnual,
    badge: "Most Popular",
    effectiveMonthly: "$3.33/mo",
    trial: true,   // 7-day free trial on annual only
  },
  {
    id: "premium_monthly",
    productId: RevenueCatIds.products.premiumMonthly,
    name: "AuraLunis Premium",
    interval: "monthly",
    displayPrice: "$6.99/month",
    subtitle: "Billed monthly · Cancel anytime",
    revenueCatPackageId: RevenueCatIds.packages.premiumMonthly,
    trial: false,  // No trial on monthly — direct charge
  },
  {
    id: "lifetime_founders",
    productId: RevenueCatIds.products.lifetimeFounders,
    name: "Founders Lifetime",
    interval: "lifetime",
    displayPrice: "$99.99",
    subtitle: "Pay once. Own the sky forever.",
    revenueCatPackageId: RevenueCatIds.packages.lifetimeFounders,
    badge: "Limited time",
    trial: false,
    anchorPrice: "$167.88", // what 24 months of annual would cost — anchor comparison
  },
];

// ─── Feature gates ────────────────────────────────────────────────────────────

/** Tracking modes accessible on the free tier */
export const FREE_TRACKING_MODES = ["fleet", "deep-space", "golden", "meteor"] as const;

/** Tracking modes that require the "AuraLunis Premium" entitlement */
export const PREMIUM_TRACKING_MODES = ["train", "debris", "reentry", "chain", "static"] as const;

export type FreeTrackingMode    = typeof FREE_TRACKING_MODES[number];
export type PremiumTrackingMode = typeof PREMIUM_TRACKING_MODES[number];
export type TrackingMode        = FreeTrackingMode | PremiumTrackingMode;

export function isModeGated(mode: string): boolean {
  return PREMIUM_TRACKING_MODES.includes(mode as PremiumTrackingMode);
}

/** Cosmic Drift: free users can save this many lock events */
export const FREE_DRIFT_EVENT_LIMIT = 5;

// ─── Paywall feature lists ────────────────────────────────────────────────────

export const freeFeatures = [
  "Fleet tracking — ISS, Hubble, NOAA-20",
  "Deep Space — all 7 planets in real time",
  "Golden Hour sun vector",
  "Meteor shower sonar",
  "Tonight Score",
  "Basic Learn (Solar System, Moon, Planets)",
  `Cosmic Drift — first ${FREE_DRIFT_EVENT_LIMIT} lock events`,
];

export const premiumFeatures = [
  "Experience the Living Universe",
  "✨ Watch the Milky Way come alive with animated dust and hydrogen clouds",
  "💜 Explore breathtaking nebulae — Orion, Lagoon, Trifid in stunning detail",
  "🪐 See planets like never before — Jupiter's storms, Saturn's rings, Mars' polar caps",
  "🌕 A cinematic Moon with craters, earthshine, and atmospheric god rays",
  "🌙 Birth Sky — the exact sky the moment you were born",
  "☁️ Astro Weather — know instantly if tonight is worth going outside",
  "📸 Sky Lens Pro — Night Vision, Cinematic Mode, Time Travel",
  "🛰️ Live satellite tracking — ISS, Starlink trains, space debris",
  "📅 Never miss a meteor shower, eclipse, or conjunction again",
];

export const lifetimeFeatures = [
  "🌙 Founder's Edition — The Living Universe, forever",
  "Every premium feature, every future update, one price",
  "Founders pricing — limited availability",
  "Priority access to new features before anyone else",
];
