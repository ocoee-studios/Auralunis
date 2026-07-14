import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from "react-native-svg";
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

type ArtDirection = {
  scale: number;
  warm: string;
  cool: string;
  core: string;
  rotation: number;
  elongated?: boolean;
};

const ART: Record<string, ArtDirection> = {
  m42: { scale: 3.0, warm: "#F36BAE", cool: "#719FFF", core: "#FFF4DE", rotation: -18 },
  ngc2237: { scale: 2.8, warm: "#F06DAD", cool: "#9B79FF", core: "#FFE7F5", rotation: 8 },
  m1: { scale: 2.35, warm: "#EA8A68", cool: "#62BDD6", core: "#FFF1CE", rotation: 28, elongated: true },
  ngc3372: { scale: 3.2, warm: "#F18A62", cool: "#55BED3", core: "#FFF0C9", rotation: -12 },
  m8: { scale: 3.0, warm: "#F06C9F", cool: "#65ACEE", core: "#FFF0D8", rotation: 14, elongated: true },
  m20: { scale: 2.8, warm: "#EC5FA0", cool: "#69AEFA", core: "#FFF5E8", rotation: -8 },
  m16: { scale: 2.65, warm: "#DB7D72", cool: "#739BE8", core: "#FFE9C8", rotation: 18 },
  m17: { scale: 2.65, warm: "#F17F98", cool: "#6AB2F0", core: "#FFF0D6", rotation: -28, elongated: true },
  ngc7000: { scale: 2.95, warm: "#EC708F", cool: "#60C1D1", core: "#FFE6D8", rotation: 20, elongated: true },
  m27: { scale: 2.3, warm: "#66D0BA", cool: "#7399F5", core: "#F1FFF8", rotation: 35, elongated: true },
  m57: { scale: 2.05, warm: "#DE6CAB", cool: "#5CC4D0", core: "#F5FFF2", rotation: 0 },
  ngc6960: { scale: 3.0, warm: "#EC7AA0", cool: "#61C4E0", core: "#EFFFFF", rotation: -34, elongated: true },
};

function cloudPath(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const count = 12;
  const points: Array<[number, number]> = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const wobble = 0.72 + (((Math.sin(seed * 17.17 + i * 9.73) + 1) / 2) * 0.38);
    points.push([
      cx + Math.cos(angle) * rx * wobble,
      cy + Math.sin(angle) * ry * wobble,
    ]);
  }
  const mid = (a: number, b: number): [number, number] => [
    (points[a][0] + points[b][0]) / 2,
    (points[a][1] + points[b][1]) / 2,
  ];
  const start = mid(count - 1, 0);
  let d = `M ${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < count; i += 1) {
    const next = mid(i, (i + 1) % count);
    d += ` Q ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)} ${next[0].toFixed(1)} ${next[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

export function NebulaImageLayer({ nebulae, pointing, fov, box, visible, fullSphere = false }: Props) {
  if (!visible) return null;

  const rendered = nebulae.flatMap((nebula, index) => {
    const art = ART[nebula.id];
    if (!art) return [];
    if (!fullSphere && !nebula.aboveHorizon) return [];

    const projected = projectTarget(pointing, nebula.azimuthDegrees, nebula.altitudeDegrees, fov, box);
    if (projected.behind || !projected.onScreen) return [];

    const base = Math.max(34, Math.min(68, nebula.radius * art.scale));
    const rx = art.elongated ? base * 1.5 : base;
    const ry = art.elongated ? base * 0.74 : base * 0.92;
    const seed = index + nebula.id.length * 13;
    const warmId = `nebula-warm-${nebula.id}`;
    const coolId = `nebula-cool-${nebula.id}`;
    const coreId = `nebula-core-${nebula.id}`;
    const rotation = `rotate(${art.rotation} ${projected.x.toFixed(1)} ${projected.y.toFixed(1)})`;

    return [
      <G key={nebula.id} transform={rotation} opacity={nebula.aboveHorizon || fullSphere ? 1 : 0.18}>
        <Defs>
          <RadialGradient id={warmId} cx="48%" cy="48%" r="52%">
            <Stop offset="0%" stopColor={art.core} stopOpacity={0.96} />
            <Stop offset="18%" stopColor={art.warm} stopOpacity={0.9} />
            <Stop offset="56%" stopColor={art.warm} stopOpacity={0.42} />
            <Stop offset="100%" stopColor={art.warm} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={coolId} cx="48%" cy="48%" r="52%">
            <Stop offset="0%" stopColor="#EDF6FF" stopOpacity={0.76} />
            <Stop offset="30%" stopColor={art.cool} stopOpacity={0.68} />
            <Stop offset="68%" stopColor={art.cool} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={art.cool} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={coreId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="32%" stopColor={art.core} stopOpacity={0.92} />
            <Stop offset="100%" stopColor={art.core} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Path d={cloudPath(projected.x, projected.y, rx * 2.05, ry * 2.05, seed)} fill={`url(#${coolId})`} opacity={0.58} />
        <Path d={cloudPath(projected.x - rx * 0.3, projected.y + ry * 0.05, rx * 1.72, ry * 1.58, seed + 3)} fill={`url(#${warmId})`} opacity={0.86} />
        <Path d={cloudPath(projected.x + rx * 0.4, projected.y - ry * 0.28, rx * 1.16, ry * 1.18, seed + 7)} fill={`url(#${coolId})`} opacity={0.88} />
        <Path d={cloudPath(projected.x + rx * 0.2, projected.y + ry * 0.38, rx * 0.94, ry * 0.84, seed + 11)} fill={`url(#${warmId})`} opacity={0.9} />

        <Ellipse
          cx={projected.x + rx * 0.08}
          cy={projected.y + ry * 0.04}
          rx={Math.max(5, rx * 0.13)}
          ry={Math.max(14, ry * 0.64)}
          fill="#040716"
          opacity={0.23}
          transform={`rotate(${nebula.id === "m20" ? 36 : -24} ${projected.x.toFixed(1)} ${projected.y.toFixed(1)})`}
        />
        <Circle cx={projected.x} cy={projected.y} r={Math.max(10, base * 0.36)} fill={`url(#${coreId})`} />
        <Circle cx={projected.x - base * 0.2} cy={projected.y + base * 0.1} r={1.5} fill="#FFFDF5" opacity={0.95} />
        <Circle cx={projected.x + base * 0.28} cy={projected.y - base * 0.16} r={1.1} fill="#EAF4FF" opacity={0.9} />
        <Circle cx={projected.x + base * 0.08} cy={projected.y + base * 0.3} r={0.9} fill="#FFF1D5" opacity={0.86} />
      </G>,
    ];
  });

  if (rendered.length === 0) return null;

  return (
    <Svg pointerEvents="none" width={box.width} height={box.height} style={StyleSheet.absoluteFillObject}>
      {rendered}
    </Svg>
  );
}
