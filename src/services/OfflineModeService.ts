// Offline mode — what works without internet and what doesn't.
// Ephemeris, vault, stats, and most content work fully offline.

export interface OfflineStatus {
  feature: string;
  offlineCapable: boolean;
  note: string;
}

export const offlineCapabilities: OfflineStatus[] = [
  { feature: "Ephemeris (planet positions)", offlineCapable: true, note: "Computed on-device using astronomy-engine. No internet needed." },
  { feature: "Tonight Score (moon-based)", offlineCapable: true, note: "Moon illumination computed locally. Weather component unavailable offline." },
  { feature: "Tonight Score (weather-enhanced)", offlineCapable: false, note: "Requires OpenWeatherMap API. Falls back to moon-only score." },
  { feature: "Cosmic Vault", offlineCapable: true, note: "Fully local. Encrypted on-device." },
  { feature: "Learn (all catalogs)", offlineCapable: true, note: "All 16 data catalogs are bundled in the app." },
  { feature: "Constellation Challenge", offlineCapable: true, note: "All challenge data is local." },
  { feature: "Birth Sky Profile", offlineCapable: true, note: "Computed from ephemeris. No network needed." },
  { feature: "Badges & Streaks", offlineCapable: true, note: "AsyncStorage, fully local." },
  { feature: "Sky Passport", offlineCapable: true, note: "Stamps stored locally." },
  { feature: "Moon Calendar", offlineCapable: true, note: "Computed from ephemeris." },
  { feature: "AI Sky Companion", offlineCapable: false, note: "Requires internet + Anthropic API key." },
  { feature: "Weather data", offlineCapable: false, note: "Requires OpenWeatherMap API." },
  { feature: "Satellite TLE updates", offlineCapable: false, note: "Uses cached TLEs. Fresh data needs internet." },
  { feature: "Subscription verification", offlineCapable: true, note: "RevenueCat caches entitlements locally. Works offline after first sync." },
  { feature: "Night Vision Mode", offlineCapable: true, note: "Local palette swap." },
  { feature: "Celestial Meditation", offlineCapable: true, note: "Computed from ephemeris." },
  { feature: "Share Cards", offlineCapable: true, note: "Generated on-device. Sharing requires connectivity." },
  { feature: "Notifications", offlineCapable: true, note: "Scheduled locally from ephemeris data." }
];

export function getOfflineFeatures(): OfflineStatus[] {
  return offlineCapabilities.filter(f => f.offlineCapable);
}

export function getOnlineOnlyFeatures(): OfflineStatus[] {
  return offlineCapabilities.filter(f => !f.offlineCapable);
}
