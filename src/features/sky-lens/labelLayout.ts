// labelLayout.ts
// Shared cross-layer label collision avoidance. SkyLensCanvas creates ONE placer per
// render and passes it to every label-rendering layer, so labels from different layers
// (Moon / planets / stars / constellations / satellites) can't land on top of each other
// or on top of another object's artwork.
//
// Capabilities:
//   * reserveCircle() — claim the SPACE AN OBJECT'S ARTWORK OCCUPIES, so no label is ever
//     drawn on top of a planet or the Moon.
//   * an `avoid` circle — lets a label orbit its own object (right / left / above / below)
//     instead of only sliding downward into whatever is beneath it.
//   * `centered` — for labels drawn with textAnchor="middle" (see the bug note below).
//   * safe margins + LABEL_SAFE_INSET — keeps labels out of the top HUD, the bottom dock,
//     and away from the screen edges, with a horizontal FLIP rather than a clip.

export type LabelBox = { width: number; height: number };
export type AvoidCircle = { x: number; y: number; r: number };

// Labels must never touch the screen edge. At the old value (4px) a star label near the
// right-hand side was "in bounds" right up to the last few pixels, so its text ran off the
// display — which is exactly the clipped-label problem on device. 26px gives real air.
export const LABEL_SAFE_INSET = 26;

export type LabelPlacer = ((
  cx: number,
  cy: number,
  text: string,
  fontSize: number,
  avoid?: AvoidCircle,
  centered?: boolean
) => { x: number; y: number }) & {
  reserve: (x: number, y: number, w: number, h: number) => void;
  reserveCircle: (x: number, y: number, r: number) => void;
};

export type Rect = { x: number; y: number; w: number; h: number };

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Deterministic label box + rect. Exported as the single source of truth so tests can
// check the exact on-screen rectangle the placer used (no duplicated formula).
export function labelBoxSize(text: string, fontSize: number): { w: number; h: number } {
  return { w: Math.max(8, text.length * fontSize * 0.58), h: fontSize * 1.25 };
}

export function labelRect(x: number, y: number, text: string, fontSize: number, centered?: boolean): Rect {
  const { w, h } = labelBoxSize(text, fontSize);
  // `x` is the LEFT edge for left-anchored labels, the CENTRE for textAnchor="middle";
  // `y` is the text baseline, so the box top is y - h.
  return { x: centered ? x - w / 2 : x, y: y - h, w, h };
}

export function makeLabelPlacer(
  box: LabelBox,
  safe: { top?: number; bottom?: number } = {}
): LabelPlacer {
  const safeTop = safe.top ?? 0;
  const safeBottom = safe.bottom ?? 0;
  const claimed: Rect[] = [];

  const inBounds = (r: Rect): boolean =>
    r.x >= LABEL_SAFE_INSET &&
    r.x + r.w <= box.width - LABEL_SAFE_INSET &&
    r.y >= safeTop &&
    r.y + r.h <= box.height - safeBottom;

  const place = (
    cx: number,
    cy: number,
    text: string,
    fontSize: number,
    avoid?: AvoidCircle,
    centered?: boolean
  ): { x: number; y: number } => {
    const { w, h } = labelBoxSize(text, fontSize);

    // BUG FIX. `x` means different things to different callers: for a star label it's the
    // LEFT edge of the text, but ConstellationLayer draws with textAnchor="middle", so for
    // it `x` is the CENTRE. The placer always treated x as the left edge — so every
    // constellation label claimed (and collision-tested) a box sitting half a label-width
    // to the right of where it actually drew. Half its collision detection was fiction.
    const rectAt = (x: number, y: number): Rect => labelRect(x, y, text, fontSize, centered);

    const candidates: Array<[number, number]> = [];

    if (avoid) {
      // Orbit the object: preferred side, opposite side, above, below — then pushed out.
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
    } else if (centered) {
      // Centred labels can only move vertically without lying about their anchor.
      for (const dy of [0, h, -h, h * 2, -h * 2, h * 3, -h * 3]) candidates.push([cx, cy + dy]);
    } else {
      // FLIP, don't clip. Try the natural (right-of-object) position and its vertical
      // nudges; then MIRROR to the left of the object. A star near the right edge now puts
      // its name on its left instead of running off the display.
      const mirrored = cx - w - 8;
      for (const dy of [0, h, -h, h * 2, -h * 2, h * 3, -h * 3, h * 4]) {
        candidates.push([cx, cy + dy]);
      }
      for (const dy of [0, h, -h, h * 2, -h * 2]) {
        candidates.push([mirrored, cy + dy]);
      }
    }

    for (const [x, y] of candidates) {
      const r = rectAt(x, y);
      if (!inBounds(r)) continue;
      if (claimed.some((c) => overlaps(c, r))) continue;
      claimed.push(r);
      return { x, y };
    }

    return { x: NaN, y: NaN }; // no clean slot — caller suppresses the label
  };

  place.reserve = (x: number, y: number, w: number, h: number) => {
    claimed.push({ x, y, w, h });
  };
  place.reserveCircle = (x: number, y: number, r: number) => {
    claimed.push({ x: x - r, y: y - r, w: r * 2, h: r * 2 });
  };

  return place as LabelPlacer;
}
