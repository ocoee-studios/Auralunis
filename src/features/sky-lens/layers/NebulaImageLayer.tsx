import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, RadialGradient, Stop } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import {
  projectTarget,
  type CameraFov,
  type CameraPointing,
  type OverlayBox,
} from "../ar/SkyLensProjection";

type Props = {
  nebulae: HorizontalNebula[];
  pointing: CameraPointing;
  fov: CameraFov;
  box: OverlayBox;
  visible: boolean;
  fullSphere?: boolean;
};

type NebulaArt = {
  warm: string;
  cool: string;
  core: string;
  scale: number;
  rotation: number;
  lobes: ReadonlyArray<{ x: number; y: number; rx: number; ry: number; tone: "warm" | "cool"; opacity: number }>;
  lanes?: ReadonlyArray<{ x: number; y: number; rx: number; ry: number; rotation: number; opacity: number }>;
};

const ART: Record<string, NebulaArt> = {
  m42: {
    warm: "#F58AB0",
    cool: "#79A7FF",
    core: "#FFF1D6",
    scale: 1.05,
    rotation: -18,
    lobes: [
      { x: 0, y: 0.12, rx: 1.05, ry: 0.72, tone: "warm", opacity: 0.78 },
      { x: -0.5, y: -0.35, rx: 0.74, ry: 0.52, tone: "cool", opacity: 0.6 },
      { x: 0.48, y: 0.38, rx: 0.76, ry: 0.5, tone: "warm", opacity: 0.54 },
    ],
    lanes: [{ x: 0.18, y: -0.02, rx: 0.5, ry: 0.12, rotation: -24, opacity: 0.24 }],
  },
  m8: {
    warm: "#F07A9C",
    cool: "#63B7FF",
    core: "#FFE5B8",
    scale: 1.14,
    rotation: 10,
    lobes: [
      { x: 0, y: 0, rx: 1.12, ry: 0.7, tone: "warm", opacity: 0.72 },
      { x: 0.55, y: -0.24, rx: 0.62, ry: 0.42, tone: "cool", opacity: 0.42 },
      { x: -0.5, y: 0.2, rx: 0.62, ry: 0.45, tone: "warm", opacity: 0.5 },
    ],
    lanes: [{ x: 0.04, y: 0, rx: 0.14, ry: 0.78, rotation: 12, opacity: 0.28 }],
  },
  m16: {
    warm: "#E99A6E",
    cool: "#7C9CF5",
    core: "#FFE9B8",
    scale: 0.98,
    rotation: -8,
    lobes: [
      { x: 0, y: 0, rx: 0.92, ry: 0.76, tone: "warm", opacity: 0.7 },
      { x: -0.42, y: -0.34, rx: 0.58, ry: 0.5, tone: "cool", opacity: 0.38 },
      { x: 0.4, y: 0.34, rx: 0.58, ry: 0.48, tone: "warm", opacity: 0.48 },
    ],
    lanes: [
      { x: -0.08, y: 0.22, rx: 0.1, ry: 0.54, rotation: -10, opacity: 0.3 },
      { x: 0.16, y: 0.2, rx: 0.08, ry: 0.45, rotation: 9, opacity: 0.24 },
    ],
  },
  ngc3372: {
    warm: "#F3A064",
    cool: "#5DBDD8",
    core: "#FFF0C5",
    scale: 1.28,
    rotation: 22,
    lobes: [
      { x: 0, y: 0, rx: 1.1, ry: 0.82, tone: "warm", opacity: 0.64 },
      { x: -0.52, y: -0.38, rx: 0.72, ry: 0.52, tone: "cool", opacity: 0.44 },
      { x: 0.55, y: 0.34, rx: 0.76, ry: 0.54, tone: "warm", opacity: 0.5 },
      { x: 0.08, y: -0.64, rx: 0.58, ry: 0.42, tone: "cool", opacity: 0.32 },
    ],
    lanes: [{ x: 0.08, y: 0.04, rx: 0.46, ry: 0.13, rotation: -32, opacity: 0.3 }],
  },
  ngc7000: {
    warm: "#EF7F8E",
    cool: "#5CB8D8",
    core: "#FFD7BC",
    scale: 1.18,
    rotation: -12,
    lobes: [
      { x: 0, y: 0, rx: 1.08, ry: 0.78, tone: "warm", opacity: 0.54 },
      { x: -0.52, y: -0.24, rx: 0.65, ry: 0.52, tone: "cool", opacity: 0.36 },
      { x: 0.52, y: 0.28, rx: 0.7, ry: 0.48, tone: "warm", opacity: 0.42 },
    ],
  },
  m17: {
    warm: "#F68BBD",
    cool: "#7B8BEF",
    core: "#FFE7CC",
    scale: 0.92,
    rotation: -24,
    lobes: [
      { x: 0, y: 0, rx: 1.05, ry: 0.52, tone: "warm", opacity: 0.7 },
      { x: -0.38, y: -0.3, rx: 0.64, ry: 0.42, tone: "cool", opacity: 0.38 },
      { x: 0.48, y: 0.18, rx: 0.62, ry: 0.38, tone: "warm", opacity: 0.45 },
    ],
  },
  m20: {
    warm: "#F46FAD",
    cool: "#68A9F4",
    core: "#FFE9D8",
    scale: 0.98,
    rotation: 4,
    lobes: [
      { x: 0, y: 0.18, rx: 0.94, ry: 0.74, tone: "warm", opacity: 0.76 },
      { x: 0, y: -0.62, rx: 0.72, ry: 0.48, tone: "cool", opacity: 0.62 },
      { x: -0.48, y: 0.38, rx: 0.56, ry: 0.44, tone: "warm", opacity: 0.48 },
      { x: 0.48, y: 0.38, rx: 0.56, ry: 0.44, tone: "warm", opacity: 0.48 },
    ],
    lanes: [
      { x: 0, y: 0.1, rx: 0.09, ry: 0.72, rotation: 2, opacity: 0.32 },
      { x: -0.22, y: 0.35, rx: 0.08, ry: 0.56, rotation: -42, opacity: 0.28 },
      { x: 0.24, y: 0.35, rx: 0.08, ry: 0.56, rotation: 42, opacity: 0.28 },
    ],
  },
  ngc2237: {
    warm: "#F47DA5",
    cool: "#8A77E8",
    core: "#FFD9C9",
    scale: 1.02,
    rotation: 0,
    lobes: [
      { x: 0, y: 0, rx: 1, ry: 1, tone: "warm", opacity: 0.48 },
      { x: -0.42, y: -0.22, rx: 0.56, ry: 0.52, tone: "cool", opacity: 0.28 },
      { x: 0.44, y: 0.28, rx: 0.58, ry: 0.54, tone: "warm", opacity: 0.3 },
    ],
    lanes: [{ x: 0, y: 0, rx: 0.38, ry: 0.34, rotation: 0, opacity: 0.2 }],
  },
  m27: {
    warm: "#54D3C4",
    cool: "#7A8BFF",
    core: "#E8FFF6",
    scale: 0.72,
    rotation: 24,
    lobes: [
      { x: -0.28, y: 0, rx: 0.72, ry: 0.56, tone: "cool", opacity: 0.56 },
      { x: 0.28, y: 0, rx: 0.72, ry: 0.56, tone: "warm", opacity: 0.58 },
    ],
  },
  m57: {
    warm: "#E86AB6",
    cool: "#66D2D2",
    core: "#F7F4FF",
    scale: 0.58,
    rotation: 0,
    lobes: [{ x: 0, y: 0, rx: 0.88, ry: 0.72, tone: "warm", opacity: 0.52 }],
    lanes: [{ x: 0, y: 0, rx: 0.4, ry: 0.3, rotation: 0, opacity: 0.34 }],
  },
  m1: {
    warm: "#F38B6B",
    cool: "#58B7C9",
    core: "#FFF0CF",
    scale: 0.78,
    rotation: -16,
    lobes: [
      { x: 0, y: 0, rx: 0.92, ry: 0.66, tone: "warm", opacity: 0.58 },
      { x: -0.4, y: -0.26, rx: 0.56, ry: 0.44, tone: "cool", opacity: 0.36 },
      { x: 0.42, y: 0.3, rx: 0.56, ry: 0.42, tone: "warm", opacity: 0.38 },
    ],
  },
  ngc6960: {
    warm: "#E76DB6",
    cool: "#55C4D7",
    core: "#EFFFFF",
    scale: 1.05,
    rotation: -32,
    lobes: [
      { x: -0.35, y: 0, rx: 1.15, ry: 0.18, tone: "cool", opacity: 0.44 },
      { x: 0.3, y: 0.18, rx: 1.05, ry: 0.16, tone: "warm", opacity: 0.4 },
      { x: 0.08, y: -0.22, rx: 0.78, ry: 0.12, tone: "cool", opacity: 0.3 },
    ],
  },
};

export function NebulaImageLayer({ nebulae, pointing, fov, box, visible, fullSphere = false }: Props) {
  const projected = useMemo(() => {
    if (!visible) return [];

    return nebulae.flatMap((nebula) => {
      const art = ART[nebula.id];
      if (!art) return [];
      if (!fullSphere && !nebula.aboveHorizon) return [];

      const point = projectTarget(
        pointing,
        nebula.azimuthDegrees,
        nebula.altitudeDegrees,
        fov,
        box
      );
      if (!point.onScreen || point.behind) return [];

      const base = Math.max(24, Math.min(58, nebula.radius * 1.7));
      return [{ nebula, art, point, radius: base * art.scale }];
    });
  }, [box, fov, fullSphere, nebulae, pointing, visible]);

  if (!visible || projected.length === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={box.width} height={box.height} style={StyleSheet.absoluteFill}>
        <Defs>
          {projected.map(({ nebula, art }) => (
            <React.Fragment key={`defs-${nebula.id}`}>
              <RadialGradient id={`warm-${nebula.id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={art.core} stopOpacity={0.7} />
                <Stop offset="28%" stopColor={art.warm} stopOpacity={0.46} />
                <Stop offset="68%" stopColor={art.warm} stopOpacity={0.16} />
                <Stop offset="100%" stopColor={art.warm} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={`cool-${nebula.id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#EDF6FF" stopOpacity={0.42} />
                <Stop offset="34%" stopColor={art.cool} stopOpacity={0.34} />
                <Stop offset="72%" stopColor={art.cool} stopOpacity={0.12} />
                <Stop offset="100%" stopColor={art.cool} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={`dust-${nebula.id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#03030B" stopOpacity={0.58} />
                <Stop offset="58%" stopColor="#050610" stopOpacity={0.2} />
                <Stop offset="100%" stopColor="#050610" stopOpacity={0} />
              </RadialGradient>
            </React.Fragment>
          ))}
        </Defs>

        {projected.map(({ nebula, art, point, radius }) => (
          <G
            key={nebula.id}
            transform={`rotate(${art.rotation} ${point.x.toFixed(1)} ${point.y.toFixed(1)})`}
            opacity={0.92}
          >
            <Ellipse
              cx={point.x}
              cy={point.y}
              rx={radius * 2.15}
              ry={radius * 1.55}
              fill={`url(#${art.lobes.some((l) => l.tone === "cool") ? `cool-${nebula.id}` : `warm-${nebula.id}`})`}
              opacity={0.2}
            />

            {art.lobes.map((lobe, index) => (
              <Ellipse
                key={`${nebula.id}-lobe-${index}`}
                cx={point.x + lobe.x * radius}
                cy={point.y + lobe.y * radius}
                rx={radius * lobe.rx}
                ry={radius * lobe.ry}
                fill={`url(#${lobe.tone}-${nebula.id})`}
                opacity={lobe.opacity}
              />
            ))}

            {art.lanes?.map((lane, index) => (
              <Ellipse
                key={`${nebula.id}-lane-${index}`}
                cx={point.x + lane.x * radius}
                cy={point.y + lane.y * radius}
                rx={radius * lane.rx}
                ry={radius * lane.ry}
                fill={`url(#dust-${nebula.id})`}
                opacity={lane.opacity}
                rotation={lane.rotation}
                originX={point.x + lane.x * radius}
                originY={point.y + lane.y * radius}
              />
            ))}

            <Circle cx={point.x} cy={point.y} r={Math.max(1.2, radius * 0.045)} fill={art.core} opacity={0.9} />
          </G>
        ))}
      </Svg>
    </View>
  );
}
