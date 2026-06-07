// Maps every interactive element to its haptic pattern.
// Import and use instead of calling HapticService directly.
import { tapLight, tapMedium, tapSelection, tapSuccess, tapWarning } from "@/services/HapticService";

export const Haptics = {
  // Navigation
  tabSwitch: tapSelection,
  backButton: tapLight,
  screenTransition: tapLight,

  // Cards
  cardPress: tapLight,
  cardRelease: tapLight,

  // Buttons
  primaryButton: tapMedium,
  secondaryButton: tapLight,
  destructiveButton: tapWarning,

  // Achievements
  badgeEarned: tapSuccess,
  stampCollected: tapSuccess,
  challengeComplete: tapSuccess,
  streakMilestone: tapSuccess,

  // Data
  scoreTick: tapLight,
  refreshComplete: tapSuccess,
  saveToVault: tapSuccess,

  // Watch
  crownHourMark: tapLight,
  crownReset: tapMedium,

  // Paywall
  planToggle: tapSelection,
  purchaseTap: tapMedium,
  purchaseComplete: tapSuccess
} as const;
