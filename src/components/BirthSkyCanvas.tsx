// BirthSkyCanvas.tsx — the REAL Sky Lens renderer, frozen to a birth moment. This mounts
// the exact same <SkyLensCanvas> component Sky Lens / Planetarium use, with the IDENTICAL
// Planetarium layer set + visuals — the ONLY difference is the time: useSkyData freezes the
// whole ephemeris (stars, planets, Milky Way, constellations, deep-sky) to birthDate via its
// time-override (the same mechanism the in-app time-scrub uses). No separate renderer, no
// image shortcut — what you see is Planetarium mode at the instant you were born.
import React, { useMemo } from "react";
import { View } from "react-native";
import { useSkyData } from "@/features/sky-lens/hooks/useSkyProjection";
import { SkyLensCanvas } from "@/features/sky-lens/SkyLensCanvas";
import { getVisualGate } from "@/features/sky-lens/PremiumVisualGating";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { LayerKey } from "@/features/sky-lens/SkyLensLayerCatalog";

// The full Planetarium sky — stars (dome + bright), constellation lines, planets, the
// Milky Way, and deep-sky. Exactly what Sky Lens shows tonight; only the time differs.
const BIRTH_LAYERS = new Set<LayerKey>(["stars", "constellations", "planets", "milkyway", "deepsky"]);
const noop = () => {};

// Look up toward the overhead sky so the Milky Way reads as a band across a rich field
// (not a core-filling close-up), with a wide planetarium FOV.
const BIRTH_POINTING = { azimuthDegrees: 180, altitudeDegrees: 74, rollDegrees: 0 };
const BIRTH_FOV = { horizontalDegrees: 105, verticalDegrees: 105 };

export function BirthSkyCanvas({
  birthDate,
  location,
  size = 320,
}: {
  birthDate: Date;
  location: ObserverLocation;
  size?: number;
}) {
  // Freeze the WHOLE sky to the birth instant (timeOverride → no live ticking). This is
  // the time override the requirement asks for — applied where the ephemeris is computed.
  const sky = useSkyData(location, 60000, birthDate);
  const gate = useMemo(() => getVisualGate(true), []); // premium visuals, same as Planetarium

  return (
    <View style={{ width: size, height: size, borderRadius: 20, overflow: "hidden", backgroundColor: "#03060F", borderWidth: 1, borderColor: "rgba(217,168,78,0.3)" }}>
      <SkyLensCanvas
        box={{ width: size, height: size }}
        pointing={BIRTH_POINTING}
        sky={sky}
        fov={BIRTH_FOV}
        activeLayers={BIRTH_LAYERS}
        nightMode={false}
        milkyWayBoost={1.6}
        isPremium
        focus={null}
        showcase={null}
        parallax={{ x: 0, y: 0 }}
        satellites={[]}
        cinematic
        gate={gate}
        fullSphere={false}
        onSelect={noop}
      />
    </View>
  );
}
