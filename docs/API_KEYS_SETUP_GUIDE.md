# AuraLunis — API Keys Setup Guide

## Required Keys

### 1. RevenueCat (subscriptions)
1. Create account at https://app.revenuecat.com
2. Create a new project: "AuraLunis"
3. Add an "Apple App Store" app with bundle ID: `com.ocoee.auralunis`
4. Go to API Keys → copy the **Public SDK Key** (starts with `appl_`)
5. In `app.json`, set:
   ```json
   "extra": {
     "revenueCatApiKey": "appl_your_key_here"
   }
   ```
6. In App Store Connect → In-App Purchases, create:
   - `com.ocoee.auralunis.premium.monthly` — $6.99/month auto-renewable
   - `com.ocoee.auralunis.premium.annual` — $39.99/year auto-renewable
   - Both with 7-day free trial
7. In RevenueCat → Products, import both products
8. Create an Entitlement: `auralunis_premium`
9. Create an Offering: `default` with both packages

### 2. OpenWeatherMap (weather for Tonight Score)
1. Create account at https://openweathermap.org
2. Go to API Keys → generate a key
3. In `app.json`, set:
   ```json
   "extra": {
     "openWeatherMapApiKey": "your_key_here"
   }
   ```
4. The free tier (1,000 calls/day) is sufficient for launch

### 3. Anthropic / Claude API (AI Sky Companion — optional)
1. Create account at https://console.anthropic.com
2. Go to API Keys → create a key
3. Store securely — this key should NOT be in app.json
4. Options for production:
   a. User provides their own key in Settings (simplest)
   b. Proxy through your own backend (most secure)
   c. Include in app bundle (least secure, not recommended)
5. The AI Sky Companion uses claude-sonnet-4-20250514, ~$0.003 per query

## Where keys are used
- RevenueCat: `src/services/RevenueCatService.ts` → `configureRevenueCat()`
- OpenWeatherMap: `src/services/WeatherService.ts` → `fetchCurrentWeather()`
- Claude API: `src/services/AISkyCompanionService.ts` → `askSkyCompanion()`

## Testing without keys
The app runs without API keys:
- Tonight Score falls back to moon-phase-only calculation
- Subscriptions show "not configured" alert (sandbox testing still works)
- AI Companion shows "API key required" message
- All other features (ephemeris, constellations, vault, etc.) work fully offline
