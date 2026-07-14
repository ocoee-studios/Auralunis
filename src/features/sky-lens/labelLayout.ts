// labelLayout.ts
// Shared cross-layer label collision avoidance. SkyLensCanvas creates ONE placer per
// render and passes it to every label-rendering layer. As each layer places a label,
// the placer checks it against everything already claimed this frame and moves it into
// the nearest free slot (so e.g. Mercury / ISS / Jupiter, or Beehive / Cancer, stack
// instead of overlapping). First-come keeps its spot; the canvas renders the
// highest-priority layers (Moon, planets, satellites, bright stars) before the denser
// ones so the important labels win the natural position.
//
// Three capabilities beyond a plain nudge-down loop:
//
//   * reserveCircle() lets a layer claim the SPACE ITS ARTWORK OCCUPIES, not just its
//     label. Planets and the Moon reserve their glow discs, so no other label can be
//     drawn on top of a planet — which is what made labels look like they were sitting
//     inside the artwork.
//
//   * an `avoid` circle lets a label orbit its own object — right, left, above, below —
//     instead of only sliding downward into whatever is beneath it.
//
//   * safe margins keep labels out of the top HUD and the bottom control tray.

export type LabelBox = { width: number; height: number };
export type AvoidCircle = { x: number; y: number; r: number };

export type LabelPlacer = ((
  cx: number,
  cy: number,
  text: string,
  fontSize: number,
  avoid?: AvoidCircle
) => { x: number; y: number }) & {
  /** Claim an arbitrary rect (e.g. the seasonal caption, a HUD element). */
  reserve: (x: number, y: number, w: number, h: number) => void;
  /** Claim a circular region — an object's artwork, so labels never land on it. */
  reserveCircle: (x: number, y: number, r: number) => void;
};

type Rect = { x: number; y: number; w: number; h: number };

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function makeLabelPlacer(
  box: LabelBox,
  safe: { top?: number; bottom?: number } = {}
): LabelPlacer {
  const safeTop = safe.top ?? 0;
  const safeBottom = safe.bottom ?? 0;
  const claimed: Rect[] = [];

  const inBounds = (r: Rect): boolean =>
    r.x >= 4 &&
    r.x + r.w <= box.width - 4 &&
    r.y >= safeTop &&
    r.y + r.h <= box.height - safeBottom;

  const place = (
    cx: number,
    cy: number,
    text: string,
    fontSize: number,
    avoid?: AvoidCircle
  ): { x: number; y: number } => {
    const w = Math.max(8, text.length * fontSize * 0.58);
    const h = fontSize * 1.25;
    // y is the text BASELINE; the visual box sits ~h above it.
    const rectAt = (x: number, y: number): Rect => ({ x, y: y - h, w, h });

    const candidates: Array<[number, number]> = [];

    if (avoid) {
      // Orbit the object: preferred side first, then the opposite side, then above and
      // below, then the same four pushed further out. `gap` is measured from the glow
      // radius the caller passed, so the label always clears the ARTWORK, not just the
      // disc — that's the fix for labels sitting inside a planet's bloom.
      const gap = avoid.r + 6;
      const mid = avoid.y + fontSize * 0.35;
      for (const push of [0, h, h * 2]) {
        candidates.push([avoid.x + gap, mid + push]);
        candidates.push([avoid.x - gap - w, mid + push]);
        if (push === 0) {
          candidates.push([avoid.x - w / 2, avoid.y - gap]);
          candidates.push([avoid.x - w / 2, avoid.y + gap + fontSize]);
        }
        candidates.push([avoid.x + gap, mid - push]);
        candidates.push([avoid.x - gap - w, mid - push]);
      }
    } else {
      for (const dy of [0, h, -h, h * 2, -h * 2, h * 3, -h * 3, h * 4]) {
        candidates.push([cx, cy + dy]);
      }
    }

    for (const [x, y] of candidates) {
      const r = rectAt(x, y);
      if (!inBounds(r)) continue;
      if (claimed.some((c) => overlaps(c, r))) continue;
      claimed.push(r);
      return { x, y };
    }

    // Nothing clear anywhere — accept the natural spot. A slightly crowded label still
    // beats a missing one, and this is rare now that artwork is reserved.
    const fallbackX = avoid ? avoid.x + avoid.r + 6 : cx;
    const fallbackY = avoid ? avoid.y + fontSize * 0.35 : cy;
    claimed.push(rectAt(fallbackX, fallbackY));
    return { x: fallbackX, y: fallbackY };
  };

  place.reserve = (x: number, y: number, w: number, h: number) => {
    claimed.push({ x, y, w, h });
  };
  place.reserveCircle = (x: number, y: number, r: number) => {
    claimed.push({ x: x - r, y: y - r, w: r * 2, h: r * 2 });
  };

  return place as LabelPlacer;
}
