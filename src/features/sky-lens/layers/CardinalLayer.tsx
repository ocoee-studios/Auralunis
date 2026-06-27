import React from "react";
import { G, Text as SvgText } from "react-native-svg";
import { AuraLunisColors } from "@/theme/tokens";
import type { ProjectFn } from "../SkyLensVisual";

// Always-on cardinal compass labels (N / E / S / W) plotted just above the horizon at
// their true azimuths and projected per-frame — so they track the device heading exactly
// like the horizon line. Astral Gold at low opacity: present for orientation, never
// competing with star labels. Static SVG → crash-safe. Hidden in Night Mode (kept dim
// red) to preserve dark adaptation.
const DIRECTIONS: { az: number; label: string }[] = [
  { az: 0, label: "N" },
  { az: 90, label: "E" },
  { az: 180, label: "S" },
  { az: 270, label: "W" },
];

export function CardinalLayer({ project, nightMode }: { project: ProjectFn; nightMode: boolean }) {
  const color = nightMode ? "#7A2E2E" : AuraLunisColors.gold;
  return (
    <G>
      {DIRECTIONS.map((dir) => {
        const p = project(dir.az, 2.5); // just above the horizon line
        if (p.behind || !p.onScreen) return null;
        return (
          <SvgText
            key={dir.label}
            x={p.x}
            y={p.y}
            fill={color}
            fontSize={16}
            fontWeight="800"
            opacity={0.55}
            textAnchor="middle"
          >
            {dir.label}
          </SvgText>
        );
      })}
    </G>
  );
}
