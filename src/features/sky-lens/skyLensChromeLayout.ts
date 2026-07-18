// skyLensChromeLayout.ts
// Pure geometry for Sky Lens UI-chrome label avoidance. Given the overlay box, the
// safe-area insets, and the rendered dock height, it returns the rectangles that on-screen
// chrome occupies so the shared label placer can reserve them — no celestial label is then
// drawn under or behind a control. This is the SINGLE SOURCE OF TRUTH for these numbers;
// they mirror the styles in SkyLensScreen so rendering and avoidance can never drift apart.
//
// Sky Lens is a fully rendered, sensor-aligned planetarium; these are ordinary on-screen
// UI controls layered over the rendered sky. No react-native imports: pure math,
// unit-testable in plain Node (see scripts/skylens-label-selftest.js).

export type ChromeRect = { x: number; y: number; w: number; h: number };
export type ChromeInsets = { top: number; bottom: number; left: number; right: number };
export type ChromeBox = { width: number; height: number };

// ── Centralized chrome constants (mirror SkyLensScreen.tsx styles) ────────────────
// topBar: paddingTop = insets.top + 8; its tallest content is the HUD pill —
// paddingVertical 6 (×2) plus up to three text rows (17 + 13 + 13 pt at ~1.3 line height).
const TOP_BAR_PAD_TOP = 8;
const HUD_PILL_MAX_H = 68; // 12 (pad) + ~56 (three text rows) — covers the tallest HUD

// shutter / screenshot control (styles.shutterBtn): 60×60, right: 20, floats at
// bottom = insets.bottom + dockHeight + 16.
const SHUTTER_SIZE = 60;
const SHUTTER_RIGHT = 20;
const SHUTTER_BOTTOM_GAP = 16;

// guidance banner (styles.finder / finderText): centered, bottom = floatAbove + 72,
// intrinsic height ≈ fontSize 17 (×~1.3) + paddingVertical 9 (×2).
const FINDER_BOTTOM_EXTRA = 72;
const FINDER_H = 44;
const FINDER_MAX_W = 340;

// zoom chip (styles.zoomChip): top-center, top = insets.top + 58, small pill.
const ZOOM_CHIP_TOP_GAP = 58;
const ZOOM_CHIP_W = 96;
const ZOOM_CHIP_H = 30;

// Horizontal edge inset the placer already enforces (labelLayout.LABEL_SAFE_INSET).
const EDGE_INSET = 26;
// Breathing room so a label never kisses a chrome edge.
const PAD = 6;

/**
 * Top exclusion band (px from the top of the box), derived from the safe-area inset plus
 * the real top-bar height — replaces the old hard-coded 108, which under-covered a tall
 * three-line HUD on notched devices (labels tucked under it).
 */
export function chromeTopInset(insets: ChromeInsets): number {
  return insets.top + TOP_BAR_PAD_TOP + HUD_PILL_MAX_H;
}

export type ChromeVisibility = {
  /** Screenshot/shutter control — premium, hidden when a body is selected or cinematic. */
  shutter?: boolean;
  /** Guidance banner (find-mode / moon-finder). */
  finder?: boolean;
  /** Zoom-level chip, shown while zoomed in. */
  zoomChip?: boolean;
};

/**
 * Floating chrome rectangles NOT already covered by the top/bottom exclusion bands: the
 * shutter/screenshot control, the guidance banner, and the zoom chip. Only currently
 * VISIBLE chrome is returned, so hidden controls never suppress a label. `dockHeight` is the
 * rendered dock height (the screen already derives it); `floatAbove` mirrors the screen.
 */
export function chromeAvoidRects(params: {
  box: ChromeBox;
  insets: ChromeInsets;
  dockHeight: number;
  visible?: ChromeVisibility;
}): ChromeRect[] {
  const { box, insets, dockHeight, visible = {} } = params;
  const rects: ChromeRect[] = [];
  const floatAbove = insets.bottom + dockHeight + SHUTTER_BOTTOM_GAP;

  if (visible.shutter) {
    const bottomEdge = box.height - floatAbove; // y of the control's bottom edge
    rects.push({
      x: box.width - SHUTTER_RIGHT - SHUTTER_SIZE - PAD,
      y: bottomEdge - SHUTTER_SIZE - PAD,
      w: SHUTTER_SIZE + PAD * 2,
      h: SHUTTER_SIZE + PAD * 2
    });
  }

  if (visible.finder) {
    const w = Math.min(FINDER_MAX_W, box.width - 2 * EDGE_INSET);
    const bottomEdge = box.height - (floatAbove + FINDER_BOTTOM_EXTRA);
    rects.push({
      x: (box.width - w) / 2,
      y: bottomEdge - FINDER_H,
      w,
      h: FINDER_H + PAD
    });
  }

  if (visible.zoomChip) {
    rects.push({
      x: (box.width - ZOOM_CHIP_W) / 2,
      y: insets.top + ZOOM_CHIP_TOP_GAP - PAD,
      w: ZOOM_CHIP_W,
      h: ZOOM_CHIP_H + PAD * 2
    });
  }

  return rects;
}
