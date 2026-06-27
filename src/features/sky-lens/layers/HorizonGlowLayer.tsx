import React from "react";
import { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  project: ProjectFn;
  centerAzimuth: number;
  box: { width: number; height: number };
  nightMode: boolean;
  boost?: number; // optional opacity multiplier (Planetarium can push it slightly)
};

// HORIZON ATMOSPHERE GLOW — gives the sky a "floor" so it reads as a real dome
// instead of a flat star chart. Two soft bands hugging the projected horizon:
//   • warm amber light-pollution / airglow dome right at altitude 0 (strongest)
//   • a fainter cool transition just above, melting the warmth into the night
// Sampled in azimuth around where the device points and projected per-point (the
// same pattern GridLayer uses for its horizon arc), so the glow TRACKS the phone
// tilt — look up and it sinks off-screen, look down and it rises. Overlapping
// radial blobs (not a filled polygon) keep it robust to points wrapping behind the
// camera, and match the soft-glow pattern already used in MilkyWayLayer. All static
// SVG → crash-safe. Sits backmost (just over CosmicDustLayer) so stars and the
// Milky Way rise OUT of the glow rather than floating on a dead void.
export function HorizonGlowLayer({ project, centerAzimuth, box, nightMode, boost = 1 }: Props) {
  if (nightMode) return null; // preserve dark adaptation — no warm light at night

  const o = (v: number) => Math.min(0.2, v * boost);
  const warmR = Math.max(84, box.height * 0.24); // ~30% tighter — keep it hugging the horizon
  const coolR = Math.max(90, box.height * 0.24);

  // Sample the band of azimuths around the look direction at the glow's centre
  // altitudes. Step 8° — wide radii overlap into one continuous band.
  const sample = (altitude: number) => {
    const pts: { x: number; y: number }[] = [];
    for (let k = -104; k <= 104; k += 8) {
      const p = project(centerAzimuth + k, altitude);
      if (!p.behind) pts.push({ x: p.x, y: p.y });
    }
    return pts;
  };

  const warmPts = sample(1.5); // hugging the horizon
  const coolPts = sample(9);   // a touch higher — the transition

  return (
    <G>
      <Defs>
        {/* warm airglow dome — muted OCHRE (not city orange), fading out fast. Tuned
            down from the first device pass: it was flooding the lower sky as smog. */}
        <RadialGradient id="hzWarm" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#C9A878" stopOpacity={o(0.16)} />
          <Stop offset="42%" stopColor="#9C7E54" stopOpacity={o(0.06)} />
          <Stop offset="100%" stopColor="#9C7E54" stopOpacity={0} />
        </RadialGradient>
        {/* faint cool transition — desaturated teal so the warmth doesn't stop abruptly */}
        <RadialGradient id="hzCool" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#5E8C9E" stopOpacity={o(0.04)} />
          <Stop offset="60%" stopColor="#3E6478" stopOpacity={o(0.016)} />
          <Stop offset="100%" stopColor="#3E6478" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* cool transition first (behind), warm dome on top so the horizon stays warmest */}
      {coolPts.map((p, i) => (
        <Circle key={`hc-${i}`} cx={p.x} cy={p.y} r={coolR * (0.85 + ((i * 41) % 100) / 100 * 0.3)} fill="url(#hzCool)" />
      ))}
      {warmPts.map((p, i) => (
        <Circle key={`hw-${i}`} cx={p.x} cy={p.y} r={warmR * (0.82 + ((i * 37) % 100) / 100 * 0.36)} fill="url(#hzWarm)" />
      ))}
    </G>
  );
}
