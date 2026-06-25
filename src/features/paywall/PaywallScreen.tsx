// PaywallScreen.tsx — canonical name for the full-screen subscription paywall.
//
// The implementation already lives in ThreeTierPaywallModal: a full-screen Modal
// with a starfield background, all three tiers (Annual $39.99/yr "BEST VALUE" +
// 7-day trial, Monthly $6.99/mo, Founders Lifetime $99.99 with FOUNDERS badge +
// $167.88 anchor), the premiumFeatures list, Restore / Terms / Privacy links
// (Terms & Privacy open in-app), an X close, and a placeholder-safe purchase flow.
// It is mounted once in App.tsx and opened app-wide via
// PaywallNavigationContext.openPaywall() (wired from Settings "Upgrade", Sky Lens
// gated layers, PremiumModeGate, and Onboarding).
//
// This file is re-exported under the canonical PaywallScreen name so imports and
// docs that expect "PaywallScreen" resolve — there is no second implementation to
// keep in sync.
export { ThreeTierPaywallModal as PaywallScreen } from "./ThreeTierPaywallModal";
