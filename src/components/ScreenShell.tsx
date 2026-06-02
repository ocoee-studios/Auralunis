import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChronauraColors } from "@/theme/tokens";
import { LogoMark } from "@/components/LogoMark";
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
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}>
        <View style={styles.header}>
          <LogoMark size={52} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.subtitle, { color: palette.accent }]}>{subtitle}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, paddingBottom: 120 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  subtitle: {
    color: ChronauraColors.gold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "800"
  },
  title: { color: "#FFF", fontSize: 29, fontWeight: "900", letterSpacing: -1.1 }
});
