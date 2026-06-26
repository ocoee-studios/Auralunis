import React from "react";
import { Circle, Defs, G, RadialGradient, Rect, Stop } from "react-native-svg";

// §1 — "inside a galaxy" shimmer: a faint warm wash so the background isn't a dead
// void (warm #0A0806 pooling toward centre, fading to the cool cosmic black at the
// edges) plus ultra-faint scattered gold dust specks (~2–3% opacity) across the whole
// sky. Screen-fixed (like film grain) and deterministic, static SVG → cheap & crash-
// safe. Sits behind the stars/MW so it reads as ambient depth, never as objects.
const SPECKS = (() => {
  let s = 0x9e3779b9 >>> 0;
  const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  return Array.from({ length: 130 }, () => ({
    x: rng(),
    y: rng(),
    r: 0.5 + rng() * 0.9,
    o: 0.02 + rng() * 0.012, // 2.0–3.2%
  }));
})();

export function CosmicDustLayer({ box, nightMode }: { box: { width: number; height: number }; nightMode: boolean }) {
  if (nightMode || box.width <= 0 || box.height <= 0) return null;
  return (
    <G pointerEvents="none">
      <Defs>
        <RadialGradient id="cosmicWarmth" cx="50%" cy="46%" r="72%">
          <Stop offset="0%" stopColor="#0A0806" stopOpacity="0.55" />
          <Stop offset="60%" stopColor="#0A0806" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#0A0806" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={box.width} height={box.height} fill="url(#cosmicWarmth)" />
      {SPECKS.map((d, i) => (
        <Circle key={`dust-${i}`} cx={d.x * box.width} cy={d.y * box.height} r={d.r} fill="#D9A84E" opacity={d.o} />
      ))}
    </G>
  );
}
