import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AuraLunisBrand } from "@/data/brand";
import { AuraLunisColors } from "@/theme/tokens";

const stardustEmblem = require("../../assets/logo/auralunis-stardust-emblem.png");

type Props = {
  size?: number;
  showWordmark?: boolean;
  showDescriptor?: boolean;
  centered?: boolean;
};

export function LogoMark({
  size = 44,
  showWordmark = false,
  showDescriptor = false,
  centered = false
}: Props) {
  return (
    <View style={[styles.row, centered && styles.centeredContainer]}>
      <Image
        source={stardustEmblem}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityLabel="AuraLunis star-dust celestial emblem"
      />
      {showWordmark ? (
        <View style={centered && styles.centeredWordmarkContainer}>
          <Text style={[styles.wordmark, centered && styles.centeredText]}>{AuraLunisBrand.wordmark}</Text>
          <Text style={[styles.tagline, centered && styles.centeredText]}>{AuraLunisBrand.tagline}</Text>
          {showDescriptor ? (
            <Text style={[styles.descriptor, centered && styles.centeredText]}>
              {AuraLunisBrand.descriptor}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  centeredContainer: { flexDirection: "column", justifyContent: "center" },
  centeredWordmarkContainer: { alignItems: "center" },
  centeredText: { textAlign: "center" },
  wordmark: {
    color: AuraLunisColors.gold2,
    fontSize: 17,
    letterSpacing: 4,
    fontWeight: "800"
  },
  tagline: {
    color: AuraLunisColors.silver,
    fontSize: 10,
    marginTop: 3,
    fontStyle: "italic"
  },
  descriptor: {
    color: AuraLunisColors.muted,
    fontSize: 8,
    letterSpacing: 1.7,
    marginTop: 5,
    textTransform: "uppercase"
  }
});
