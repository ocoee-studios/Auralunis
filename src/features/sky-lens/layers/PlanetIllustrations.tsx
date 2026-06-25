// SVG planet illustrations — photoreal-inspired gradient renders
// for Jupiter, Saturn, Mars, Venus, Mercury. Much richer than dots.
import React from "react";
import { Circle, Defs, Ellipse, G, LinearGradient, RadialGradient, Stop, ClipPath, Rect } from "react-native-svg";

type Props = { cx: number; cy: number; r: number; nightMode: boolean };

export function JupiterIllustration({ cx, cy, r, nightMode }: Props) {
  const gold = nightMode ? "#FF6B4A" : "#D4A44C";
  return (
    <G>
      <Defs>
        <RadialGradient id="jupBody" cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#F2E6C8" stopOpacity={1} />
          <Stop offset="60%" stopColor="#C89A52" stopOpacity={1} />
          <Stop offset="100%" stopColor="#8B6830" stopOpacity={1} />
        </RadialGradient>
        <ClipPath id="jupClip"><Circle cx={cx} cy={cy} r={r} /></ClipPath>
      </Defs>
      {/* Atmospheric glow */}
      <Circle cx={cx} cy={cy} r={r * 2.2} fill={gold} opacity={0.06} />
      <Circle cx={cx} cy={cy} r={r * 1.4} fill={gold} opacity={0.1} />
      {/* Planet body */}
      <Circle cx={cx} cy={cy} r={r} fill="url(#jupBody)" />
      {/* Cloud bands */}
      <G clipPath="url(#jupClip)">
        <Rect x={cx - r} y={cy - r * 0.75} width={r * 2} height={r * 0.18} fill="#A07838" opacity={0.6} />
        <Rect x={cx - r} y={cy - r * 0.42} width={r * 2} height={r * 0.12} fill="#C8A058" opacity={0.4} />
        <Rect x={cx - r} y={cy - r * 0.1} width={r * 2} height={r * 0.2} fill="#8B6028" opacity={0.5} />
        <Rect x={cx - r} y={cy + r * 0.25} width={r * 2} height={r * 0.15} fill="#B89048" opacity={0.45} />
        <Rect x={cx - r} y={cy + r * 0.55} width={r * 2} height={r * 0.18} fill="#A07838" opacity={0.5} />
        {/* Great Red Spot */}
        <Ellipse cx={cx + r * 0.25} cy={cy + r * 0.15} rx={r * 0.2} ry={r * 0.12} fill="#C06838" opacity={0.7} />
      </G>
      {/* Highlight */}
      <Circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.35} fill="white" opacity={0.08} />
    </G>
  );
}

export function SaturnIllustration({ cx, cy, r, nightMode }: Props) {
  const gold = nightMode ? "#FF6B4A" : "#D4A44C";
  const ringW = r * 2.6;
  const ringH = r * 0.7;
  return (
    <G>
      <Defs>
        <RadialGradient id="satBody" cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#F0E0B8" stopOpacity={1} />
          <Stop offset="60%" stopColor="#C8A868" stopOpacity={1} />
          <Stop offset="100%" stopColor="#907838" stopOpacity={1} />
        </RadialGradient>
      </Defs>
      {/* Atmospheric glow */}
      <Circle cx={cx} cy={cy} r={r * 2.5} fill={gold} opacity={0.05} />
      {/* Back ring half */}
      <Ellipse cx={cx} cy={cy} rx={ringW} ry={ringH} fill="none" stroke="#C8B078" strokeWidth={r * 0.35} strokeOpacity={0.25} />
      <Ellipse cx={cx} cy={cy} rx={ringW * 0.82} ry={ringH * 0.82} fill="none" stroke="#D8C088" strokeWidth={r * 0.15} strokeOpacity={0.3} />
      {/* Cassini division */}
      <Ellipse cx={cx} cy={cy} rx={ringW * 0.88} ry={ringH * 0.88} fill="none" stroke="#030816" strokeWidth={r * 0.06} strokeOpacity={0.4} />
      {/* Planet body (covers back ring center) */}
      <Circle cx={cx} cy={cy} r={r} fill="url(#satBody)" />
      {/* Subtle bands */}
      <Ellipse cx={cx} cy={cy - r * 0.3} rx={r * 0.9} ry={r * 0.08} fill="#B09050" opacity={0.3} />
      <Ellipse cx={cx} cy={cy + r * 0.2} rx={r * 0.85} ry={r * 0.06} fill="#A08040" opacity={0.25} />
      {/* Highlight */}
      <Circle cx={cx - r * 0.2} cy={cy - r * 0.2} r={r * 0.3} fill="white" opacity={0.07} />
    </G>
  );
}

export function MarsIllustration({ cx, cy, r, nightMode }: Props) {
  const red = nightMode ? "#FF4A3A" : "#C84828";
  return (
    <G>
      <Defs>
        <RadialGradient id="marsBody" cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#E8A070" stopOpacity={1} />
          <Stop offset="50%" stopColor="#C86040" stopOpacity={1} />
          <Stop offset="100%" stopColor="#883020" stopOpacity={1} />
        </RadialGradient>
        <ClipPath id="marsClip"><Circle cx={cx} cy={cy} r={r} /></ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r * 2} fill={red} opacity={0.08} />
      <Circle cx={cx} cy={cy} r={r * 1.3} fill={red} opacity={0.12} />
      <Circle cx={cx} cy={cy} r={r} fill="url(#marsBody)" />
      <G clipPath="url(#marsClip)">
        {/* Dark albedo markings */}
        <Ellipse cx={cx + r * 0.15} cy={cy - r * 0.1} rx={r * 0.4} ry={r * 0.25} fill="#702818" opacity={0.4} />
        <Ellipse cx={cx - r * 0.3} cy={cy + r * 0.3} rx={r * 0.3} ry={r * 0.2} fill="#682418" opacity={0.35} />
        {/* Polar cap */}
        <Circle cx={cx} cy={cy - r * 0.8} r={r * 0.35} fill="#F0E8E0" opacity={0.5} />
      </G>
      <Circle cx={cx - r * 0.2} cy={cy - r * 0.25} r={r * 0.25} fill="white" opacity={0.06} />
    </G>
  );
}

export function VenusIllustration({ cx, cy, r, nightMode }: Props) {
  const white = nightMode ? "#FFB0A0" : "#FFFFF0";
  return (
    <G>
      <Defs>
        <RadialGradient id="venBody" cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#FFFFF0" stopOpacity={1} />
          <Stop offset="50%" stopColor="#E8E0C8" stopOpacity={1} />
          <Stop offset="100%" stopColor="#C0B898" stopOpacity={1} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r * 2.5} fill={white} opacity={0.06} />
      <Circle cx={cx} cy={cy} r={r * 1.5} fill={white} opacity={0.12} />
      <Circle cx={cx} cy={cy} r={r} fill="url(#venBody)" />
      {/* Cloud swirls */}
      <Ellipse cx={cx - r * 0.1} cy={cy - r * 0.2} rx={r * 0.6} ry={r * 0.15} fill="#D8D0B8" opacity={0.3} />
      <Ellipse cx={cx + r * 0.15} cy={cy + r * 0.25} rx={r * 0.5} ry={r * 0.1} fill="#C8C0A8" opacity={0.25} />
      <Circle cx={cx - r * 0.2} cy={cy - r * 0.2} r={r * 0.3} fill="white" opacity={0.1} />
    </G>
  );
}

export function MercuryIllustration({ cx, cy, r, nightMode }: Props) {
  return (
    <G>
      <Defs>
        <RadialGradient id="mercBody" cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#C0B8A8" stopOpacity={1} />
          <Stop offset="60%" stopColor="#888078" stopOpacity={1} />
          <Stop offset="100%" stopColor="#585048" stopOpacity={1} />
        </RadialGradient>
        <ClipPath id="mercClip"><Circle cx={cx} cy={cy} r={r} /></ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill="url(#mercBody)" />
      <G clipPath="url(#mercClip)">
        <Circle cx={cx + r * 0.3} cy={cy - r * 0.2} r={r * 0.15} fill="#504840" opacity={0.4} />
        <Circle cx={cx - r * 0.2} cy={cy + r * 0.3} r={r * 0.1} fill="#484038" opacity={0.35} />
        <Circle cx={cx + r * 0.1} cy={cy + r * 0.1} r={r * 0.08} fill="#504840" opacity={0.3} />
      </G>
      <Circle cx={cx - r * 0.15} cy={cy - r * 0.2} r={r * 0.2} fill="white" opacity={0.06} />
    </G>
  );
}

// Map planet ID → illustration component
export function renderPlanetIllustration(id: string, cx: number, cy: number, r: number, nightMode: boolean) {
  switch (id) {
    case "jupiter": return <JupiterIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} />;
    case "saturn": return <SaturnIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} />;
    case "mars": return <MarsIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} />;
    case "venus": return <VenusIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} />;
    case "mercury": return <MercuryIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} />;
    default: return null;
  }
}
