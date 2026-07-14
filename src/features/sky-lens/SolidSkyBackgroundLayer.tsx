import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  visible: boolean;
};

export function SolidSkyBackgroundLayer({ visible }: Props) {
  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#020617", "#07152F", "#15113B", "#071B35", "#020711"]}
        locations={[0, 0.26, 0.5, 0.76, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Image
        source={require("../../../assets/sky-backgrounds/sky-background-cool-violet.png")}
        resizeMode="cover"
        style={styles.image}
      />

      <LinearGradient
        colors={["rgba(40,190,255,0)", "rgba(75,185,255,0.18)", "rgba(138,91,255,0.10)", "rgba(40,190,255,0)"]}
        locations={[0, 0.38, 0.67, 1]}
        start={{ x: 0, y: 0.7 }}
        end={{ x: 1, y: 0.3 }}
        style={[styles.colorRiver, styles.cyanRiver]}
      />

      <LinearGradient
        colors={["rgba(255,92,169,0)", "rgba(255,105,180,0.13)", "rgba(154,105,255,0.16)", "rgba(255,92,169,0)"]}
        locations={[0, 0.34, 0.66, 1]}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 0.9, y: 0.8 }}
        style={[styles.colorRiver, styles.roseRiver]}
      />

      <View style={styles.cobaltPool} />
      <View style={styles.rosePool} />
      <View style={styles.violetPool} />

      <LinearGradient
        colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0)", "rgba(0,0,0,0.16)"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    left: "-20%",
    right: "-20%",
    top: "-16%",
    bottom: "-16%",
    width: "140%",
    height: "132%",
    opacity: 0.72,
    transform: [
      { translateX: 4 },
      { translateY: 16 },
      { scale: 1.03 },
      { rotate: "5deg" },
    ],
  },
  colorRiver: {
    position: "absolute",
    width: "150%",
    height: "34%",
    left: "-25%",
    borderRadius: 240,
  },
  cyanRiver: {
    top: "20%",
    transform: [{ rotate: "-20deg" }],
  },
  roseRiver: {
    top: "48%",
    transform: [{ rotate: "17deg" }],
  },
  cobaltPool: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: "8%",
    right: -150,
    backgroundColor: "rgba(35,115,255,0.10)",
  },
  rosePool: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: "42%",
    left: -170,
    backgroundColor: "rgba(255,78,154,0.09)",
  },
  violetPool: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    bottom: -190,
    right: -120,
    backgroundColor: "rgba(139,92,246,0.10)",
  },
});