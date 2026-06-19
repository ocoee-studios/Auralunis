// PremiumModeGate.tsx
// Shown inline inside OrbitalAlignmentScreen when a user on the free tier
// taps a Premium-only mode button. Displays a compact upgrade card with
// the mode name, what they get, and a CTA to open the full paywall.

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ChronauraColors, ChronauraPricing } from "@/theme/tokens";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";

interface PremiumModeGateProps {
  modeName: string;
  modeDescription: string;
  onUpgrade?: () => void;
}

const LOCK_EMOJI_ALT = "✦"; // using gold sparkle instead of emoji per style guide

export function PremiumModeGate({ modeName, modeDescription, onUpgrade }: PremiumModeGateProps) {
  const { openPaywall } = usePaywallNavigation();
  const handleUpgrade = () => { openPaywall(); onUpgrade?.(); };
  return (
    <View style={styles.container}>
      {/* Lock indicator */}
      <View style={styles.iconRow}>
        <Text style={styles.lockIcon}>◈</Text>
      </View>

      <Text style={styles.title}>{modeName}</Text>
      <Text style={styles.title2}>Premium Feature</Text>
      <Text style={styles.description}>{modeDescription}</Text>

      {/* Value prop */}
      <View style={styles.valueRow}>
        <Text style={styles.valueLine}>✦  Live Celestrak TLE data</Text>
        <Text style={styles.valueLine}>✦  Unlimited Cosmic Drift history</Text>
        <Text style={styles.valueLine}>✦  All 9 tracking modes</Text>
        <Text style={styles.valueLine}>✦  Space debris mission loop</Text>
      </View>

      {/* Pricing hint */}
      <Text style={styles.pricingHint}>
        From {ChronauraPricing.annualMonthly}/mo · {ChronauraPricing.trial} on annual
      </Text>

      {/* CTA */}
      <TouchableOpacity style={styles.ctaButton} onPress={handleUpgrade}>
        <Text style={styles.ctaText}>Unlock Premium</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Or try the free modes: Fleet, Deep Space, Golden Hour, Meteor
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: ChronauraColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ChronauraColors.borderGold,
    padding: 24,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  iconRow: {
    marginBottom: 12,
  },
  lockIcon: {
    fontSize: 32,
    color: ChronauraColors.gold,
  },
  title: {
    color: ChronauraColors.gold2,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  title2: {
    color: ChronauraColors.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 10,
  },
  description: {
    color: ChronauraColors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  valueRow: {
    alignSelf: "stretch",
    gap: 7,
    marginBottom: 18,
  },
  valueLine: {
    color: ChronauraColors.silver,
    fontSize: 12,
    fontWeight: "600",
  },
  pricingHint: {
    color: ChronauraColors.faint,
    fontSize: 11,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: ChronauraColors.gold,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  ctaText: {
    color: ChronauraColors.cosmicBlack,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  footerNote: {
    color: ChronauraColors.faint,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
  },
});
