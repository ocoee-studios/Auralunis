# Chronaura 7-Day Trial Launch Popup

## Purpose
Show a polished Chronaura+ offer when the user first opens the app.

## Behavior
- Show on first open.
- Do not force it on every launch.
- Provide three actions:
  - Start 7-Day Free Trial
  - Continue Exploring
  - Restore Purchases
- Save a local `seen` flag after Start Trial or Continue Exploring.
- Use softer reminders later from premium feature gates or Settings.

## Pricing
- $2.99/month Horizon+ or $5.99/month Aura Pro
- $19.99/year Horizon+ or $49.99/year Aura Pro
- 7-day free trial
- $299/year Sovereign waitlist

## Production Handoff
Real purchases should use StoreKit / RevenueCat.
