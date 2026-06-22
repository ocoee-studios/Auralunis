# App Store Connect — All Required Fields

## App Information

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `AuraLunis` | 9 characters |
| **Subtitle** | `The Interactive Astral Clock` | 29 characters (max 30) |
| **Privacy Policy URL** | `https://ocoeestudios.com/auralunis/privacy` | Must be hosted BEFORE submission |
| **Bundle ID** | `com.ocoee.auralunis` | Set in app.json, cannot change after first upload |
| **SKU** | `OCOEE-AURALUNIS-001` | Internal tracking only, not visible to users |
| **Primary Language** | English (U.S.) | |
| **Primary Category** | Reference | Astronomy reference app |
| **Secondary Category** | Education | Learn about the sky |
| **Age Rating** | 4+ | No objectionable content |
| **Content Rights** | Does not contain third-party content | All original or public domain |
| **Made for Kids** | No | |
| **License Agreement** | Standard Apple EULA | Our additional terms at ocoeestudios.com/auralunis/terms |
| **DSA Trader Status** | Non-trader | Ocoee Studios is a small indie studio, not an EU trader |

## Category Decision

**Primary: Reference** (not Education, not Weather, not Utilities)
- Reference is where Sky Guide, Star Walk, and SkyView are listed
- Users search for astronomy apps in Reference
- Being in the same category means showing up in "Similar Apps"

**Secondary: Education**
- The Learn tab, Sky in 30 Nights course, cultural stories justify this
- Broadens discovery beyond astronomy-specific searches

**Alternate option if Reference feels wrong:**
- Primary: Education
- Secondary: Weather (for Astro Weather forecast feature)

## Subtitle Options (pick one)

1. `The Interactive Astral Clock` — 29 chars ← recommended (unique, matches tagline)
2. `Live Sky Map & Star Tracker` — 27 chars (SEO-friendly, more searchable)
3. `AR Sky, Stars & Satellites` — 27 chars (highlights AR + satellites)
4. `Astronomy & Celestial Guide` — 28 chars (broad, professional)

Recommendation: Option 1 for brand identity, or Option 2 if ASO (App Store Optimization) matters more at launch.

## Version Information (per platform)

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Build | Set by EAS Build |
| What's New | "Welcome to AuraLunis — your personal window into the night sky." |
| Description | See below |
| Keywords | See below |
| Support URL | `https://ocoeestudios.com/auralunis/support` or `mailto:support@ocoeestudios.com` |
| Marketing URL | `https://ocoeestudios.com/auralunis` (optional) |
| Promotional Text | Can change anytime without review — use for seasonal events |

## App Description (4000 char max)

```
AuraLunis — The Interactive Astral Clock

Your time, written in the stars.

AuraLunis transforms your iPhone into a living celestial instrument. Point your phone at the sky and see constellation lines, planet labels, and satellite tracks overlaid on your live camera. Track the ISS, plan astrophotography sessions, and discover the stories written in the stars by five different cultures.

SKY LENS — AR CAMERA OVERLAY
Point and discover. 40+ toggleable layers show stars, constellations, planets, satellites, and the Milky Way on your live camera feed. Gold constellation lines and luxury engraving-style art make every screenshot beautiful.

CELESTIAL DIAL
A living astral clock with planets on orbital rings, real-time moon phase, tonight's observing score, and time-scrub to see the sky hours ahead or behind.

SATELLITE TRACKING
Track ISS, Hubble, Starlink trains, and more. Live radar with 9 tracking modes, orbital trails, and flyover predictions with haptic alerts.

ASTRO WEATHER
Hour-by-hour observing forecast. Cloud cover, atmospheric seeing, transparency — and a simple verdict: GO, MAYBE, or STAY IN.

BIRTH SKY
Enter your birthday and see the exact sky the night you were born. Your moon phase, visible planets, rising constellation, and a personal cosmic signature.

ASTROPHOTOGRAPHY PLANNER
Exposure calculator (500 Rule + NPF Rule), Milky Way core timing, tonight's best targets, and stacking recommendations for your equipment.

CULTURAL SKY STORIES
See the same stars through five different eyes: Greek, Aboriginal, Chinese, Norse, and Polynesian constellation art and mythology.

LEARN
Sky in 30 Nights guided course. Solar system, moon phases, star life cycles, satellite orbits, and cultural astronomy.

APPLE WATCH COMPANION
Star Compass on your wrist — point and feel the stars through haptic feedback. 7 complications. Tonight Score widget. Observation log.

PREMIUM FEATURES
Free: Celestial Dial, basic sky view, 10 constellations, ISS tracking, Learn.
Premium: Full Sky Lens AR, 88 constellations, all satellites, Birth Sky, Astro Weather, Photo Planner, Cultural Stories, Watch app, Night Vision, Dark Sky Finder.

$6.99/month · $39.99/year (7-day free trial) · $99.99 Founders Lifetime

Privacy-first. Your observations stay on your device in an encrypted vault. No ads. No tracking. No social feeds.

Ocoee Studios · ocoeestudios.com
```

## Keywords (100 char max, comma-separated)

```
astronomy,stars,constellation,sky map,planets,satellite,ISS,moon,AR,stargazing,night sky,telescope
```

(96 characters — leaves 4 chars of room)

## Screenshots Required

| Device | Count | Sizes |
|--------|-------|-------|
| iPhone 6.7" (15 Pro Max) | 3-10 | 1290×2796 |
| iPhone 6.5" (optional) | 0-10 | 1284×2778 |
| iPad 12.9" (if universal) | 0-10 | 2048×2732 |

### Screenshot Strategy (5 screenshots)
1. **Sky Lens AR** — Camera view with gold constellation lines, planet labels (the "whoa" shot)
2. **Celestial Dial** — Home screen with animated clock, planets, tonight score
3. **Fleet Radar** — Satellite tracking with ISS targeted, orbital data
4. **Birth Sky** — Personal star chart with cosmic signature
5. **Astro Weather** — Tonight's forecast with GO verdict

Each screenshot should have:
- App UI at full fidelity
- Short headline text above (e.g., "Point. Discover. Feel the Sky.")
- AuraLunis gold-on-black color scheme
- Device frame optional (Apple allows with or without)

## App Review Notes

```
AuraLunis is an astronomy app that uses the device camera (Sky Lens),
location (to compute star/planet positions for the observer), and
motion sensors (to determine which direction the phone is pointing).

No account creation is required. No user data is transmitted to our
servers. Subscription management is handled by RevenueCat/Apple.

For testing premium features: [provide sandbox Apple ID or promo code]

Contact: admin@ocoeestudios.com
```

## In-App Purchases (configure in ASC)

| Reference Name | Product ID | Type | Price |
|----------------|-----------|------|-------|
| AuraLunis Monthly | `auralunis_monthly` | Auto-renewable | $6.99 |
| AuraLunis Annual | `auralunis_annual` | Auto-renewable | $39.99 |
| AuraLunis Founders Lifetime | `auralunis_lifetime_founders` | Non-consumable | $99.99 |

Subscription Group: `AuraLunis Premium`
Free trial: 7 days on Annual only
