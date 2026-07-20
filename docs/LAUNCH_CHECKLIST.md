# AuraLunis — Launch Checklist

## Must Ship (v1.0 blockers)

- [ ] **Sky Lens Phase 1** — Rendered sky (no camera) + Stars + Constellations + Planets + Grid + Layer bar + Info cards + Night Mode
- [ ] **SDK 54 upgrade** — ✅ Done (Claude Code)
- [ ] **RevenueCat live products** — Create in RC dashboard matching MonetizationCatalog.ts
- [ ] **Apple Developer Account** — Activate and enroll
- [ ] **Privacy Policy hosted** — `ocoeestudios.com/auralunis/privacy`
- [ ] **Terms of Use hosted** — `ocoeestudios.com/auralunis/terms`
- [ ] **EAS build** — `eas build --platform ios --profile preview`
- [ ] **Real device testing** — Full QA on physical iPhone
- [ ] **TestFlight** — Internal testing pass, no crashes
- [ ] **App Store Connect** — Fill nutrition label, screenshots, description
- [ ] **App Review submission**

## Can Ship Later (v1.1+)

- [ ] Sky Lens Phase 2 (Satellites, Deep Sky, Milky Way, Cultural Stories, Find Mode)
- [ ] Sky Lens Phase 3 (Weather layers, Photo assist, Time scrub, Comparison)
- [ ] Watch App (all 3 PRs)
- [ ] HealthKit integration (after Watch code exists)
- [ ] auralunis.com marketing website
- [ ] Audio files (6 per assets/audio/README.md)
- [ ] Space-Track credentials for debris/re-entry

## Not Shipping (killed or descoped)

- ~~Astrology / oracle features~~ — not an astrology app
- ~~Sound bath / meditation audio~~ — not a wellness app
- ~~Vision Pro~~ — no market yet
- ~~Social network / feed~~ — privacy-first, no social
- ~~AI Sky Companion~~ — descoped from v1
- ~~Cosmic Compatibility~~ — descoped from v1

## Source of Truth

| Decision | Document | Status |
|----------|----------|--------|
| Pricing | `MonetizationCatalog.ts` | LOCKED |
| Colors | `src/theme/tokens.ts` | LOCKED |
| Navigation | Expo Router file structure | LOCKED |
| Features (built) | `GEMINI_MASTER_HANDOFF.md` | Reference |
| Sky Lens spec | `src/features/sky-lens/SKY_LENS_SPEC.md` | Active build |
| Watch spec | `src/features/watch/WATCH_APP_SPEC.md` | Phase 2 |
| Legal | `public/PRIVACY.md` + `public/TERMS.md` | Done |
| Nutrition label | `docs/APP_STORE_NUTRITION_LABEL.md` | Done |
