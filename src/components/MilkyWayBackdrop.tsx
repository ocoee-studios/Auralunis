// Procedural Milky Way backdrop — a soft diagonal galactic band with a
// deterministic starfield. Fully offline, no photographic assets. Rendered
// behind screen content (e.g. the Sky tab) to evoke the approved board's
// Milky Way hero without bundling licensed imagery.
import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop, Circle, G } from "react-native-svg";
import { ChronauraColors } from "@/theme/tokens";

type Star = { x: number; y: number; r: number; o: number };

// Tiny deterministic PRNG (mulberry32) so the starfield is stable per size
// and never re-randomizes between renders.
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function MilkyWayBackdrop() {
  const { width, height } = useWindowDimensions();

  const stars = useMemo<Star[]>(() => {
    const rng = makeRng(0x5ec7);
    // Band runs diagonally from lower-left to upper-right.
    const angle = -0.62; // radians
    const perpX = Math.cos(angle + Math.PI / 2);
    const perpY = Math.sin(angle + Math.PI / 2);
    const out: Star[] = [];
    for (let i = 0; i < 170; i++) {
      // Concentrate stars along the band, scatter the rest across the sky.
      const alongBand = i < 120;
      let x: number;
      let y: number;
      if (alongBand) {
        const t = rng();
        const spread = (rng() - 0.5) * height * 0.42;
        const bx = t * width;
        const by = height * 0.62 - t * height * 0.5;
        x = bx + perpX * spread;
        y = by + perpY * spread;
      } else {
        x = rng() * width;
        y = rng() * height;
      }
      const bright = rng();
      out.push({
        x,
        y,
        r: 0.6 + bright * (alongBand ? 1.7 : 1.1),
        o: (alongBand ? 0.5 : 0.28) + bright * 0.5
      });
    }
    return out;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="mwBand" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#B8CBF2" stopOpacity={0.85} />
            <Stop offset="35%" stopColor="#7E6CDA" stopOpacity={0.6} />
            <Stop offset="70%" stopColor="#332A66" stopOpacity={0.32} />
            <Stop offset="100%" stopColor="#0B0B12" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="mwCore" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={ChronauraColors.gold2} stopOpacity={0.6} />
            <Stop offset="55%" stopColor="#C7A66A" stopOpacity={0.24} />
            <Stop offset="100%" stopColor="#0B0B12" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Diagonal galactic band */}
        <G rotation={-35} origin={`${width / 2}, ${height * 0.42}`}>
          <Ellipse cx={width / 2} cy={height * 0.42} rx={height * 1.0} ry={width * 0.42} fill="url(#mwBand)" />
          {/* Brighter galactic core */}
          <Ellipse cx={width * 0.42} cy={height * 0.5} rx={height * 0.34} ry={width * 0.2} fill="url(#mwCore)" />
        </G>

        {/* Starfield */}
        {stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFDF4" opacity={s.o} />
        ))}
      </Svg>
    </View>
  );
}
