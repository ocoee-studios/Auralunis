// Orion / M42 deterministic render test.
//
// "Orion isn't landing" can mean four different things — not selected, wrong position,
// too small, or too faint — and you cannot tell them apart by waving a phone at the sky.
// This pins the observer, the clock and the pointing, then runs the SAME selection and
// sizing math as NebulaImageLayer.tsx and asserts the result.
//
// Keep in sync with:
//   src/features/sky-lens/layers/NebulaImageLayer.tsx  (caps, scale, veil)
//   src/features/sky-lens/ar/SkyLensProjection.ts      (projectTarget)
//   src/features/sky-lens/data/nebulae.ts              (m42 RA/Dec/radius)

const Astronomy = require("astronomy-engine");

// ── mirrors SkyLensProjection.projectTarget ─────────────────────────────────────
const toRad = (d) => (d * Math.PI) / 180;
const signed = (d) => ((((d + 180) % 360) + 360) % 360) - 180;

function projectTarget(pointing, az, alt, fov, box) {
  const dAz = signed(az - pointing.azimuthDegrees);
  const dAlt = alt - pointing.altitudeDegrees;
  const meanAlt = (alt + pointing.altitudeDegrees) / 2;
  const h = dAz * Math.cos(toRad(Math.max(-89, Math.min(89, meanAlt))));
  const v = dAlt;
  const r = toRad(pointing.rollDegrees);
  const hRot = h * Math.cos(r) + v * Math.sin(r);
  const vRot = -h * Math.sin(r) + v * Math.cos(r);
  const halfH = fov.horizontalDegrees / 2;
  const halfV = fov.verticalDegrees / 2;
  const x = box.width / 2 + (hRot / halfH) * (box.width / 2);
  const y = box.height / 2 - (vRot / halfV) * (box.height / 2);
  const behind = Math.abs(dAz) > 90;
  const onScreen = !behind && x >= 0 && x <= box.width && y >= 0 && y <= box.height;
  return { x, y, behind, onScreen };
}

// ── mirrors NebulaImageLayer ────────────────────────────────────────────────────
const M42 = { id: "m42", raHours: 5.588, decDegrees: -5.39, radius: 27, type: "emission" };
const M42_SCALE = 1.55;
const MIN_BASE = 14;
const MAX_BASE_HERO = 44;
const MAX_OUTER_FRAC_HERO = 0.15;
const OUTER_VEIL = 1.5;
const UI_TOP = 150;
const HERO_GROUP_OPACITY = 0.82;
const HERO_WARM_PEAK = 0.52;

// iPhone 16 Pro Max, in points.
const BOX = { width: 430, height: 932 };
const FOV = { horizontalDegrees: 63, verticalDegrees: 110 };
const UI_BOTTOM = 104; // compact dock + safe area + pad
const TARGET_MIN_W = 90;
const TARGET_MAX_W = 140;

// Deterministic scene: Orion high in the south on a January evening.
const OBSERVER = { lat: 37.3349, lon: -122.009, elev: 0 };
const WHEN = new Date("2026-01-15T22:00:00-08:00");

let failed = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failed += 1;
};

const observer = new Astronomy.Observer(OBSERVER.lat, OBSERVER.lon, OBSERVER.elev);
const hz = Astronomy.Horizon(WHEN, observer, M42.raHours, M42.decDegrees, "normal");
const az = hz.azimuth;
const alt = hz.altitude;

console.log("Orion / M42 deterministic render test");
console.log(`  observer  : ${OBSERVER.lat}, ${OBSERVER.lon}`);
console.log(`  when      : ${WHEN.toISOString()}`);
console.log(`  M42 RA/Dec: ${M42.raHours}h / ${M42.decDegrees}°  (Orion's sword)`);
console.log(`  M42 az/alt: ${az.toFixed(2)}° / ${alt.toFixed(2)}°`);
console.log("");

check("M42 is above the horizon in this scene", alt > 0, `alt ${alt.toFixed(2)}°`);

// Point the device straight at it — the "comfortably in view" case.
const pointing = { azimuthDegrees: az, altitudeDegrees: alt, rollDegrees: 0 };
const p = projectTarget(pointing, az, alt, FOV, BOX);

check("projects on-screen", p.onScreen && !p.behind, `x ${p.x.toFixed(0)}, y ${p.y.toFixed(0)}`);
check(
  "lands at screen centre when pointed at",
  Math.abs(p.x - BOX.width / 2) < 1 && Math.abs(p.y - BOX.height / 2) < 1,
  `x ${p.x.toFixed(1)} (want ${BOX.width / 2}), y ${p.y.toFixed(1)} (want ${BOX.height / 2})`
);
check("clears the top HUD", p.y >= UI_TOP, `y ${p.y.toFixed(0)} >= ${UI_TOP}`);
check("clears the bottom dock", p.y <= BOX.height - UI_BOTTOM, `y ${p.y.toFixed(0)} <= ${BOX.height - UI_BOTTOM}`);

// Hero sizing.
const maxOuter = BOX.width * MAX_OUTER_FRAC_HERO;
const scaled = M42.radius * M42_SCALE;
const clamped = Math.max(MIN_BASE, Math.min(MAX_BASE_HERO, scaled));
const base = Math.min(clamped, maxOuter / OUTER_VEIL);
const widthPx = base * OUTER_VEIL * 2;
const heightPx = base * 0.84 * OUTER_VEIL * 2;

console.log("");
console.log(`  base radius : ${base.toFixed(1)}px  (scaled ${scaled.toFixed(1)} → clamp ${clamped.toFixed(1)} → cap ${(maxOuter / OUTER_VEIL).toFixed(1)})`);
console.log(`  apparent    : ${widthPx.toFixed(0)} x ${heightPx.toFixed(0)} px`);
console.log(`  peak alpha  : ${(HERO_GROUP_OPACITY * HERO_WARM_PEAK).toFixed(2)}`);
console.log("");

check(
  `apparent width is ${TARGET_MIN_W}–${TARGET_MAX_W}px`,
  widthPx >= TARGET_MIN_W && widthPx <= TARGET_MAX_W,
  `${widthPx.toFixed(0)}px`
);
check("peak alpha is visible over the Milky Way (>= 0.35)", HERO_GROUP_OPACITY * HERO_WARM_PEAK >= 0.35);
check("peak alpha stays translucent (<= 0.55)", HERO_GROUP_OPACITY * HERO_WARM_PEAK <= 0.55);
check("M42 is an emission nebula (cloud renderer, not the cluster renderer)", M42.type === "emission");

// ── PLACEMENT: is it actually in the SWORD? ─────────────────────────────────────
// A nebula rendered at the right size but the wrong place is still a bug. Orion's belt
// runs through Dec ~-1°; the sword hangs BELOW it.
//
// Real separations (checked against the catalogue, not from memory — my first pass at this
// test asserted M42→Rigel > 8° and it FAILED, because the true figure is ~5.9°. The data
// was right and the assertion was wrong):
//   M42 → Betelgeuse (shoulder) ≈ 13.7°
//   M42 → Rigel      (foot)     ≈  5.9°
//   M42 → Alnilam    (belt)     ≈  4.2°   ← and M42 must sit BELOW it
const BETELGEUSE = { ra: 5.9195, dec: 7.4071 };
const RIGEL = { ra: 5.2423, dec: -8.2016 };
const ALNILAM = { ra: 5.6036, dec: -1.2019 }; // centre star of the belt

function sepDeg(a, b) {
  const r1 = toRad(a.ra * 15), d1 = toRad(a.dec);
  const r2 = toRad(b.ra * 15), d2 = toRad(b.dec);
  const c = Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(r1 - r2);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}
const m42pt = { ra: M42.raHours, dec: M42.decDegrees };
const dBet = sepDeg(m42pt, BETELGEUSE);
const dRig = sepDeg(m42pt, RIGEL);
const dBelt = sepDeg(m42pt, ALNILAM);

console.log(`  M42 → Betelgeuse: ${dBet.toFixed(1)}°   M42 → Rigel: ${dRig.toFixed(1)}°   M42 → belt: ${dBelt.toFixed(1)}°`);
console.log("");

check("M42 is well away from Betelgeuse (not on the shoulder)", dBet > 8 && dBet < 16, `${dBet.toFixed(1)}°`);
check("M42 is distinct from Rigel (not on the foot)", dRig > 4 && dRig < 9, `${dRig.toFixed(1)}°`);
check("M42 is close to, and BELOW, the belt (the sword)", dBelt < 6 && M42.decDegrees < ALNILAM.dec, `${dBelt.toFixed(1)}° from Alnilam, dec ${M42.decDegrees}° < ${ALNILAM.dec}°`);

// Below-horizon must reject.
const belowWhen = new Date("2026-01-15T10:00:00-08:00"); // Orion below the horizon
const hzBelow = Astronomy.Horizon(belowWhen, observer, M42.raHours, M42.decDegrees, "normal");
check(
  "below the horizon → not rendered",
  hzBelow.altitude <= 0,
  `alt ${hzBelow.altitude.toFixed(2)}° at 10:00 → rejected by the alt <= 0 rule`
);

console.log("");
if (failed > 0) {
  console.log(`Orion self-test FAILED: ${failed} check(s).`);
  process.exit(1);
}
console.log("Orion self-test passed: M42 is selected, centred, correctly sized and visible.");
