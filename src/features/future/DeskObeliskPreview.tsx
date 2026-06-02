import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LogoMark } from "@/components/LogoMark";
import { ChronauraColors } from "@/theme/tokens";

export function DeskObeliskPreview() {
  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>FUTURE WIDGETKIT · STANDBY</Text>
      <Text style={styles.title}>Desk Obelisk</Text>
      <Text style={styles.copy}>
        A StandBy-ready systemSmall widget direction for a charging iPhone in
        landscape. The real WidgetKit extension lives in the native handoff.
      </Text>

      <View style={styles.stage}>
        <LogoMark size={62} />
        <View style={{ flex: 1 }}>
          <Text style={styles.clock}>10:42</Text>
          <Text style={styles.meta}>RADIAN VECTOR · 0.00249 ▲</Text>
          <Text style={styles.meta}>☾ 78% · TONIGHT SCORE 91</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  eyebrow: {
    color: ChronauraColors.gold2,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "900"
  },
  title: { color: "#FFF", fontSize: 21, fontWeight: "900", marginTop: 7 },
  copy: {
    color: ChronauraColors.silver,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  },
  stage: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#050711",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.20)"
  },
  clock: { color: "#FFF", fontSize: 32, fontWeight: "900" },
  meta: {
    color: ChronauraColors.gold2,
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 4
  }
});
