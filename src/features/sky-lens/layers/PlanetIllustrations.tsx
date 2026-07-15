// Procedural planet artwork for the Sky Lens planetarium.
//
// SCOPE (locked): this file draws planets with react-native-svg primitives only. It does
// NOT touch astronomy, projection, time, sensors, or the camera. Every function is pure —
// given (cx, cy, r) and optional ephemeris-derived phase it returns deterministic SVG.
// No <Image>, no PNG stickers, no CameraView. Sky Lens stays a fully rendered,
// sensor-aligned planetarium; this only makes the discs inside it look like real planets.
//
// The small geometry helpers at the top are exported so the deterministic render self-test
// (scripts/planet-render-selftest.js) can verify the artwork math without a device.
import React from "react";
import { Circle, Defs, Ellipse, G, RadialGradient, Rect, Stop, ClipPath } from "react-native-svg";

type Props = { cx: number; cy: number; r: number; nightMode: boolean };

// ── Deterministic geometry helpers (pure) ───────────────────────────────────────

/** Venus phase, driven by the real illuminated fraction f∈[0,1] (astronomy-engine). */
export type VenusPhaseSpec =
  | { hasPhase: false }
  | { hasPhase: true; crescent: boolean; terminatorRx: number };

/**
 * Terminator geometry for a phase. The lit disc is a full circle of radius r; the unlit
 * region is the far half-plane UNION (crescent) / MINUS (gibbous) a terminator ellipse
 * whose semi-minor axis is r·|1−2f|. f<0.5 → crescent, f>0.5 → gibbous, f≈1 → full disc.
 * Returns hasPhase:false when there is no usable fraction, so the caller renders the plain
 * disc and never fakes a phase.
 */
export function venusPhaseSpec(r: number, illumination?: number): VenusPhaseSpec {
  if (typeof illumination !== "number" || !Number.isFinite(illumination)) return { hasPhase: false };
  const f = Math.min(1, Math.max(0, illumination));
  if (f >= 0.995) return { hasPhase: false }; // effectively full — draw the plain lit disc
  return { hasPhase: true, crescent: f < 0.5, terminatorRx: r * Math.abs(1 - 2 * f) };
}

/** Jupiter belt/zone bands as fractions of r (y-offset from centre, half-height). */
export const JUPITER_BANDS: ReadonlyArray<{ y: number; h: number; fill: string; opacity: number }> = [
  { y: -0.74, h: 0.09, fill: "#A9814A", opacity: 0.5 },
  { y: -0.5, h: 0.07, fill: "#E9D6AE", opacity: 0.32 },
  { y: -0.28, h: 0.1, fill: "#8A6430", opacity: 0.5 },
  { y: -0.04, h: 0.11, fill: "#C8A45E", opacity: 0.4 },
  { y: 0.22, h: 0.09, fill: "#7E5A2C", opacity: 0.5 },
  { y: 0.46, h: 0.08, fill: "#CBAA66", opacity: 0.38 },
  { y: 0.66, h: 0.1, fill: "#9A7238", opacity: 0.46 }
];

// ── Shared bits ──────────────────────────────────────────────────────────────────

/** Limb darkening — a transparent-centre → dark-edge overlay that makes the disc spherical. */
function LimbShade({ cx, cy, r, id }: Props & { id: string }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="42%" cy="38%" r="62%">
          <Stop offset="0%" stopColor="#000000" stopOpacity={0} />
          <Stop offset="70%" stopColor="#000000" stopOpacity={0} />
          <Stop offset="100%" stopColor="#0A0A12" stopOpacity={0.42} />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

// ── Jupiter ────────────────────────────────────────────────────────────────────

export function JupiterIllustration({ cx, cy, r, nightMode }: Props) {
  const key = `jup-${cx.toFixed(1)}-${cy.toFixed(1)}`;
  return (
    <G>
      <Defs>
        <RadialGradient id={`${key}-body`} cx="40%" cy="34%" r="60%">
          <Stop offset="0%" stopColor="#F4E8CC" />
          <Stop offset="58%" stopColor="#C89A52" />
          <Stop offset="100%" stopColor="#7E5B2A" />
        </RadialGradient>
        <ClipPath id={`${key}-clip`}>
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${key}-body)`} />
      <G clipPath={`url(#${key}-clip)`}>
        {/* Cloud belts & zones. Ellipses (not rects) so the banding curves with the globe. */}
        {JUPITER_BANDS.map((b, i) => (
          <Ellipse
            key={i}
            cx={cx}
            cy={cy + r * b.y}
            rx={r * 1.02}
            ry={r * b.h}
            fill={b.fill}
            opacity={b.opacity}
          />
        ))}
        {/* One restrained Great Red Spot — muted brick, soft, south of the equator. */}
        <Ellipse cx={cx + r * 0.28} cy={cy + r * 0.24} rx={r * 0.2} ry={r * 0.12} fill="#B4512B" opacity={0.62} />
        <Ellipse cx={cx + r * 0.28} cy={cy + r * 0.24} rx={r * 0.12} ry={r * 0.07} fill="#D07548" opacity={0.5} />
      </G>
      <LimbShade cx={cx} cy={cy} r={r} nightMode={nightMode} id={`${key}-limb`} />
    </G>
  );
}

// ── Saturn ───────────────────────────────────────────────────────────────────────

const SATURN_TILT = -18; // degrees; near side of the ring plane dips to the bottom

export function SaturnIllustration({ cx, cy, r, nightMode }: Props) {
  const key = `sat-${cx.toFixed(1)}-${cy.toFixed(1)}`;
  const ringRx = r * 2.1; // outer A-ring radius — restrained, collision-safe (~current)
  const ringRy = r * 0.58;
  const innerRx = r * 1.5; // inner B-ring
  const innerRy = ringRy * (innerRx / ringRx);
  const divRx = r * 1.78; // Cassini division sits between A and B rings
  const divRy = ringRy * (divRx / ringRx);
  return (
    <G>
      <Defs>
        <RadialGradient id={`${key}-body`} cx="40%" cy="34%" r="60%">
          <Stop offset="0%" stopColor="#F2E4BC" />
          <Stop offset="60%" stopColor="#C8A868" />
          <Stop offset="100%" stopColor="#836C33" />
        </RadialGradient>
        <ClipPath id={`${key}-globe`}>
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
        {/* Front half of the rings = the near (bottom) portion, drawn over the globe. */}
        <ClipPath id={`${key}-front`}>
          <Rect x={cx - ringRx} y={cy} width={ringRx * 2} height={ringRy + r} />
        </ClipPath>
      </Defs>

      {/* BACK of the rings — behind the globe. */}
      <G rotation={SATURN_TILT} originX={cx} originY={cy}>
        <Ellipse cx={cx} cy={cy} rx={ringRx} ry={ringRy} fill="none" stroke="#C9B27E" strokeWidth={r * 0.34} strokeOpacity={0.5} />
        <Ellipse cx={cx} cy={cy} rx={innerRx} ry={innerRy} fill="none" stroke="#E7D4A2" strokeWidth={r * 0.2} strokeOpacity={0.42} />
        <Ellipse cx={cx} cy={cy} rx={divRx} ry={divRy} fill="none" stroke="#1A1408" strokeWidth={r * 0.05} strokeOpacity={0.6} />
      </G>

      {/* GLOBE with limb shading. */}
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${key}-body)`} />
      {/* Ring shadow cast across the globe, along the ring plane. */}
      <G clipPath={`url(#${key}-globe)`}>
        <G rotation={SATURN_TILT} originX={cx} originY={cy}>
          <Ellipse cx={cx} cy={cy - r * 0.08} rx={r * 0.98} ry={r * 0.14} fill="#20180A" opacity={0.34} />
        </G>
      </G>
      <LimbShade cx={cx} cy={cy} r={r} nightMode={nightMode} id={`${key}-limb`} />

      {/* FRONT of the rings — the near portion passes in front of the globe. */}
      <G clipPath={`url(#${key}-front)`}>
        <G rotation={SATURN_TILT} originX={cx} originY={cy}>
          <Ellipse cx={cx} cy={cy} rx={ringRx} ry={ringRy} fill="none" stroke="#D8C08A" strokeWidth={r * 0.34} strokeOpacity={0.62} />
          <Ellipse cx={cx} cy={cy} rx={divRx} ry={divRy} fill="none" stroke="#1A1408" strokeWidth={r * 0.05} strokeOpacity={0.55} />
        </G>
      </G>
    </G>
  );
}

// ── Mars ───────────────────────────────────────────────────────────────────────

export function MarsIllustration({ cx, cy, r, nightMode, polarCap = true }: Props & { polarCap?: boolean }) {
  const key = `mars-${cx.toFixed(1)}-${cy.toFixed(1)}`;
  return (
    <G>
      <Defs>
        <RadialGradient id={`${key}-body`} cx="40%" cy="35%" r="58%">
          <Stop offset="0%" stopColor="#E9A472" />
          <Stop offset="52%" stopColor="#C25E38" />
          <Stop offset="100%" stopColor="#7E2C1A" />
        </RadialGradient>
        <ClipPath id={`${key}-clip`}>
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${key}-body)`} />
      <G clipPath={`url(#${key}-clip)`}>
        {/* Rusty albedo variation — restrained dark maria (e.g. Syrtis Major-like). */}
        <Ellipse cx={cx + r * 0.2} cy={cy - r * 0.05} rx={r * 0.34} ry={r * 0.22} fill="#6E2814" opacity={0.34} />
        <Ellipse cx={cx - r * 0.32} cy={cy + r * 0.3} rx={r * 0.24} ry={r * 0.16} fill="#8A3A1E" opacity={0.28} />
        {/* Conditional north polar cap — only when geometrically appropriate (caller-gated). */}
        {polarCap && <Ellipse cx={cx} cy={cy - r * 0.78} rx={r * 0.34} ry={r * 0.2} fill="#F1ECE4" opacity={0.5} />}
      </G>
      <LimbShade cx={cx} cy={cy} r={r} nightMode={nightMode} id={`${key}-limb`} />
    </G>
  );
}

// ── Venus (phase-aware) ──────────────────────────────────────────────────────────

export function VenusIllustration({
  cx,
  cy,
  r,
  nightMode,
  illumination
}: Props & { illumination?: number }) {
  const key = `ven-${cx.toFixed(1)}-${cy.toFixed(1)}`;
  const phase = venusPhaseSpec(r, illumination);
  const SHADOW = "#0A1020";
  return (
    <G>
      <Defs>
        <RadialGradient id={`${key}-body`} cx="40%" cy="35%" r="58%">
          <Stop offset="0%" stopColor="#FFFDF2" />
          <Stop offset="52%" stopColor="#EBE1C4" />
          <Stop offset="100%" stopColor="#C3B892" />
        </RadialGradient>
        <ClipPath id={`${key}-clip`}>
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
      </Defs>
      {/* Full lit disc. When no ephemeris fraction is available this is all that renders —
          the current geometry is preserved and no phase is invented. */}
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${key}-body)`} />
      {phase.hasPhase && (
        <G clipPath={`url(#${key}-clip)`}>
          {/* Unlit (left) half. Lit-from-right is a fixed, honest stylisation of orientation;
              the SHAPE of the terminator is the real illuminated fraction. */}
          <Rect x={cx - r} y={cy - r} width={r} height={r * 2} fill={SHADOW} opacity={0.82} />
          {phase.crescent ? (
            // Shadow bulges into the lit half → thin crescent on the far limb.
            <Ellipse cx={cx} cy={cy} rx={phase.terminatorRx} ry={r} fill={SHADOW} opacity={0.82} />
          ) : (
            // Light bulges back into the dark half → gibbous.
            <Ellipse cx={cx} cy={cy} rx={phase.terminatorRx} ry={r} fill={`url(#${key}-body)`} />
          )}
        </G>
      )}
      {!phase.hasPhase && <LimbShade cx={cx} cy={cy} r={r} nightMode={nightMode} id={`${key}-limb`} />}
    </G>
  );
}

// ── Mercury (unchanged — small, plain, intentionally shy) ─────────────────────────

export function MercuryIllustration({ cx, cy, r, nightMode }: Props) {
  const key = `merc-${cx.toFixed(1)}-${cy.toFixed(1)}`;
  return (
    <G>
      <Defs>
        <RadialGradient id={`${key}-body`} cx="40%" cy="35%" r="55%">
          <Stop offset="0%" stopColor="#C0B8A8" />
          <Stop offset="60%" stopColor="#888078" />
          <Stop offset="100%" stopColor="#585048" />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${key}-body)`} />
      <LimbShade cx={cx} cy={cy} r={r} nightMode={nightMode} id={`${key}-limb`} />
    </G>
  );
}

export type PlanetArtOptions = {
  /** Venus: real illuminated fraction 0..1 from ephemeris. Omit → plain lit disc. */
  illumination?: number;
  /** Mars: show the polar cap only when geometrically appropriate. Defaults to true. */
  polarCap?: boolean;
};

export function renderPlanetIllustration(
  id: string,
  cx: number,
  cy: number,
  r: number,
  nightMode: boolean,
  opts: PlanetArtOptions = {}
) {
  switch (id) {
    case "jupiter":
      return <JupiterIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} />;
    case "saturn":
      return <SaturnIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} />;
    case "mars":
      return <MarsIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} polarCap={opts.polarCap} />;
    case "venus":
      return <VenusIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} illumination={opts.illumination} />;
    case "mercury":
      return <MercuryIllustration cx={cx} cy={cy} r={r} nightMode={nightMode} />;
    default:
      return null;
  }
}
