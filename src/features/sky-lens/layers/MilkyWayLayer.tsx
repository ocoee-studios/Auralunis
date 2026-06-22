import React from "react";
import { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  band: MilkyWayBand;
  stars: HorizontalStar[]; // procedural galactic star cloud (MILKY_WAY_STARS)
  project: ProjectFn;
  box: { width: number; height: number };
  nightMode: boolean;
  boost: number; // opacity multiplier (~1 camera, higher in Planetarium)
};

// The Milky Way as a TRUE TEXTURED STAR CLOUD — not gradient ribbons. The band is
// built from ~1800 procedural stars packed along the galactic plane (denser and
// brighter toward Sagittarius), so it reads as a real river of suns. Three passes,
// back to front:
//   1. faint warm-gold HAZE along the galactic equator (the unresolved glow that
//      binds the stars into a band — kept low so the stars carry the brightness)
//   2. the STAR CLOUD itself — thousands of tiny dots, bigger/warmer toward the core
//   3. dark DUST LANES (the Great Rift) — navy ink mottling the brightest stretches
// A broad gold core glow brightens the Sagittarius region. All static SVG (no
// animated props) so it's crash-safe; the photographic MilkyWayCoreLayer sits on top.
export function MilkyWayLayer({ band, stars, project, box, nightMode, boost }: Props) {
  if (nightMode) return null;

  // --- band-following points (galactic equator) for haze + dust placement ---
  const bandPts: { x: number; y: number }[] = [];
  for (let i = 0; i < band.center.length; i++) {
    const pt = band.center[i];
    if (!pt.aboveHorizon) continue; // never draw the band over the ground
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    if (p.behind) continue;
    if (i % 2 === 0) bandPts.push({ x: p.x, y: p.y });
  }

  const o = (v: number) => Math.min(0.2, v * boost);
  const hazeR = Math.max(64, box.height * 0.26); // soft band thickness
  const dustR = Math.max(46, box.height * 0.16);

  // galactic core glow (Sagittarius) — makes the core noticeably brighter
  const gc = band.galacticCenter;
  const coreP = gc.aboveHorizon ? project(gc.azimuthDegrees, gc.altitudeDegrees) : null;
  const coreR = Math.max(120, box.height * 0.4);

  return (
    <G>
      <Defs>
        {/* warm gold unresolved haze of the band */}
        <RadialGradient id="mwHaze" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E8C77E" stopOpacity={o(0.05)} />
          <Stop offset="55%" stopColor="#C99A52" stopOpacity={o(0.025)} />
          <Stop offset="100%" stopColor="#C99A52" stopOpacity={0} />
        </RadialGradient>
        {/* dark dust lane — navy ink that feathers to transparent */}
        <RadialGradient id="mwDust" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#04060E" stopOpacity={o(0.16)} />
          <Stop offset="60%" stopColor="#06080F" stopOpacity={o(0.07)} />
          <Stop offset="100%" stopColor="#06080F" stopOpacity={0} />
        </RadialGradient>
        {/* bright golden galactic core */}
        <RadialGradient id="mwCoreGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFE9B0" stopOpacity={o(0.16)} />
          <Stop offset="35%" stopColor="#E8C77E" stopOpacity={o(0.085)} />
          <Stop offset="100%" stopColor="#C99A52" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* PASS 1 — faint gold haze binding the band */}
      {bandPts.map((p, i) => (
        <Circle key={`h-${i}`} cx={p.x} cy={p.y} r={hazeR} fill="url(#mwHaze)" />
      ))}

      {/* core glow toward Sagittarius (drawn under the stars so they sparkle on top) */}
      {coreP && !coreP.behind && (
        <Circle cx={coreP.x} cy={coreP.y} r={coreR} fill="url(#mwCoreGlow)" />
      )}

      {/* PASS 2 — the star cloud: thousands of suns along the plane */}
      {stars.map((s) => {
        if (!s.aboveHorizon) return null;
        const p = project(s.azimuthDegrees, s.altitudeDegrees);
        if (!p.onScreen) return null;
        // These stars run ~4.2–7.2 mag; brighter ones cluster toward the core.
        const r = Math.max(0.6, Math.min(2.3, 5.6 - s.magnitude));
        const op = Math.max(0.32, Math.min(0.92, 1 - (s.magnitude - 4.2) / 3.4)) * Math.min(1.1, boost);
        // warm gold near the core (bright), cooler white-blue in the faint outskirts
        const color = s.magnitude < 5.0 ? "#FFF1CE" : s.magnitude < 6.0 ? "#F2ECE0" : "#DCE4F2";
        return <Circle key={s.id} cx={p.x} cy={p.y} r={r} fill={color} opacity={op} />;
      })}

      {/* PASS 3 — dark dust lanes mottling the band (every ~5th band point) */}
      {bandPts.map((p, i) =>
        i % 5 === 2 ? <Circle key={`d-${i}`} cx={p.x} cy={p.y} r={dustR} fill="url(#mwDust)" /> : null
      )}
    </G>
  );
}
