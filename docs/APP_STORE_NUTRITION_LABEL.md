# App Store Privacy Nutrition Label — AuraLunis

> **Authoritative source:** `docs/APP_STORE_PRIVACY_NUTRITION_LABEL.md` is the
> canonical, detailed version used to fill in App Store Connect. This file is a
> short summary kept in sync with it. If the two ever disagree, the detailed doc wins.

Use this when filling out App Store Connect → App Privacy.

## Data Types Collected

### 1. Precise Location
- **Purpose:** App Functionality
- **Linked to identity:** No
- **Used for tracking:** No
- **Notes:** Used on-device to compute sky positions. Approximate coordinates only are sent to Open-Meteo for the weather forecast (no account, no identity).

### 1b. Device ID (RevenueCat anonymous ID)
- **Purpose:** App Functionality
- **Linked to identity:** No
- **Used for tracking:** No
- **Notes:** RevenueCat generates an anonymous `$RCAnonymousID` to manage subscription state. No Apple ID, email, or name is collected. No IDFA / advertising identifier is ever used.

### 2. Purchases
- **Purpose:** App Functionality
- **Linked to identity:** Yes (via Apple ID through RevenueCat)
- **Used for tracking:** No
- **Notes:** Subscription status managed by RevenueCat/Apple.
  No payment info handled by AuraLunis directly.

### 3. Diagnostics — Crash Data
- **Purpose:** App Functionality
- **Linked to identity:** No
- **Used for tracking:** No
- **Notes:** Standard Expo/React Native crash reports if enabled.

## Data NOT Collected
- ❌ Contact Info (name, email, phone) — never collected
- ❌ Advertising identifier (IDFA) — never used (the only identifier collected is RevenueCat's anonymous ID — see §1b)
- ❌ Usage Data — paywall/session analytics are processed on-device only and never transmitted, so they are not "collected" per Apple's definition
- ❌ Browsing History — not applicable
- ❌ Search History — not collected
- ❌ Contacts — not accessed
- ❌ Photos or Videos — camera used live only, not stored unless user saves
- ❌ Audio Data — not collected
- ❌ Financial Info — not handled (Apple/RevenueCat only)
- ❌ Health & Fitness — not collected (no HealthKit integration)
- ❌ Sensitive Info — not collected
- ❌ User Content (emails, texts, photos) — Vault is local/encrypted only

## Tracking Declaration
**Does this app track users?** No.
AuraLunis does not use IDFA, fingerprinting, or any cross-app tracking.
No ATT (App Tracking Transparency) prompt is required.

## Third-Party SDKs and Their Data Practices

### RevenueCat
- Manages subscription state
- Receives: anonymous app user ID, purchase receipts
- Does NOT receive: location, health data, usage data
- Privacy policy: https://www.revenuecat.com/privacy

### Open-Meteo (optional)
- Weather API for sky quality forecast
- Receives: approximate lat/lon coordinates
- Does NOT receive: device ID, user ID, health data
- No account required, no API key required
- Privacy policy: https://open-meteo.com/en/terms

### astronomy-engine (bundled)
- Runs entirely on-device
- No network requests
- No data collection

### Expo / React Native
- Standard framework
- Optional crash reporting (Apple standard)
- No custom analytics

## Export Compliance
- **Uses encryption:** Yes
- **Type:** User data encryption only (NaCl secretbox for Vault)
- **Qualifies for exemption:** Yes (ECCN 5D002 exemption for
  authentication/digital signature/data integrity/user data encryption)
- **CCATS/ERN:** Not required for exempt encryption

## Age Rating
- **Rating:** 4+
- **No objectionable content**
- **No user-generated content visible to others**
- **No gambling, violence, or mature themes**

## Content Rights
- All astronomical calculations: open-source astronomy-engine library (MIT)
- All UI design/code: original work by Ocoee Studios
- TLE orbital data: public domain (NORAD/Space-Track)
- Star catalogs: public domain (Hipparcos/Yale Bright Star)
- Constellation data: IAU public domain
- App icon: original design, owned by Ocoee Studios
- No third-party copyrighted content
