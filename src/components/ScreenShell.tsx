import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChronauraColors, ChronauraTypography } from "@/theme/tokens";
import { LogoMark } from "@/components/LogoMark";
import { StarDust } from "@/components/StarDust";
import { useChronauraSettings } from "@/state/ChronauraSettingsContext";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function ScreenShell({ title, subtitle, children }: Props) {
  const { palette } = useChronauraSettings();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={palette.gradient} style={styles.root}>
      <StarDust count={12} color={ChronauraColors.gold} opacity={0.18} />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        {/* Brand header matching mockup: [Logo] CHRONAURA */}
        <View style={styles.brandBar}>
          <LogoMark size={32} />
          <Text style={styles.brandName}>CHRONAURA</Text>
          <View style={{ flex: 1 }} />
        </View>
        {/* Screen title */}
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: palette.accent }]}>{subtitle}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, paddingBottom: 120 },
  brandBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12
  },
  brandName: {
    fontFamily: ChronauraTypography.display.fontFamily,
    fontSize: 18,
    letterSpacing: 3,
    color: ChronauraColors.gold
  },
  header: { marginBottom: 16 },
  subtitle: {
    color: ChronauraColors.gold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "800"
  },
  title: {
    color: "#FFF",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -1.1,
    marginTop: 2
  }
});
