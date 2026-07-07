import React from "react";
import { Circle, Defs, G, RadialGradient, Rect, Stop } from "react-native-svg";

// Quiet stardust layer. It should read as fine celestial texture, not a brown
// filter over the camera feed.
const SPECKS = (() => {
  let s = 0x9e3779b9 >>> 0;
  const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  return Array.from({ length: 190 }, (_, i) => ({
    x: rng(),
    y: rng(),
    r: 0.35 + rng() * 0.8,
    o: 0.022 + rng() * 0.026,
    color: i % 4 === 0 ? "#FFF1C8" : "#D9A84E",
  }));
})();

const GLINTS = (() => {
  let s = 0x5f3759df >>> 0;
  const rng = () => ((s = (s * 1103515245 + 12345) >>> 0) / 0xffffffff);
  return Array.from({ length: 10 }, () => ({
    x: rng(),
    y: rng(),
    r: 0.9 + rng() * 1.3,
    o: 0.035 + rng() * 0.045,
  }));
})();

export function CosmicDustLayer({ box, nightMode }: { box: { width: number; height: number }; nightMode: boolean }) {
  if (nightMode || box.width <= 0 || box.height <= 0) return null;
  return (
    <G pointerEvents="none">
      <Defs>
        <RadialGradient id="cosmicWarmth" cx="50%" cy="46%" r="74%">
          <Stop offset="0%" stopColor="#0A0806" stopOpacity="0.22" />
          <Stop offset="58%" stopColor="#0A0806" stopOpacity="0.09" />
          <Stop offset="100%" stopColor="#0A0806" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="stardustGlint" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.14" />
          <Stop offset="44%" stopColor="#E8C77E" stopOpacity="0.055" />
          <Stop offset="100%" stopColor="#D9A84E" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={box.width} height={box.height} fill="url(#cosmicWarmth)" />
      {SPECKS.map((d, i) => (
        <Circle key={`dust-${i}`} cx={d.x * box.width} cy={d.y * box.height} r={d.r} fill={d.color} opacity={d.o} />
      ))}
      {GLINTS.map((d, i) => (
        <Circle key={`glint-${i}`} cx={d.x * box.width} cy={d.y * box.height} r={d.r * 4} fill="url(#stardustGlint)" opacity={d.o} />
      ))}
    </G>
  );
}
