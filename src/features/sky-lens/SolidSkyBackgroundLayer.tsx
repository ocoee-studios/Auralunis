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
        colors={["#020617", "#07152F", "#111332", "#07172D", "#020711"]}
        locations={[0, 0.28, 0.52, 0.76, 1]}
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
        colors={[
          "rgba(52,124,255,0.04)",
          "rgba(104,89,255,0.08)",
          "rgba(229,102,184,0.07)",
          "rgba(35,190,220,0.04)",
        ]}
        locations={[0, 0.34, 0.68, 1]}
        start={{ x: 0.05, y: 0.1 }}
        end={{ x: 0.95, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.16)", "rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    left: "-18%",
    right: "-18%",
    top: "-18%",
    bottom: "-18%",
    width: "136%",
    height: "136%",
    opacity: 0.68,
    transform: [
      { translateX: 3 },
      { translateY: 20 },
      { scale: 1.02 },
      { rotate: "6deg" },
    ],
  },
});