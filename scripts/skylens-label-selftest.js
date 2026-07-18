// Sky Lens label-avoidance self-test.
//
// Verifies that celestial labels never render under or behind Sky Lens UI chrome. It loads
// the REAL implementations by transpiling them to CommonJS at runtime (with the repo's own
// `typescript` dependency) — the shared label placer (labelLayout.ts), the chrome geometry
// (skyLensChromeLayout.ts), and the ENU projection (SkyLensProjection.ts) — so there is NO
// duplicated placement or projection math and a real regression is caught here. Runtime
// transpile keeps this working on CI's Node 20, which does not strip TS types.
//
// Sky Lens is a fully rendered, sensor-aligned planetarium — the "chrome" here is ordinary
// on-screen UI (close button, HUD, screenshot button, banners, dock) layered over the sky.

const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const Module = require("module");

function requireTs(absPath) {
  const source = fs.readFileSync(absPath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: absPath
  });
  const m = new Module(absPath, module);
  m.filename = absPath;
  m.paths = Module._nodeModulePaths(path.dirname(absPath));
  m._compile(outputText, absPath);
  return m.exports;
}

const R = (rel) => path.resolve(__dirname, "..", rel);
const { makeLabelPlacer, labelRect, overlaps } = requireTs(R("src/features/sky-lens/labelLayout.ts"));
const { chromeAvoidRects, chromeTopInset } = requireTs(R("src/features/sky-lens/skyLensChromeLayout.ts"));
const { projectTarget, DEFAULT_FOV } = requireTs(R("src/features/sky-lens/ar/SkyLensProjection.ts"));

let failed = 0;
function assert(label, ok, detail) {
  const line = label + (detail ? " — " + detail : "");
  if (ok) console.log("PASS", line);
  else {
    failed += 1;
    console.error("FAIL", line);
  }
}

// Devices + safe-area variants (portrait — Sky Lens is portrait-locked).
const DEVICES = [
  { name: "iPhone 16 Pro Max (notch)", box: { width: 430, height: 932 }, insets: { top: 59, bottom: 34, left: 0, right: 0 } },
  { name: "iPhone SE (no notch)", box: { width: 375, height: 667 }, insets: { top: 20, bottom: 0, left: 0, right: 0 } },
  { name: "iPhone 16 Pro Max (zero insets)", box: { width: 430, height: 932 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } }
];
const DOCK_H = 58; // collapsed dock = LAYER_BAR_HEIGHT(52) + 6

// Full chrome rectangle set for a device: the top HUD band, the bottom dock band (both
// enforced by the placer's safe bands) plus the floating controls (reserved rects).
function chromeSetup(box, insets, dockHeight, visible) {
  const topInset = chromeTopInset(insets);
  const bottomInset = dockHeight + insets.bottom + 12;
  const floating = chromeAvoidRects({ box, insets, dockHeight, visible });
  const bands = [
    { x: 0, y: 0, w: box.width, h: topInset },
    { x: 0, y: box.height - bottomInset, w: box.width, h: bottomInset }
  ];
  return { topInset, bottomInset, floating, allChrome: bands.concat(floating) };
}

// A placer wired exactly like SkyLensCanvas: derived top/bottom bands + reserved chrome.
function makePlacer(box, setup) {
  const p = makeLabelPlacer(box, { top: setup.topInset, bottom: setup.bottomInset });
  for (const r of setup.floating) p.reserve(r.x, r.y, r.w, r.h);
  return p;
}

const ALL_VISIBLE = { shutter: true, finder: true, zoomChip: true };

console.log("Sky Lens label-avoidance self-test — real placer + chrome geometry + ENU projection\n");

// ── 1. Sanity: modules loaded, chrome rects produced ──────────────────────────────
assert(
  "loaded real placer/chrome/projection modules",
  typeof makeLabelPlacer === "function" && typeof chromeAvoidRects === "function" && typeof projectTarget === "function"
);

// ── 2. No label lands on chrome, across a dense grid, on every device/inset variant ─
for (const d of DEVICES) {
  const setup = chromeSetup(d.box, d.insets, DOCK_H, ALL_VISIBLE);
  assert(`${d.name}: has floating chrome rects to avoid`, setup.floating.length >= 2, `${setup.floating.length} rects`);
  let placed = 0;
  let suppressed = 0;
  let intrusions = 0;
  for (let gx = 20; gx <= d.box.width - 20; gx += 30) {
    for (let gy = 20; gy <= d.box.height - 20; gy += 30) {
      const placer = makePlacer(d.box, setup); // fresh placer: chrome-only constraint
      const res = placer(gx, gy, "Regulus", 15); // a representative low-priority star label
      if (!Number.isFinite(res.x)) {
        suppressed += 1;
        continue;
      }
      placed += 1;
      const rect = labelRect(res.x, res.y, "Regulus", 15, false);
      if (setup.allChrome.some((c) => overlaps(c, rect))) intrusions += 1;
    }
  }
  assert(`${d.name}: NO label intersects any chrome rect (grid)`, intrusions === 0, `${placed} placed, ${suppressed} suppressed, ${intrusions} intrusions`);
}

// ── 3. Real ENU projection: a target that projects onto the shutter is avoided ─────
{
  const d = DEVICES[0];
  const setup = chromeSetup(d.box, d.insets, DOCK_H, ALL_VISIBLE);
  const shutter = setup.floating[0]; // shutter is first when visible
  const pointing = { azimuthDegrees: 180, altitudeDegrees: 20, rollDegrees: 0 };
  // Search a small target grid for one whose real projection lands inside the shutter rect.
  let hit = null;
  for (let dAz = 0; dAz <= 34 && !hit; dAz += 1) {
    for (let dAlt = 0; dAlt >= -34 && !hit; dAlt -= 1) {
      const pr = projectTarget(pointing, 180 + dAz, 20 + dAlt, DEFAULT_FOV, d.box);
      if (pr.onScreen && pr.x >= shutter.x && pr.x <= shutter.x + shutter.w && pr.y >= shutter.y && pr.y <= shutter.y + shutter.h) {
        hit = pr;
      }
    }
  }
  assert("real projection can land a target inside the shutter rect", !!hit, hit ? `x=${hit.x.toFixed(0)} y=${hit.y.toFixed(0)}` : "no hit");
  if (hit) {
    const placer = makePlacer(d.box, setup);
    const res = placer(hit.x, hit.y, "Regulus", 15);
    const ok = !Number.isFinite(res.x) || !overlaps(shutter, labelRect(res.x, res.y, "Regulus", 15, false));
    assert("label at a shutter-projected point is suppressed or moved clear of the shutter", ok, Number.isFinite(res.x) ? `moved to x=${res.x.toFixed(0)} y=${res.y.toFixed(0)}` : "suppressed");
  }
}

// ── 4. Priority: a planet/Moon label claimed first keeps its slot; a star yields ───
{
  const d = DEVICES[0];
  const setup = chromeSetup(d.box, d.insets, DOCK_H, ALL_VISIBLE);
  const placer = makePlacer(d.box, setup);
  const px = 215;
  const py = 500; // clear of all chrome
  const planet = placer(px, py, "Jupiter", 17); // planets claim before stars (canvas order)
  const planetRect = labelRect(planet.x, planet.y, "Jupiter", 17, false);
  const star = placer(px, py, "Regulus", 15); // same spot, after the planet
  assert("planet label is placed at its natural slot", Number.isFinite(planet.x) && Math.abs(planet.x - px) < 1 && Math.abs(planet.y - py) < 1);
  const starRect = Number.isFinite(star.x) ? labelRect(star.x, star.y, "Regulus", 15, false) : null;
  assert(
    "lower-priority star yields (moved off the planet's slot or suppressed)",
    !starRect || !overlaps(planetRect, starRect),
    starRect ? `star at x=${star.x.toFixed(0)} y=${star.y.toFixed(0)}` : "suppressed"
  );
}

// ── 5. Moon/planet DISC reservations still keep labels off the artwork ────────────
{
  const d = DEVICES[0];
  const setup = chromeSetup(d.box, d.insets, DOCK_H, ALL_VISIBLE);
  const placer = makePlacer(d.box, setup);
  const mx = 215;
  const my = 500;
  placer.reserveCircle(mx, my, 40); // Moon disc up front (as the canvas does)
  const res = placer(mx, my, "Moon", 17);
  const discRect = { x: mx - 40, y: my - 40, w: 80, h: 80 };
  const ok = !Number.isFinite(res.x) || !overlaps(discRect, labelRect(res.x, res.y, "Moon", 17, false));
  assert("a reserved disc keeps its own label off the artwork", ok);
}

// ── 6. Suppression: when every candidate collides, the label is dropped (NaN) ──────
{
  const d = DEVICES[0];
  const setup = chromeSetup(d.box, d.insets, DOCK_H, ALL_VISIBLE);
  const placer = makePlacer(d.box, setup);
  // Reserve the entire usable interior so no candidate can be placed anywhere.
  placer.reserve(0, 0, d.box.width, d.box.height);
  const res = placer(215, 500, "Regulus", 15);
  assert("fully-blocked label is suppressed (NaN), never overlapped", !Number.isFinite(res.x));
}

// ── 7. Hidden chrome is not reserved (no needless suppression) ────────────────────
{
  const d = DEVICES[0];
  const none = chromeAvoidRects({ box: d.box, insets: d.insets, dockHeight: DOCK_H, visible: {} });
  assert("no visible chrome → no floating rects reserved", none.length === 0);
}

console.log("");
if (failed) {
  console.error(`Sky Lens label-avoidance self-test: ${failed} failure(s).`);
  process.exit(1);
}
console.log(
  "Sky Lens label-avoidance self-test passed: no label intersects UI chrome across devices/insets; precedence, disc reservations, and suppression all hold."
);
