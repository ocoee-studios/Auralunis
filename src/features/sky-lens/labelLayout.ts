// labelLayout.ts
// Shared cross-layer label collision avoidance. SkyLensCanvas creates ONE placer per
// render and passes it to every label-rendering layer. As each layer places a label,
// the placer checks it against everything already claimed this frame and nudges it
// vertically into the nearest free slot (so e.g. Mercury / ISS / Jupiter, or Beehive /
// Cancer, stack instead of overlapping). First-come keeps its spot; the canvas renders
// the highest-priority layers (Moon, planets, satellites, bright stars) before the
// denser ones so the important labels win the natural position.

export type LabelBox = { width: number; height: number };
export type LabelPlacer = (cx: number, cy: number, text: string, fontSize: number) => { x: number; y: number };

type Rect = { x: number; y: number; w: number; h: number };

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function makeLabelPlacer(box: LabelBox): LabelPlacer {
  const claimed: Rect[] = [];

  return (cx, cy, text, fontSize) => {
    const w = Math.max(8, text.length * fontSize * 0.58);
    const h = fontSize * 1.25;
    // y passed in is the text baseline; the visual box sits ~h above it.
    const rectAt = (y: number): Rect => ({ x: cx, y: y - h, w, h });

    // Try the natural position, then nudge in growing vertical steps (down first).
    const steps = [0, h, -h, h * 2, -h * 2, h * 3, -h * 3, h * 4];
    for (const dy of steps) {
      const y = cy + dy;
      if (y - h < 0 || y > box.height) continue; // keep on-screen
      const r = rectAt(y);
      if (!claimed.some((c) => overlaps(c, r))) {
        claimed.push(r);
        return { x: cx, y };
      }
    }
    // Couldn't find a clear slot — accept the natural spot (better than hiding).
    claimed.push(rectAt(cy));
    return { x: cx, y: cy };
  };
}
