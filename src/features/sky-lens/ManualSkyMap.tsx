import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";

type Props = {
  onClose: () => void;
};

export function ManualSkyMap({ onClose }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.tag}>MANUAL SKY MAP</Text>
      <Text style={styles.title}>Explore without camera access</Text>
      <Text style={styles.copy}>
        Browse a privacy-safe sky map fallback. Production will connect this map
        to location, time, ephemeris calculations, Find Mode, and object cards.
      </Text>

      <View style={styles.map}>
        <View style={[styles.star, styles.s1]} />
        <View style={[styles.star, styles.s2]} />
        <View style={[styles.star, styles.s3]} />
        <View style={[styles.star, styles.s4]} />
        <View style={[styles.star, styles.s5]} />
        <View style={styles.milkyWay} />
        <Text style={styles.orion}>ORION</Text>
        <Text style={styles.milkyWayText}>MILKY WAY BAND</Text>
        <Text style={styles.moon}>☾</Text>
      </View>

      <Pressable style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>Close Manual Map</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 28,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "rgba(4,8,18,0.92)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.22)"
  },
  tag: { color: AuraLunisColors.gold2, fontSize: 10, letterSpacing: 3, fontWeight: "900" },
  title: { color: "#FFF", fontSize: 23, fontWeight: "900", marginTop: 8 },
  copy: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 19, marginTop: 6 },
  map: {
    height: 260,
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#050A16"
  },
  milkyWay: {
    position: "absolute",
    left: -40,
    right: -40,
    top: 112,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(246,220,145,0.14)",
    transform: [{ rotate: "-11deg" }]
  },
  star: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF7D0",
    shadowColor: AuraLunisColors.gold2,
    shadowOpacity: 0.9,
    shadowRadius: 8
  },
  s1: { left: 46, top: 54 },
  s2: { left: 102, top: 88 },
  s3: { left: 152, top: 121 },
  s4: { right: 86, top: 70 },
  s5: { right: 54, bottom: 48 },
  orion: { position: "absolute", left: 110, top: 140, color: AuraLunisColors.gold2, fontSize: 11, letterSpacing: 2 },
  milkyWayText: { position: "absolute", right: 24, bottom: 24, color: AuraLunisColors.silver, fontSize: 10, letterSpacing: 1.6 },
  moon: { position: "absolute", right: 24, top: 24, color: AuraLunisColors.gold2, fontSize: 34 },
  button: {
    marginTop: 14,
    backgroundColor: "rgba(217,168,78,0.13)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.26)",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center"
  },
  buttonText: { color: "#FFF", fontWeight: "800" }
});
