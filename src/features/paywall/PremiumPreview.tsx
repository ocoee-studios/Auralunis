// PremiumPreview.tsx — 2-second animated preview of premium content
// When a free user taps a premium feature, show the beauty for 2 seconds,
// then fade and invite them to subscribe. "Unlock the living universe."

import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";

type Props = {
  visible: boolean;
  featureName: string;     // "Cinematic Nebulae" / "Planet Textures"
  description: string;     // "See the Orion Nebula's hydrogen clouds..."
  onDismiss: () => void;
};

export function PremiumPreview({ visible, featureName, description, onDismiss }: Props) {
  const { openPaywall } = usePaywallNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (!visible) {
      fadeAnim.setValue(0);
      contentFade.setValue(1);
      setShowCTA(false);
      return;
    }

    // Phase 1: show the preview at full beauty (2 seconds)
    fadeAnim.setValue(0);
    contentFade.setValue(1);
    setShowCTA(false);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Phase 2: after 2 seconds, fade the preview and show CTA
    const timer = setTimeout(() => {
      setShowCTA(true);
      Animated.timing(contentFade, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {showCTA && (
        <View style={styles.ctaContainer}>
          <Text style={styles.sparkle}>✦</Text>
          <Text style={styles.headline}>Unlock the living universe</Text>
          <Text style={styles.featureName}>{featureName}</Text>
          <Text style={styles.description}>{description}</Text>

          <Pressable
            style={styles.upgradeButton}
            onPress={() => {
              onDismiss();
              openPaywall();
            }}
          >
            <Text style={styles.upgradeText}>See Premium</Text>
          </Pressable>

          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>Not now</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(3,8,22,0.4)",
  },
  ctaContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  sparkle: {
    fontSize: 32,
    color: "#D9A84E",
    marginBottom: 8,
  },
  headline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF6D6",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 6,
  },
  featureName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D9A84E",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#C0C6D4",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: "#D9A84E",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    marginBottom: 12,
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#030816",
    letterSpacing: 0.5,
  },
  dismissButton: {
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 14,
    color: "#747D90",
  },
});
