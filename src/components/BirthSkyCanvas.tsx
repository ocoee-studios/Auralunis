// BirthSkyCanvas.tsx — a REAL, frozen snapshot of the sky at a birth moment. Computes
// the full sky (bright + dome stars, constellation lines, planets, Milky Way, deep-sky,
// moon) for the birth date/time/location via useSkyData(timeOverride), then renders it
// through the same SkyLensCanvas used by Sky Lens — but static: a fixed look-up pointing,
// a wide FOV, Planetarium visuals, no AR/camera, no gestures, no labels. The result is a
// circular "sacred sky" window of exactly that night. Replaces the simple planisphere.
import React, { useMemo } from "react";
import { View } from "react-native";
import { useSkyData } from "@/features/sky-lens/hooks/useSkyProjection";
import { SkyLensCanvas } from "@/features/sky-lens/SkyLensCanvas";
import { getVisualGate } from "@/features/sky-lens/PremiumVisualGating";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { LayerKey } from "@/features/sky-lens/SkyLensLayerCatalog";

// A clean "what was overhead" set — real stars, constellation lines, and planets only.
// Deliberately NO milkyway/deepsky: the painterly Milky Way band reads as an illustration,
// and the point of this view is the true star field at the birth moment, not a poster.
// No grid/cardinals either (cinematic mode already hides labels + overlays).
const BIRTH_LAYERS = new Set<LayerKey>(["stars", "constellations", "planets"]);
const noop = () => {};

// Look up toward the southern sky at a high altitude with a wide FOV, so the circular
// window fills with the overhead dome.
const BIRTH_POINTING = { azimuthDegrees: 180, altitudeDegrees: 72, rollDegrees: 0 };
const BIRTH_FOV = { horizontalDegrees: 115, verticalDegrees: 115 };

export function BirthSkyCanvas({
  birthDate,
  location,
  size = 300,
}: {
  birthDate: Date;
  location: ObserverLocation;
  size?: number;
}) {
  // Freeze the whole sky to the birth instant (timeOverride => no live ticking).
  const sky = useSkyData(location, 60000, birthDate);
  const gate = useMemo(() => getVisualGate(true), []);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: "#03060F",
        borderWidth: 1,
        borderColor: "rgba(217,168,78,0.42)",
      }}
    >
      <SkyLensCanvas
        box={{ width: size, height: size }}
        pointing={BIRTH_POINTING}
        sky={sky}
        fov={BIRTH_FOV}
        activeLayers={BIRTH_LAYERS}
        nightMode={false}
        milkyWayBoost={1.5}
        isPremium
        focus={null}
        showcase={null}
        parallax={{ x: 0, y: 0 }}
        satellites={[]}
        cinematic
        gate={gate}
        photographicCore={false}
        fullSphere={false}
        onSelect={noop}
      />
    </View>
  );
}
