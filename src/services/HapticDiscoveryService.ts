// HapticDiscoveryService.ts — tiny delights when you discover objects
// A soft haptic pulse when you center on a hero object.
// Apple loves details like this.

import * as Haptics from "expo-haptics";

const HERO_OBJECTS = new Set([
  // Planets
  "jupiter", "saturn", "mars", "venus", "mercury", "moon",
  // Major stars
  "sirius", "vega", "arcturus", "betelgeuse", "rigel", "antares",
  "altair", "deneb", "polaris", "capella",
  // Deep sky heroes
  "m42", "m31", "m45", "m8", "ngc7000", "ngc6960", "ngc3372",
]);

// Track what we've already buzzed this session to avoid spam
const buzzed = new Set<string>();
let lastBuzzTime = 0;

export function onObjectCentered(objectId: string) {
  if (!HERO_OBJECTS.has(objectId.toLowerCase())) return;
  if (buzzed.has(objectId)) return;
  
  const now = Date.now();
  if (now - lastBuzzTime < 3000) return; // 3s cooldown between buzzes
  
  buzzed.add(objectId);
  lastBuzzTime = now;
  
  // Soft impact — not aggressive, just a whisper
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function onObjectTapped(objectId: string) {
  // Slightly stronger feedback on tap
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function onRareEvent() {
  // ISS flyover, shooting star, etc.
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Reset for new session
export function resetDiscoverySession() {
  buzzed.clear();
  lastBuzzTime = 0;
}
