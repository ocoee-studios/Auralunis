# AuraLunis Liquid Glass Implementation Spec

## Design principle
Apply Liquid Glass **selectively** — the central astrolabe, gold typography,
celestial photography, and dark star-field background stay crisp and luxurious.
Glass makes surfaces float, not everything transparent.

## Where to apply Liquid Glass

### Navigation
- **Bottom tab bar** — glass background with gold active indicator
- **Floating controls** — Sky Lens buttons, Find Mode pill

### Cards & Panels
- **Tonight Score card** (Home) — GlassPanel accent
- **Daily Alignment card** (Home) — GlassPanel
- **Settings section cards** — GlassPanel
- **Membership & Prestige cards** — GlassPanel accent
- **Paywall panel** — GlassPanel with elevated blur

### Modals
- **Paywall modal** — full glass overlay
- **Toast confirmation** — glass card

## Where NOT to apply
- Central astrolabe illustration — stays crisp, no blur
- Gold typography — stays sharp
- Celestial photography (Learn cards) — no blur overlay
- Star-field background — stays clean
- Logo — never blurred

## Implementation stack

### iOS (React Native)
```
expo-blur BlurView    → real iOS system blur (primary)
Solid fallback        → reduced transparency / older iOS
```

### Accessibility
- Respects `UIAccessibilityIsReduceTransparencyEnabled`
- Falls back to solid `rgba(18,26,44,0.92)` when transparency disabled

## GlassPanel component API
```tsx
<GlassPanel>              // default glass
<GlassPanel accent>       // gold border + glass
<GlassPanel intensity={60}> // stronger blur
```

## Current GlassPanel locations
- HomeScreen: Tonight Score (accent), Cosmic Notes
- SkyScreen: Tonight's Sky (accent), Deep Sky
- VaultScreen: entries and premium gate
- SettingsScreen: Membership card (accent)
