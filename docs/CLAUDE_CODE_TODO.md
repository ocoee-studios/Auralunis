# Claude Code — Launch Blocker Fix List
Updated: June 22, 2026
Bundle ID CONFIRMED: com.ocoeestudios.auralunis
Apple Developer: Ocoee Studios LLC (ACTIVE)
App Store Connect: AuraLunis, SpicyCalc, Peptendium listed

## Branch: visual/polish-pass → PR to main → device test → merge

---

## 1. MILKY WAY (visual — highest priority)

MilkyWayCoreLayer returns null when galactic center is behind camera.
The procedural band wraps the full sky but the photo texture only
shows near Sagittarius. Also has visible vertical stripe boundaries.

FIX:
- Build a full galactic plane gradient band so MW wraps entire sky
- Fix the elliptical feather on the core texture (PR pending merge)
- Remove vertical stripe boundaries entirely
- Test: pan 360° slowly — warm golden band visible in every direction
  along the galactic plane (Sagittarius → Cygnus → Cassiopeia → Orion)

## 2. PAYWALL (revenue — critical blocker)

No full-screen PaywallScreen exists. Users cannot subscribe.

BUILD PaywallScreen.tsx:
- Header: "Unlock the Full Cosmos" with starfield background
- Three tiers ALL visible:
  - Annual: $39.99/yr, "BEST VALUE · SAVE 52%", 7-day trial, gold CTA
  - Monthly: $6.99/mo, no trial, secondary style
  - Founders Lifetime: $99.99, "FOUNDERS" badge, strikethrough $167.88
- Feature list from MonetizationCatalog premiumFeatures
- Bottom links (MUST be tappable — Apple requires):
  - Restore Purchases → RevenueCat restore
  - Terms of Use → TermsScreen modal
  - Privacy Policy → PrivacyScreen modal
- Close X button (users must be able to dismiss)
- Wire: PaywallNavigationContext.openPaywall() → PaywallScreen modal
- Wire: Settings "Upgrade" button → PaywallScreen
- Wire: Sky Lens gated layers → PaywallScreen
- Wire: PremiumModeGate "Unlock" → PaywallScreen
- With placeholder key: show "Subscriptions available after launch"

Product IDs (must match App Store Connect EXACTLY):
  com.ocoeestudios.auralunis.premium.monthly
  com.ocoeestudios.auralunis.premium.annual
  com.ocoeestudios.auralunis.lifetime.founders

## 3. DEAD FOLDER (crash risk)

src/features/future/ has 7 files for killed features:
  DeskObeliskPreview, FutureLuxuryModulesPanel, SovereignSigil*,
  AuraAmbientTypes, StellarPortalTypes

These are imported by WatchScreen and SettingsScreen.
DELETE the folder. Remove all imports. Remove UI sections that
reference these dead features.

## 4. SIM_LOCATION (accuracy)

OrbitalAlignmentScreen.tsx has fallback location hardcoded to NYC
(40.7128, -74.006). Change to use real device location from
useObserverLocation hook. If unavailable, fall back to a generic
mid-latitude default (35.0, -85.0) instead of NYC.

## 5. ONBOARDING (first launch)

OnboardingFlow.tsx exists but nothing triggers it.
Add AsyncStorage check for 'hasOnboarded' flag:
- If false/missing: show OnboardingFlow before RootTabs
- On completion: set flag to true
- User sees onboarding exactly once

## 6. REVENUECAT KEY (pre-launch)

app.json still has placeholder key. The dev bypass in
useEntitlement.ts handles this gracefully (__DEV__ = premium).
Verify that in production builds (__DEV__ = false), the app
doesn't crash with the placeholder — it should show the paywall
with "Subscriptions available after launch" or similar.

Real key will be added when RevenueCat is configured.

---

## DONE (completed this session)
- [x] Bundle ID updated to com.ocoeestudios.auralunis
- [x] SDK 54 upgrade
- [x] Sky Lens AR running on device
- [x] 35 constellations ungated (PR #51)
- [x] 38 deep sky objects with multi-layer rendering
- [x] 3,500 dome stars
- [x] 6 Gemini FX layers pushed and wired
- [x] Birth Sky screen built
- [x] Astro Weather screen built
- [x] Celestial Mood Engine wired into Home
- [x] Learn with real lessons + Sky Lens deep-linking
- [x] Zodiac layer with info cards
- [x] Legal pages hardwired in-app
- [x] Dead assets trimmed
- [x] Sound Bath remnants removed
- [x] Night Vision + Bortle settings
- [x] Dev premium bypass for testing
- [x] Deep Sky layer toggle fixed
- [x] Tap targets enlarged for AR
- [x] Orbital density preview redesigned
- [x] App Store description written (2918 chars)
- [x] Ducktown removed from all user-facing content
