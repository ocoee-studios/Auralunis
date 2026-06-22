# Claude Code — Priority Todo List
Generated from full codebase scan, June 21 2026

## 🔴 BUGS (fix before TestFlight)

### BUG-1: Dead `future/` folder imported by live screens
7 files in `src/features/future/` reference killed features
(SovereignSigil, DeskObelisk, FutureLuxuryModulesPanel).
These are imported by WatchScreen.tsx and SettingsScreen.tsx.
**Fix:** Delete the entire `src/features/future/` folder.
Remove all imports from WatchScreen and SettingsScreen.
Remove the sections that reference these dead features.

### BUG-2: `sound_bath` references (3 places)
Killed feature still referenced in:
- `src/features/daily-life/DailyLifeTypes.ts` (actionType union)
- `src/features/watch/WatchFaceCatalog.ts` (2 places: complication ID + entry)
**Fix:** Remove `sound_bath` from all type unions and catalog entries.

### BUG-3: Watch face catalog has dead items
`WatchFaceCatalog.ts` has entries marked `future: true` for
killed features. These show as "Future preview" buttons.
**Fix:** Remove all entries where `future: true`. Keep only
the real, specced watch features.

### BUG-4: SIM_LOCATION hardcoded to NYC
`OrbitalAlignmentScreen.tsx` line 66 has a fallback location
of `40.7128, -74.006` (New York). Should use the observer's
real location or at least Ducktown TN as default.
**Fix:** Change to `35.04, -84.38` (Ducktown) or better yet,
import the default from a shared constant.

### BUG-5: Onboarding never triggers
`OnboardingFlow.tsx` exists but nothing in the app checks
for first launch or triggers it. No `hasOnboarded` flag.
**Fix:** In the root navigator/App, check AsyncStorage for
`hasOnboarded`. If false, show OnboardingFlow before RootTabs.
Set the flag after completion.

### BUG-6: RevenueCat API key is placeholder
`app.json` has `REPLACE_WITH_REVENUECAT_PUBLIC_IOS_API_KEY`.
This is expected pre-launch but will crash if someone tries
to subscribe. Ensure the paywall shows gracefully when RC
isn't configured (it should already via the dynamic require).
**Fix:** Verify the paywall screen doesn't crash with the
placeholder key. It should show "Subscriptions unavailable"
or similar instead of a white screen / crash.

---

## 🟡 ALERT.ALERT STUBS (replace with real screens)

### STUB-1: Watch Screen — 4 Alert stubs
Lines 159, 173, 311, 339: Alert.alert for watch face selection,
curated setup, complication selection, haptic breathing.
**Fix:** Replace with real UI. The watch face/theme selectors
should cycle through options with visual previews (not alerts).
Haptic breathing should trigger a real haptic pattern preview.

### STUB-2: Sky Screen — Celestial Archive
Line 216: Alert.alert("Celestial Archive", "Archive sections prepared...")
**Fix:** Build a CelestialArchiveScreen with sections for
Solar System, Moon, Planets, Constellations, Stars, Events,
Deep Sky, Milky Way. Can reuse Learn content and link to
Sky Lens. This is a premium feature.

### STUB-3: Learn Screen — Teacher Mode  
Line 106: Alert.alert("Teacher Mode", "Future educational mode preview.")
**Fix:** Either build a simplified Teacher Mode with easier
language, pronunciation guides, and quizzes — OR remove
the card entirely. A "future preview" alert looks broken.

---

## 🟢 MISSING SCREENS (services built, UI not)

### SCREEN-1: Photo Planner Screen
`AstroPhotographyService.ts` is fully built (exposure calculator,
MW timing, target recommendations, stacking advice).
**Build:** `PhotoPlannerScreen.tsx` with:
- Tonight's verdict (good for MW? Planets? Trails?)
- Equipment inputs (focal length, aperture — persist in settings)
- Exposure calculation display (500 rule, NPF rule, ISO rec)
- Tonight's target list with difficulty ratings
- MW core azimuth + best time
- Golden/blue hour times
Wire from SkyScreen's "Astrophotography planner" card.

### SCREEN-2: Sky Share Screen
`SkyShareService.ts` is fully built (4 card styles, headline
generation, vault integration).
**Build:** `SkyShareScreen.tsx` or integrate into the observation
flow. When user saves to vault or taps "Share," show:
- Card preview in the selected style (cosmic/minimal/data/story)
- Style picker (4 thumbnails)
- Toggle: include location, include score, include sky data
- Share button → expo-sharing
Wire from info cards in Sky Lens ("Share Card" button).

---

## 🔵 CLEANUP (nice to have before launch)

### CLEAN-1: Delete dead features folder
Remove `src/features/future/` entirely (7 files):
- DeskObeliskPreview.tsx
- FutureLuxuryModulesPanel.tsx
- SovereignSigilPreview.tsx
- SovereignSigilService.ts
- SovereignSigilTypes.ts
- AuraAmbientTypes.ts
- StellarPortalTypes.ts

### CLEAN-2: Delete daily-life types if unused
`src/features/daily-life/DailyLifeTypes.ts` references `sound_bath`.
If nothing else imports from this file, delete it.

### CLEAN-3: Remove console.log from production code
Scan all src/ for console.log and remove or wrap in __DEV__ guard.

### CLEAN-4: Night Vision toggle in Settings
Settings has no global Night Vision toggle. Sky Lens has its own
toggle (the half-moon icon), but Settings → Appearance should
also have "Night Vision Mode" with a description "Deep red for
dark adaptation" and a toggle that syncs with Sky Lens state.

### CLEAN-5: Bortle Scale / Sky Quality setting
Settings should have a "Sky Quality" picker:
- Urban (Bortle 7-9)
- Suburban (Bortle 5-6)  
- Rural (Bortle 3-4)
- Dark site (Bortle 1-2)
This feeds into AstroWeatherService and the horizon glow opacity.

---

## BUILD ORDER
1. BUG-1 through BUG-6 (30 min — just deletions and small fixes)
2. STUB-1 Watch Screen cleanup (1 hour)
3. SCREEN-1 Photo Planner (2 hours — service already done)
4. SCREEN-2 Sky Share (2 hours — service already done)
5. CLEAN-1 through CLEAN-5 (1 hour)
6. STUB-2 Celestial Archive (if time)
7. STUB-3 Teacher Mode (if time — or just remove the card)

Total: ~8 hours of focused work.
After this list, AuraLunis is TestFlight-ready.
