# AuraLunis — Launch Blocker Status
Updated: 2026-06-24 (reconciled against actual code on `visual/polish-pass` / PR #73)
Bundle ID: com.ocoeestudios.auralunis · Apple Developer: Ocoee Studios LLC (ACTIVE)
App Store Connect: AuraLunis, SpicyCalc, Peptendium listed

> NOTE TO CONTRIBUTORS: verify against the code before "rebuilding" anything below —
> most of this list is already implemented. Each item lists where it lives.

---

## 1. MILKY WAY — ✅ DONE (PR #73)
- Full sky coverage: the procedural `MilkyWayLayer` already wraps the entire galactic
  plane (glow + ~2200-star cloud + 332 dust blobs). `MilkyWayCoreLayer` no longer
  returns null when the centre is behind camera (only when below horizon).
- Vertical stripe boundaries: FIXED. The core photo's circular feather was clipping
  the 2:1 band into a blob; replaced with an **elliptical feather aligned to the
  galactic-plane tilt** (`gradientTransform`) so it melts on all 4 edges.
- Device test: pan 360° — warm band visible in every direction.

## 2. PAYWALL — ✅ DONE (exists; see PaywallScreen.tsx → ThreeTierPaywallModal)
Full-screen paywall is built and wired. `src/features/paywall/PaywallScreen.tsx` is the
canonical export of `ThreeTierPaywallModal`:
- Header "Unlock the Full Cosmos" + starfield bg; X close.
- All 3 tiers visible/selectable: Annual $39.99/yr (BEST VALUE · SAVE 52%, 7-day trial,
  pre-selected), Monthly $6.99/mo (no trial), Founders Lifetime $99.99 (FOUNDERS badge,
  $167.88 anchor strikethrough; → $129.99 post-launch).
- premiumFeatures list; Restore / Terms / Privacy (in-app modals); placeholder-safe.
- Wired via `PaywallNavigationContext.openPaywall()` from Settings "Upgrade", Sky Lens
  gated layers, PremiumModeGate, Onboarding. Purchase is package-based (all tiers),
  refreshes the shared EntitlementContext app-wide on success.
- Product IDs `com.ocoeestudios.auralunis.{premium.monthly,premium.annual,lifetime}`
  — **MUST match App Store Connect exactly** (owner: confirm).

## 3. DEAD FOLDER — ✅ DONE
`src/features/future/` does not exist; zero imports anywhere.

## 4. SIM_LOCATION — ✅ DONE
No NYC. Real device location via `useObserverLocation` is used in normal mode;
`SIM_LOCATION` is only the indoor-sim fallback (Ducktown TN 35.04,-84.38).

## 5. ONBOARDING — ✅ DONE
`App.tsx` checks `ONBOARDING_SEEN_KEY` on first launch, shows `OnboardingFlow`, sets the
flag on completion (shown once).

## 6. REVENUECAT — ✅ graceful (owner action: real key + confirm product IDs)
Placeholder key degrades to "Subscriptions available after launch" (no crash in release).
Dev unlock behind `ALLOW_DEV_PREMIUM` + `__DEV__` (never true in release). Remaining:
drop in the live public key and confirm the three product IDs in App Store Connect.

---

## REMAINING (owner / device — not code)
- [ ] Device / TestFlight pass (esp. Milky Way 360° + paywall sandbox flow)
- [ ] Real RevenueCat public API keys in app.json (currently REPLACE_WITH_*)
- [ ] Confirm the 3 IAP product IDs match App Store Connect exactly
