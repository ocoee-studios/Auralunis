import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView } from "expo-camera";

type LayoutEvent = { nativeEvent: { layout: { width: number; height: number } } };
import { AuraLunisColors } from "@/theme/tokens";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { useDevicePointing } from "@/features/sky-lens/ar/useDevicePointing";
import { DEFAULT_FOV, projectTarget } from "@/features/sky-lens/ar/SkyLensProjection";

type Props = { onClose: () => void };

function bodyColor(id: string) {
  if (id === "moon") return AuraLunisColors.silver;
  if (id === "sun") return AuraLunisColors.gold;
  return AuraLunisColors.gold2;
}

function directionArrow(bearingDegrees: number) {
  // bearing: 0 = right, 90 = down, 180 = left, 270 = up (screen coords)
  const dirs = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"];
  return dirs[Math.round(bearingDegrees / 45) % 8];
}

export function SkyLensPlaceholder({ onClose }: Props) {
  const { location } = useObserverLocation();
  const { pointing, available } = useDevicePointing();
  const sky = useMemo(() => computeTonightSky(location), [location]);
  const [box, setBox] = useState({ width: 320, height: 360 });

  function onLayout(event: LayoutEvent) {
    const { width, height } = event.nativeEvent.layout;
    setBox({ width, height });
  }

  const projected = sky.visibleBodies.map((body) => ({
    body,
    p: projectTarget(pointing, body.azimuthDegrees, body.altitudeDegrees, DEFAULT_FOV, box)
  }));

  const onScreen = projected.filter((entry) => entry.p.onScreen);
  const offScreen = projected
    .filter((entry) => !entry.p.onScreen)
    .sort((a, b) => (a.body.magnitude ?? 99) - (b.body.magnitude ?? 99));
  const guide = offScreen[0];

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />

      <View style={styles.overlay} pointerEvents="box-none">
        {onScreen.map(({ body, p }) => (
          <View key={body.id} style={[styles.marker, { left: p.x - 5, top: p.y - 5 }]} pointerEvents="none">
            <View style={[styles.dot, { backgroundColor: bodyColor(body.id) }]} />
            <Text style={styles.markerLabel}>{body.name}</Text>
          </View>
        ))}

        <View style={styles.hud} pointerEvents="none">
          <Text style={styles.hudText}>
            {available
              ? `Heading ${Math.round(pointing.azimuthDegrees)}° · Alt ${Math.round(pointing.altitudeDegrees)}°`
              : "Calibrating compass…"}
          </Text>
          <Text style={styles.hudSub}>
            {onScreen.length} of {sky.visibleBodies.length} visible bodies in view
          </Text>
        </View>

        {guide ? (
          <View style={styles.guide} pointerEvents="none">
            <Text style={styles.guideText}>
              {directionArrow(guide.p.bearingDegrees)}  {guide.p.behind ? "Turn around for" : "Pan toward"} {guide.body.name}
            </Text>
          </View>
        ) : null}

        <Pressable style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close Lens</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 360, borderRadius: 28, overflow: "hidden", marginBottom: 14, backgroundColor: "#000" },
  overlay: { flex: 1, padding: 16 },
  marker: { position: "absolute", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: "rgba(0,0,0,0.5)" },
  markerLabel: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 3
  },
  hud: {
    position: "absolute",
    top: 14,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  hudText: { color: AuraLunisColors.gold2, fontSize: 13, fontWeight: "900" },
  hudSub: { color: "#E7ECF8", fontSize: 11, marginTop: 2 },
  guide: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    backgroundColor: "rgba(217,168,78,0.18)",
    borderColor: "rgba(217,168,78,0.4)",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  guideText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  button: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    backgroundColor: "rgba(217,168,78,0.2)",
    borderColor: "rgba(217,168,78,0.34)",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 16
  },
  buttonText: { color: "#FFF", fontWeight: "900" }
});
