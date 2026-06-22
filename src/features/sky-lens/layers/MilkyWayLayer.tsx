import React from "react";
import { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  band: MilkyWayBand;
  stars: HorizontalStar[]; // LAYER 2 — procedural galactic star cloud
  dust: HorizontalStar[]; // LAYERS 1 & 5 — dark dust clouds + the Great Rift
  project: ProjectFn;
  box: { width: number; height: number };
  nightMode: boolean;
  boost: number; // opacity multiplier (~1 camera, higher in Planetarium)
};

// The Milky Way as a LAYERED GALACTIC CLOUD — built to read like a premium
// astrophotography exposure, not a ribbon. Five layers, back to front:
//   3. GALACTIC GLOW  — huge, very soft warm gold-white haze along the plane
//   4. CORE DENSITY   — a brighter bloom toward the Sagittarius galactic centre
//   2. STAR CLOUD     — thousands of clumpy stars (brighter/warmer toward the core)
//   1+5. DUST         — dark clouds and the Great Rift painted ON TOP, occluding the
//        star cloud so the band has real black-against-bright CONTRAST and structure
// The dark dust is what turns fog into a galaxy. All static SVG — crash-safe. The
// photographic core texture (MilkyWayCoreLayer) layers on top of this.
export function MilkyWayLayer({ band, stars, dust, project, box, nightMode, boost }: Props) {
  if (nightMode) return null;

  // band-following points (galactic equator) for the soft glow
  const glowPts: { x: number; y: number }[] = [];
  for (let i = 0; i < band.center.length; i++) {
    const pt = band.center[i];
    if (!pt.aboveHorizon) continue;
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    if (p.behind) continue;
    if (i % 3 === 0) glowPts.push({ x: p.x, y: p.y });
  }

  const o = (v: number) => Math.min(0.22, v * boost);
  const glowR = Math.max(90, box.height * 0.42); // huge, soft
  const coreR = Math.max(130, box.height * 0.44);
  const dustBase = Math.max(34, box.height * 0.12);

  // galactic core glow (Sagittarius)
  const gc = band.galacticCenter;
  const coreP = gc.aboveHorizon ? project(gc.azimuthDegrees, gc.altitudeDegrees) : null;

  // tiny deterministic hash for per-blob size variation
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  return (
    <G>
      <Defs>
        {/* LAYER 3 — warm galactic glow */}
        <RadialGradient id="mwGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E8C77E" stopOpacity={o(0.055)} />
          <Stop offset="50%" stopColor="#C99A52" stopOpacity={o(0.025)} />
          <Stop offset="100%" stopColor="#C99A52" stopOpacity={0} />
        </RadialGradient>
        {/* LAYER 4 — bright galactic core */}
        <RadialGradient id="mwCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFE9B0" stopOpacity={o(0.17)} />
          <Stop offset="32%" stopColor="#E8C77E" stopOpacity={o(0.085)} />
          <Stop offset="100%" stopColor="#C99A52" stopOpacity={0} />
        </RadialGradient>
        {/* LAYERS 1 & 5 — dark dust (near-black navy, the contrast maker) */}
        <RadialGradient id="mwDust" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#01030A" stopOpacity={Math.min(0.62, 0.5 * boost)} />
          <Stop offset="48%" stopColor="#02040C" stopOpacity={Math.min(0.3, 0.24 * boost)} />
          <Stop offset="100%" stopColor="#02040C" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* LAYER 3 — soft glow binding the band */}
      {glowPts.map((p, i) => (
        <Circle key={`g-${i}`} cx={p.x} cy={p.y} r={glowR} fill="url(#mwGlow)" />
      ))}

      {/* LAYER 4 — bright core toward Sagittarius */}
      {coreP && !coreP.behind && <Circle cx={coreP.x} cy={coreP.y} r={coreR} fill="url(#mwCore)" />}

      {/* LAYER 2 — the clumpy star cloud */}
      {stars.map((s) => {
        if (!s.aboveHorizon) return null;
        const p = project(s.azimuthDegrees, s.altitudeDegrees);
        if (!p.onScreen) return null;
        const r = Math.max(0.6, Math.min(2.4, 5.6 - s.magnitude));
        const op = Math.max(0.3, Math.min(0.95, 1 - (s.magnitude - 4.0) / 3.4)) * Math.min(1.1, boost);
        const color = s.magnitude < 4.6 ? "#FFF1CE" : s.magnitude < 5.8 ? "#F2ECE0" : "#DCE4F2";
        return <Circle key={s.id} cx={p.x} cy={p.y} r={r} fill={color} opacity={op} />;
      })}

      {/* LAYERS 1 & 5 — dark dust + Great Rift ON TOP (carves the rivers, makes contrast) */}
      {dust.map((d) => {
        if (!d.aboveHorizon) return null;
        const p = project(d.azimuthDegrees, d.altitudeDegrees);
        if (!p.onScreen) return null;
        const rift = d.id.startsWith("mwr");
        const v = (hash(d.id) % 100) / 100;
        const r = (rift ? dustBase * 1.15 : dustBase * 0.7) * (0.7 + v * 0.8);
        return <Circle key={d.id} cx={p.x} cy={p.y} r={r} fill="url(#mwDust)" opacity={rift ? 1 : 0.72} />;
      })}
    </G>
  );
}
