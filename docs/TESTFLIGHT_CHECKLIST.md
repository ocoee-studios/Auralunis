# Chronaura — TestFlight Checklist

## Before uploading to TestFlight

### Build
- [ ] `npm install` completes without errors
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx expo-doctor` — no critical issues
- [ ] `eas build --platform ios` succeeds
- [ ] Build installs on a real iPhone

### Functionality
- [ ] App launches without crash
- [ ] Onboarding flow completes (4 steps)
- [ ] All 5 tabs load: Home, Sky, Watch, Learn, Settings
- [ ] Tonight Score displays a number
- [ ] Astrolabe renders
- [ ] Live time updates
- [ ] Location permission prompt appears
- [ ] Camera permission prompt appears (Sky Lens)

### Subscriptions
- [ ] Paywall opens from Settings → Manage Plan
- [ ] Annual plan pre-selected with BEST VALUE badge
- [ ] Monthly plan selectable
- [ ] "Start My 7-Day Free Trial" button taps
- [ ] Sandbox purchase completes (sandbox Apple ID)
- [ ] Restore Purchases works
- [ ] "Continue Exploring" dismisses paywall

### Content
- [ ] Learn tab shows all 7 categories
- [ ] Planets: 10 entries load
- [ ] Constellations: 88 entries load
- [ ] Deep sky: 21 objects load

### Vault
- [ ] Can save a note
- [ ] Note persists after app restart
- [ ] Empty state shows when vault is empty

### Permissions
- [ ] App works without location (fallback mode)
- [ ] App works without camera (Sky Lens shows manual mode)
- [ ] Notification permission prompt appears

### Settings
- [ ] Appearance theme toggles work
- [ ] Notification toggles work
- [ ] Sky quality selector works
- [ ] Privacy & Legal links work

### Visual
- [ ] Cinzel font loads for brand headers
- [ ] Gold accent color consistent (#D4AF37)
- [ ] Dark background (#0B0B12) on all screens
- [ ] No white flashes on screen transitions
- [ ] GlassPanel blur visible on iOS
- [ ] Tab bar blur visible

### Edge cases
- [ ] Kill app and reopen — state preserved
- [ ] Toggle airplane mode — app doesn't crash
- [ ] Rotate device — layout doesn't break (lock to portrait recommended)
- [ ] Force-close during onboarding — resumes correctly
- [ ] Background the app — no crash on return
