// BirthSkyChart.tsx — a real, static sky chart for the Birth Sky feature. Renders the
// computed BirthSkyProfile as a zenith-centred planisphere: the horizon circle, faint
// altitude rings + a deterministic star field, cardinal directions, and every planet
// that was above the horizon plotted at its TRUE azimuth/altitude. Replaces the old
// fake "ring + floating dot" placeholder. All static SVG → crash-safe.
import React from "react";
import Svg, { Circle, Defs, G, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import { AuraLunisColors } from "@/theme/tokens";
import type { BirthSkyProfile } from "@/services/BirthSkyService";

const PLANET_COLOR: Record<string, string> = {
  Sun: "#FFE9A8", Moon: "#C0C6D4", Mercury: "#B4B2A9", Venus: "#FFF6D6",
  Mars: "#F0997B", Jupiter: "#EF9F27", Saturn: "#D9A84E", Uranus: "#9FE1CB", Neptune: "#85B7EB",
};

// Deterministic faint background stars (seeded — no Math.random, which is unavailable
// and would break determinism). Polar coords inside the disc.
const BG_STARS = (() => {
  let s = 0x6d2b79f5 >>> 0;
  const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  return Array.from({ length: 64 }, () => ({
    a: rng() * Math.PI * 2,
    rr: Math.sqrt(rng()),
    r: 0.5 + rng() * 0.9,
    o: 0.1 + rng() * 0.28,
  }));
})();

export function BirthSkyChart({ profile, size = 240 }: { profile: BirthSkyProfile; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 10;

  // (azimuth°, altitude°) → screen. Zenith (alt 90) at centre, horizon (alt 0) at the
  // edge; North up, East right (az: N=0, E=90, S=180, W=270).
  const project = (az: number, alt: number) => {
    const radial = R * Math.max(0, (90 - alt) / 90);
    const t = (az * Math.PI) / 180;
    return { x: cx + radial * Math.sin(t), y: cy - radial * Math.cos(t) };
  };

  const visible = profile.planets.filter((p) => p.visible && p.altitude > 0);

  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="bsSky" cx="50%" cy="42%" r="62%">
          <Stop offset="0%" stopColor="#101A33" stopOpacity={1} />
          <Stop offset="70%" stopColor="#070C1A" stopOpacity={1} />
          <Stop offset="100%" stopColor="#03060F" stopOpacity={1} />
        </RadialGradient>
      </Defs>

      {/* sky disc + horizon */}
      <Circle cx={cx} cy={cy} r={R} fill="url(#bsSky)" stroke="rgba(217,168,78,0.42)" strokeWidth={1.2} />
      {/* altitude rings (30° and 60°) */}
      <Circle cx={cx} cy={cy} r={(R * 2) / 3} fill="none" stroke="rgba(217,168,78,0.12)" strokeWidth={0.6} />
      <Circle cx={cx} cy={cy} r={R / 3} fill="none" stroke="rgba(217,168,78,0.12)" strokeWidth={0.6} />

      {/* faint background star field */}
      {BG_STARS.map((st, i) => (
        <Circle
          key={`bg-${i}`}
          cx={cx + R * st.rr * Math.cos(st.a)}
          cy={cy + R * st.rr * Math.sin(st.a)}
          r={st.r}
          fill="#FFF6D6"
          opacity={st.o}
        />
      ))}

      {/* cardinal directions */}
      <SvgText x={cx} y={cy - R + 13} fill={AuraLunisColors.gold2} fontSize={10} fontWeight="800" textAnchor="middle">N</SvgText>
      <SvgText x={cx + R - 7} y={cy + 4} fill={AuraLunisColors.gold2} fontSize={10} fontWeight="800" textAnchor="middle">E</SvgText>
      <SvgText x={cx} y={cy + R - 4} fill={AuraLunisColors.gold2} fontSize={10} fontWeight="800" textAnchor="middle">S</SvgText>
      <SvgText x={cx - R + 7} y={cy + 4} fill={AuraLunisColors.gold2} fontSize={10} fontWeight="800" textAnchor="middle">W</SvgText>

      {/* planets at their true positions the night you were born */}
      {visible.map((p) => {
        const { x, y } = project(p.azimuth, p.altitude);
        const color = PLANET_COLOR[p.name] ?? "#FFF6D6";
        return (
          <G key={p.name}>
            <Circle cx={x} cy={y} r={6.5} fill={color} opacity={0.16} />
            <Circle cx={x} cy={y} r={2.7} fill={color} />
            <SvgText x={x + 6} y={y + 3} fill="#E9ECF5" fontSize={8.5} fontWeight="600">{p.name}</SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
