// usePaywallOffers.ts
// Resolves each paywall plan's LIVE state from StoreKit/RevenueCat: the localized price
// and — for the monthly/annual subscriptions — whether this account is eligible for the
// Apple-configured introductory free trial. The app never invents a trial: a plan is only
// promised a trial when the store reports BOTH an actual introductory offer on the product
// AND that this account is eligible for it. Everything degrades to normal pricing on
// failure, and a failed eligibility lookup never blocks purchasing.

import { useEffect, useState } from "react";
import { plans } from "./MonetizationCatalog";
import {
  getIntroOfferEligibility,
  getLivePackages,
  type IntroOfferInfo,
  type LivePackage,
} from "@/services/RevenueCatService";

// Per-option UI state. Adapted from the requested shape to carry a store-derived
// durationText (e.g. "7 days") rather than a hardcoded literal, so it always mirrors the
// real offer StoreKit reports.
export type TrialState =
  | { status: "eligible"; durationText: string }
  | { status: "ineligible" }
  | { status: "unavailable" }
  | { status: "loading" };

export type PlanInterval = "monthly" | "annual" | "lifetime";

export type PlanOffer = {
  planId: string;
  interval: PlanInterval;
  /** Live localized recurring/one-time price (e.g. "$9.99"); null → use catalog fallback. */
  localizedPrice: string | null;
  trial: TrialState;
};

// Human duration for the intro period, straight from what StoreKit reports. A 1-week free
// trial (Apple's "1 week" option) reads as "7 days"; the formatter generalizes to whatever
// the store actually returns rather than assuming a fixed length.
function introDurationText(intro: IntroOfferInfo): string {
  const n = intro.periodNumberOfUnits;
  switch (intro.periodUnit) {
    case "DAY":
      return `${n} day${n === 1 ? "" : "s"}`;
    case "WEEK":
      return n === 1 ? "7 days" : `${n} weeks`;
    case "MONTH":
      return n === 1 ? "1 month" : `${n} months`;
    case "YEAR":
      return n === 1 ? "1 year" : `${n} years`;
    default:
      return `${n} ${intro.periodUnit.toLowerCase()}`;
  }
}

const loadingOffer = (planId: string, interval: PlanInterval): PlanOffer => ({
  planId,
  interval,
  localizedPrice: null,
  trial: { status: "loading" },
});

const allLoading = (): Record<string, PlanOffer> =>
  Object.fromEntries(plans.map((p) => [p.id, loadingOffer(p.id, p.interval)]));

/**
 * @param active  When false the hook stays idle (e.g. paywall hidden). Flipping to true
 *                triggers a fresh load and resets every plan to `loading` first, so trial
 *                copy can never flash before eligibility resolves.
 */
export function usePaywallOffers(active: boolean): { offers: Record<string, PlanOffer>; loading: boolean } {
  const [offers, setOffers] = useState<Record<string, PlanOffer>>(allLoading);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    setLoading(true);
    setOffers(allLoading()); // never show stale trial copy from a previous open

    (async () => {
      const subs = plans.filter((p) => p.interval !== "lifetime");
      let live: LivePackage[] = [];
      let eligibility: Record<string, string> = {};
      try {
        // Prices and eligibility are independent; both degrade to empty on failure.
        [live, eligibility] = await Promise.all([
          getLivePackages(),
          getIntroOfferEligibility(subs.map((p) => p.productId)),
        ]);
      } catch {
        // Both service calls already swallow their own errors; this is a final backstop so
        // a lookup failure results in normal pricing, never a blocked or crashed paywall.
      }
      if (cancelled) return;

      const byProduct = new Map(live.map((l) => [l.productId, l]));
      const next: Record<string, PlanOffer> = {};

      for (const p of plans) {
        const pkg = byProduct.get(p.productId) ?? null;
        const localizedPrice = pkg?.priceString ?? null;

        let trial: TrialState;
        if (p.interval === "lifetime") {
          trial = { status: "unavailable" }; // lifetime is one-time — NEVER a trial
        } else {
          const elig = eligibility[p.productId];
          if (elig === "eligible" && pkg?.introOffer) {
            // Both conditions met: the store confirms a real offer AND this account qualifies.
            trial = { status: "eligible", durationText: introDurationText(pkg.introOffer) };
          } else if (elig === "ineligible") {
            trial = { status: "ineligible" };
          } else {
            // "no_offer", "unknown", missing eligibility, or a failed lookup → normal price.
            trial = { status: "unavailable" };
          }
        }

        next[p.id] = { planId: p.id, interval: p.interval, localizedPrice, trial };
      }

      setOffers(next);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [active]);

  return { offers, loading };
}
