// SVG planet illustrations — smooth gradient halos, no visible rings
import React from "react";
import { Circle, Defs, Ellipse, G, RadialGradient, Stop, ClipPath, Rect } from "react-native-svg";

type Props = { cx: number; cy: number; r: number; nightMode: boolean };

export function JupiterIllustration({ cx, cy, r, nightMode }: Props) {
  return (
    <G>
      <Defs>
        <RadialGradient id={`jupGlow-${cx}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#D4A44C" stopOpacity={0.25} />
          <Stop offset="40%" stopColor="#D4A44C" stopOpacity={0.08} />
          <Stop offset="100%" stopColor="#D4A44C" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`jupBody-${cx}`} cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#F2E6C8" />
          <Stop offset="60%" stopColor="#C89A52" />
          <Stop offset="100%" stopColor="#8B6830" />
        </RadialGradient>
        <ClipPath id={`jupClip-${cx}`}><Circle cx={cx} cy={cy} r={r} /></ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r * 1.8} fill={`url(#jupGlow-${cx})`} />
      <Circle cx={cx} cy={cy} r={r} fill={`url(#jupBody-${cx})`} />
      <G clipPath={`url(#jupClip-${cx})`}>
        <Rect x={cx - r} y={cy - r * 0.75} width={r * 2} height={r * 0.15} fill="#A07838" opacity={0.5} />
        <Rect x={cx - r} y={cy - r * 0.4} width={r * 2} height={r * 0.1} fill="#C8A058" opacity={0.35} />
        <Rect x={cx - r} y={cy - r * 0.08} width={r * 2} height={r * 0.18} fill="#8B6028" opacity={0.45} />
        <Rect x={cx - r} y={cy + r * 0.28} width={r * 2} height={r * 0.12} fill="#B89048" opacity={0.4} />
        <Rect x={cx - r} y={cy + r * 0.55} width={r * 2} height={r * 0.15} fill="#A07838" opacity={0.45} />
        <Ellipse cx={cx + r * 0.25} cy={cy + r * 0.15} rx={r * 0.18} ry={r * 0.1} fill="#C06838" opacity={0.6} />
      </G>
    </G>
  );
}

export function SaturnIllustration({ cx, cy, r, nightMode }: Props) {
  const ringW = r * 2.4;
  const ringH = r * 0.6;
  return (
    <G>
      <Defs>
        <RadialGradient id={`satGlow-${cx}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#D4A44C" stopOpacity={0.15} />
          <Stop offset="50%" stopColor="#D4A44C" stopOpacity={0.04} />
          <Stop offset="100%" stopColor="#D4A44C" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`satBody-${cx}`} cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#F0E0B8" />
          <Stop offset="60%" stopColor="#C8A868" />
          <Stop offset="100%" stopColor="#907838" />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r * 2} fill={`url(#satGlow-${cx})`} />
      <Ellipse cx={cx} cy={cy} rx={ringW} ry={ringH} fill="none" stroke="#C8B078" strokeWidth={r * 0.3} strokeOpacity={0.2} />
      <Ellipse cx={cx} cy={cy} rx={ringW * 0.85} ry={ringH * 0.85} fill="none" stroke="#030816" strokeWidth={r * 0.05} strokeOpacity={0.35} />
      <Circle cx={cx} cy={cy} r={r} fill={`url(#satBody-${cx})`} />
    </G>
  );
}

export function MarsIllustration({ cx, cy, r, nightMode }: Props) {
  return (
    <G>
      <Defs>
        <RadialGradient id={`marsGlow-${cx}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#C84828" stopOpacity={0.2} />
          <Stop offset="50%" stopColor="#C84828" stopOpacity={0.06} />
          <Stop offset="100%" stopColor="#C84828" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`marsBody-${cx}`} cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#E8A070" />
          <Stop offset="50%" stopColor="#C86040" />
          <Stop offset="100%" stopColor="#883020" />
        </RadialGradient>
        <ClipPath id={`marsClip-${cx}`}><Circle cx={cx} cy={cy} r={r} /></ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r * 1.6} fill={`url(#marsGlow-${cx})`} />
      <Circle cx={cx} cy={cy} r={r} fill={`url(#marsBody-${cx})`} />
      <G clipPath={`url(#marsClip-${cx})`}>
        <Ellipse cx={cx + r * 0.15} cy={cy - r * 0.1} rx={r * 0.35} ry={r * 0.2} fill="#702818" opacity={0.35} />
        <Circle cx={cx} cy={cy - r * 0.75} r={r * 0.3} fill="#F0E8E0" opacity={0.4} />
      </G>
    </G>
  );
}

export function VenusIllustration({ cx, cy, r, nightMode }: Props) {
  return (
    <G>
      <Defs>
        <RadialGradient id={`venGlow-${cx}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFF0" stopOpacity={0.3} />
          <Stop offset="30%" stopColor="#FFFFF0" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="#FFFFF0" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`venBody-${cx}`} cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#FFFFF0" />
          <Stop offset="50%" stopColor="#E8E0C8" />
          <Stop offset="100%" stopColor="#C0B898" />
        </RadialGradient>
      </Defs>
      {/* venGlow removed — the single venusBloom gradient (PlanetLayer) is the only
          halo now, so Venus can't read as two stacked concentric glows. */}
      <Circle cx={cx} cy={cy} r={r} fill={`url(#venBody-${cx})`} />
    </G>
  );
}

export function MercuryIllustration({ cx, cy, r, nightMode }: Props) {
  return (
    <G>
      <Defs>
        <RadialGradient id={`mercBody-${cx}`} cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#C0B8A8" />
          <Stop offset="60%" stopColor="#888078" />
          <Stop offset="100%" stopColor="#585048" />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#mercBody-${cx})`} />
    </G>
  );
}

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
