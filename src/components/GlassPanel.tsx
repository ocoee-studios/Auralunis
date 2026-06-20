// Liquid Glass panel component. Uses expo-blur BlurView on iOS for real
// system-level blur, with a fallback semi-transparent View on Android/web.
// Designed to match Apple's Liquid Glass aesthetic: high blur, subtle gold
// border, inner light reflection, and depth shadow.

import React, { type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";

// expo-blur typed accessor (same resolution pattern as other Expo packages).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStyle = any;
let BlurViewComponent: React.ComponentType<{
  intensity?: number;
  tint?: string;
  style?: AnyStyle;
  children?: ReactNode;
}> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ExpoBlur = require("expo-blur") as { BlurView: typeof BlurViewComponent };
  BlurViewComponent = ExpoBlur.BlurView;
} catch {
  // expo-blur not available — will use fallback.
}

type GlassPanelProps = {
  children: ReactNode;
  /** Blur intensity 0-100 (iOS only). Default 40. */
  intensity?: number;
  /** "default" | "light" | "dark". Default "dark" for Midnight Gold theme. */
  tint?: "default" | "light" | "dark";
  /** Optional additional styles. */
  style?: AnyStyle;
  /** Use a gold-accented border instead of the default subtle border. */
  accent?: boolean;
};

export function GlassPanel({
  children,
  intensity = 40,
  tint = "dark",
  style,
  accent = false
}: GlassPanelProps) {
  const borderStyle = accent ? styles.accentBorder : styles.defaultBorder;

  // Real blur on iOS when expo-blur is available.
  if (Platform.OS === "ios" && BlurViewComponent) {
    return (
      <View style={[styles.outer, borderStyle, style]} accessible accessibilityRole="summary">
        <BlurViewComponent
          intensity={intensity}
          tint={tint}
          style={styles.blur}
        >
          <View style={styles.innerGlow} />
          {children}
        </BlurViewComponent>
      </View>
    );
  }

  // Fallback: semi-transparent panel with no native blur.
  return (
    <View style={[styles.outer, styles.fallback, borderStyle, style]}>
      <View style={styles.innerGlow} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 12,
    // Depth shadow for the glass floating effect.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 8
  },
  blur: {
    padding: 14,
    overflow: "hidden"
  },
  fallback: {
    padding: 14,
    backgroundColor: "rgba(15,20,33,0.74)"
  },
  defaultBorder: {
    borderWidth: 1,
    borderColor: "rgba(199,166,106,0.28)"
  },
  accentBorder: {
    borderWidth: 1,
    borderColor: AuraLunisColors.gold
  },
  // Subtle light reflection along the top edge — mimics Liquid Glass refraction.
  innerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)"
  }
});
