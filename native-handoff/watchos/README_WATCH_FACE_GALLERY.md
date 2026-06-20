# AuraLunis Watch Face Gallery — Native Handoff

## Product boundary
AuraLunis can provide:
- Full-screen AuraLunis layouts while the AuraLunis watch app is open
- Apple Watch complications for supported Apple system-face slots
- Curated shareable Apple Watch face templates built around AuraLunis complications
- App-intent shortcuts for Sky Lens, Tonight’s Ritual, and Astral Sound Bath

AuraLunis cannot replace Apple’s entire system watch-face engine with unrestricted third-party system faces.

## Watch-app layouts
- Living Astrolabe
- Moon Keeper
- Tonight’s Sky
- Deep Sky Portal
- Daily Alignment
- Minimal AuraLunis
- Sovereign Sigil — future prestige module

## Visual themes
- Midnight Gold
- Moon Silver
- Deep Space
- Soft Moon
- Liquid Obsidian — future prestige theme

## Complication modules
- Moon Phase
- Tonight Score
- Moonrise Countdown
- Next Celestial Event
- Visible Planet
- Daily Alignment
- Tonight’s Ritual shortcut
- Sky Lens shortcut
- Astral Sound Bath shortcut
- Mini AuraLunis star-dust logo

## Production implementation direction
Use a watchOS target with WidgetKit complications and App Intents. Map modules only into slot families they support. Provide one signature curated setup:
- Living Astrolabe
- Midnight Gold
- Moon Phase
- Tonight Score
- Next Event
- Sky Lens Shortcut
