import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import {
  projectTarget,
  type CameraFov,
  type CameraPointing,
  type OverlayBox,
} from "../ar/SkyLensProjection";

const NEBULA_IMAGES: Partial<Record<string, number>> = {
  m42: require("../../../../assets/nebula-baked/orion-nebula.png"),
  m8: require("../../../../assets/nebula-baked/lagoon-nebula.png"),
  m16: require("../../../../assets/nebula-baked/eagle-nebula.png"),
  ngc3372: require("../../../../assets/nebula-baked/carina-nebula.png"),
  ngc7000: require("../../../../assets/nebula-baked/north-america-nebula.png"),
  m17: require("../../../../assets/nebula-baked/swan-nebula.png"),
  m20: require("../../../../assets/nebula-baked/trifid-nebula.png"),
  ngc2237: require("../../../../assets/nebula-baked/rosette-nebula.png"),
  m27: require("../../../../assets/nebula-baked/dumbbell-nebula.png"),
  m57: require("../../../../assets/nebula-baked/ring-nebula.png"),
  m1: require("../../../../assets/nebula-baked/crab-nebula.png"),
  ngc6960: require("../../../../assets/nebula-baked/veil-nebula.png"),
};

type Props = {
  nebulae: HorizontalNebula[];
  pointing: CameraPointing;
  fov: CameraFov;
  box: OverlayBox;
  visible: boolean;
  fullSphere?: boolean;
};

export function NebulaImageLayer({
  nebulae,
  pointing,
  fov,
  box,
  visible,
  fullSphere = false,
}: Props) {
  const projected = useMemo(() => {
    if (!visible) return [];

    return nebulae.flatMap((nebula) => {
      const source = NEBULA_IMAGES[nebula.id];

      if (!source) return [];
      if (!fullSphere && !nebula.aboveHorizon) return [];

      const point = projectTarget(
        pointing,
        nebula.azimuthDegrees,
        nebula.altitudeDegrees,
        fov,
        box
      );

      if (!point.onScreen) return [];

      const size = Math.max(72, Math.min(190, nebula.radius * 5.4));

      return [
        {
          id: nebula.id,
          source,
          x: point.x,
          y: point.y,
          size,
        },
      ];
    });
  }, [box, fov, fullSphere, nebulae, pointing, visible]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {projected.map((nebula) => (
        <Image
          key={nebula.id}
          source={nebula.source}
          resizeMode="contain"
          style={{
            position: "absolute",
            left: nebula.x - nebula.size / 2,
            top: nebula.y - nebula.size / 2,
            width: nebula.size,
            height: nebula.size,
            opacity: 0.88,
          }}
        />
      ))}
    </View>
  );
}
