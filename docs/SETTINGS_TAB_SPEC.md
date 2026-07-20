> ⚠️ Historical document
>
> This file is retained for historical context only. Product, pricing, navigation, entitlement, camera/AR, Watch/watchOS, and architecture details may be obsolete. Use `CLAUDE.md` and the current merged code as the active source of truth.

# AuraLunis Settings Tab Specification

## Purpose
The Settings tab is the app control center. It should not be buried inside More.

## Sections
- Subscription
- Appearance
- Notifications + Alarms
- Sky Lens calibration
- Privacy + Data
- Watch + Widgets
- Audio + Learning
- Help + About

## Important settings
- AuraLunis+ subscription management
- Theme / visual mode
- Notification master switch
- Celestial Alarms
- Tonight’s Ritual reminders
- Sky Lens calibration reminders
- Manual Sky Map fallback
- Local-first Vault
- Cloud Sync opt-in
- AI Oracle opt-in
- Permission explanations
- Apple Watch sync
- Portal Stack widgets
- Sound Bath autoplay
- Learning preferences
- Q&A / Help

## Privacy stance
Local-first by default. Cloud Sync and AI Oracle should be explicitly opt-in.

## Production notes
Settings should eventually persist using local storage or secure storage. This native test build uses screen state placeholders.


## Logo placement
The Settings page must show the AuraLunis logo prominently at the top of the page using the full logo lockup. The logo should not be hidden only in the general app header.
