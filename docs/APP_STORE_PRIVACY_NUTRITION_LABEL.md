# AuraLunis — App Store Privacy Nutrition Label

## Overview

Apple requires a privacy "nutrition label" in App Store Connect before submission.
This document maps every data type AuraLunis collects, why, and whether it's
linked to the user's identity. Use this to fill in the App Store Connect
Privacy section.

---

## Data Types Collected

### 1. Purchases

| Field | Value |
|---|---|
| **Data type** | Purchase History |
| **Collection** | Yes |
| **Linked to identity** | Yes |
| **Used for tracking** | No |
| **Purpose** | App Functionality |
| **Source** | RevenueCat SDK processes Apple StoreKit transactions |
| **Details** | Subscription status (active/expired/trial), product ID, purchase date, expiration date. RevenueCat generates an anonymous app user ID. No credit card or billing address is collected by the app — Apple handles payment. |

### 2. Location

| Field | Value |
|---|---|
| **Data type** | Precise Location |
| **Collection** | Yes |
| **Linked to identity** | No |
| **Used for tracking** | No |
| **Purpose** | App Functionality |
| **Details** | Device GPS is used to compute ephemeris (planet/star positions), Tonight Score, sunrise/sunset times, and Dark Sky Finder. Location is processed on-device. Approximate coordinates only are sent to Open-Meteo for the weather forecast (no account, no identity). This matches the `NSPrivacyCollectedDataTypePreciseLocation` declaration in the app's privacy manifest (app.json). |

### 3. Identifiers

| Field | Value |
|---|---|
| **Data type** | Device ID |
| **Collection** | Yes |
| **Linked to identity** | No |
| **Used for tracking** | No |
| **Purpose** | App Functionality |
| **Details** | RevenueCat generates an anonymous `$RCAnonymousID` to manage subscription state. No Apple ID, email, or name is collected by AuraLunis. If the user does not subscribe, no identifier is generated. |

### 4. Usage Data

| Field | Value |
|---|---|
| **Data type** | Product Interaction |
| **Collection** | Yes |
| **Linked to identity** | No |
| **Used for tracking** | No |
| **Purpose** | Analytics |
| **Details** | AuraLunis tracks: paywall impressions, purchase taps, plan toggles (monthly/annual), continue-free taps, and session counts. All analytics are processed locally via AnalyticsService. No data is sent to third-party analytics services at launch. |

### 5. Diagnostics

| Field | Value |
|---|---|
| **Data type** | Crash Data, Performance Data |
| **Collection** | Yes (if expo-updates or Sentry added later) |
| **Linked to identity** | No |
| **Used for tracking** | No |
| **Purpose** | App Functionality |
| **Details** | At launch, no crash reporting SDK is included. If added later, update this label. Expo's built-in error boundaries run locally. |

---

## Data Types NOT Collected

Check "No" for all of these in App Store Connect:

| Data type | Collected? |
|---|---|
| Contact Info (name, email, phone, address) | **No** |
| Health & Fitness | **No** |
| Financial Info (beyond purchase history) | **No** |
| Sensitive Info | **No** |
| Contacts (address book) | **No** |
| User Content (photos, videos, audio) | **No** |
| Browsing History | **No** |
| Search History | **No** |
| Coarse Location | **No** (Precise Location is collected — see §2 above) |
| User Content / Text (AI queries) | **No** (no AI feature ships) |
| Other Data | **No** |

---

## RevenueCat-Specific Notes

### What RevenueCat collects (their SDK)

Per RevenueCat's documentation:
- Anonymous app user ID (`$RCAnonymousID`)
- Product identifiers purchased
- Transaction timestamps
- Subscription status and expiration
- Device platform (iOS) and app version
- Country (from App Store storefront, not GPS)

### What RevenueCat does NOT collect

- Name, email, phone number
- Apple ID
- Payment method details
- Location data
- Device IDFA (unless you explicitly enable it — AuraLunis does not)
- Any Vault, journal, or observation data

### RevenueCat data processing

RevenueCat processes subscription data on their servers to:
- Verify receipts with Apple
- Manage subscription lifecycle (trial → active → expired → grace period)
- Provide subscription status to the app via the SDK

RevenueCat's privacy policy: https://www.revenuecat.com/privacy

---

## How to Fill In App Store Connect

1. Go to **App Store Connect → Your App → App Privacy**
2. Click **Get Started**
3. Answer **"Yes, we collect data"**
4. Add these data types:
   - **Purchases** → Purchase History → App Functionality → Linked to Identity: Yes
   - **Location** → Precise Location → App Functionality → Linked to Identity: No
   - **Identifiers** → Device ID → App Functionality → Linked to Identity: No
   - **Usage Data** → Product Interaction → Analytics → Linked to Identity: No
5. For each: **Used for Tracking → No**
6. Publish

---

## No AI / LLM Feature

AuraLunis ships **without** any AI/chat/LLM feature. No "AI Sky Companion," no
Anthropic API, no user text queries are sent anywhere. Do **not** declare User
Content or any AI-related data type in App Store Connect. (Earlier internal drafts
described an AI Sky Companion — that feature was removed before launch.)

---

## Open-Meteo (Weather)

| Field | Value |
|---|---|
| **Data type** | Precise Location (approximate coordinates) |
| **Sent to** | Open-Meteo API |
| **Details** | Latitude/longitude is sent to fetch current cloud cover for the Tonight Score forecast. No account, API key, device ID, or user identity is sent. Open-Meteo is a free, keyless service. |

Open-Meteo terms: https://open-meteo.com/en/terms

---

## Vault Data (local only)

The Cosmic Vault stores encrypted notes, observations, and journal entries.
This data:
- Is encrypted with NaCl secretbox on-device
- Encryption key is stored in expo-secure-store (iOS Keychain)
- Never leaves the device
- Is NOT collected, NOT sent to any server, NOT backed up to any cloud
- Does NOT need to be declared in the nutrition label (it's local-only)

---

## Summary for App Store Connect

| Data Type | Collected | Linked | Tracking | Purpose |
|---|---|---|---|---|
| Purchase History | Yes | Yes | No | App Functionality |
| Precise Location | Yes | No | No | App Functionality |
| Device ID | Yes | No | No | App Functionality |
| Product Interaction | Yes | No | No | Analytics |

Nothing is used for tracking; there is no AI feature and no User Content is collected.
