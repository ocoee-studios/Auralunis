import React from "react";
import { Image, StyleSheet, View } from "react-native";

type Props = {
  visible: boolean;
};

export function SolidSkyBackgroundLayer({ visible }: Props) {
  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={require("../../../assets/sky-backgrounds/sky-background-cool-violet.png")}
        resizeMode="cover"
        style={styles.image}
      />
      <View style={styles.darkMask} />
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
    opacity: 0.55,
    transform: [
      { translateX: 3 },
      { translateY: 23 },
      { scale: 1 },
      { rotate: "6deg" },
    ],
  },
  darkMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.20)",
  },
});
