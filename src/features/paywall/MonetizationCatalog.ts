// MonetizationCatalog.ts
// AuraLunis pricing — optimized for launch.
// Three products: Monthly (no trial), Annual (7-day trial), Lifetime Founders (one-time).
// Trial is ANNUAL ONLY — prevents weekend trial-and-cancel on monthly.

export const RevenueCatIds = {
  products: {
    premiumMonthly:    "com.ocoee.auralunis.premium.monthly",
    premiumAnnual:     "com.ocoee.auralunis.premium.annual",
    lifetimeFounders:  "com.ocoee.auralunis.lifetime.founders",
  },
  packages: {
    premiumMonthly:    "premium_monthly",
    premiumAnnual:     "premium_annual",
    lifetimeFounders:  "lifetime_founders",
  },
  // All three products unlock this single entitlement
  entitlement: "auralunis_premium",
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
    badge: "BEST VALUE · SAVE 52%",
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
    subtitle: "One-time purchase · Never pay again",
    revenueCatPackageId: RevenueCatIds.packages.lifetimeFounders,
    badge: "FOUNDERS",
    trial: false,
    anchorPrice: "$167.88", // what 24 months of annual would cost — anchor comparison
  },
];

// ─── Feature gates ────────────────────────────────────────────────────────────

/** Tracking modes accessible on the free tier */
export const FREE_TRACKING_MODES = ["fleet", "deep-space", "golden", "meteor"] as const;

/** Tracking modes that require auralunis_premium */
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
  "Everything in Free, plus:",
  "Sky Lens AR — 40+ layers on your live camera feed",
  "88 constellations with cultural stories from 5 traditions",
  "Birth Sky — your personal star chart from the night you were born",
  "Astro Weather — hour-by-hour observing forecast with GO/MAYBE/STAY IN",
  "Astrophotography Planner — exposure calculator + best targets tonight",
  "Sky Share — branded observation cards for social",
  "Satellite fleet — ISS, Starlink trains, Hubble, debris tracking",
  "Apple Watch companion — Star Compass, 7 complications, haptic stars",
  "Deep Sky — 110 Messier objects at real angular scale",
  "Milky Way band + ecliptic overlay",
  "Dark Sky Finder — nearest Bortle 1-3 sites with drive times",
  "Night Vision Mode — deep red for dark adaptation",
  "Encrypted Cosmic Vault — notes, captures, observation log",
  "Eclipse & meteor shower calendar with countdown alerts",
  "iOS home screen widgets",
];

export const lifetimeFeatures = [
  "Everything in Premium — forever",
  "Founders Edition — price increases to $129.99 after launch",
  "Every future feature included at no extra cost",
  "Cosmic Wellness dashboard when it ships (HealthKit integration)",
  "Founders badge on your Sky Share cards",
];
