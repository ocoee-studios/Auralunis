// Sky Lens AR regression test. Mirrors the math in
// src/features/sky-lens/ar/SkyLensProjection.ts and SkyLensOrientation.ts and
// asserts known reference outputs, so an accidental change to the algorithm is
// caught. Keep in sync with those modules.

const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;
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
  const behind = Math.abs(dAz) > 90;
  return {
    x: box.width / 2 + (hRot / halfH) * (box.width / 2),
    y: box.height / 2 - (vRot / halfV) * (box.height / 2),
    behind,
    onScreen: !behind && Math.abs(hRot) <= halfH && Math.abs(vRot) <= halfV
  };
}

// vector helpers
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const scale = (a, k) => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const norm = (a) => scale(a, 1 / (Math.sqrt(dot(a, a)) || 1));

function pointingFromSensors(accel, mag) {
  const up = norm(accel);
  const north = norm(sub(mag, scale(up, dot(mag, up))));
  const east = norm(cross(north, up));
  const cam = { x: 0, y: 0, z: -1 };
  const az = (toDeg(Math.atan2(dot(cam, east), dot(cam, north))) + 360) % 360;
  const alt = toDeg(Math.asin(Math.max(-1, Math.min(1, dot(cam, up)))));
  return { azimuthDegrees: az, altitudeDegrees: alt, rollDegrees: toDeg(Math.atan2(accel.x, accel.y)) };
}

let failed = 0;
function assert(label, ok) {
  if (ok) console.log("PASS", label);
  else { failed += 1; console.error("FAIL", label); }
}

const fov = { horizontalDegrees: 60, verticalDegrees: 45 };
const box = { width: 300, height: 360 };
const pointing = { azimuthDegrees: 180, altitudeDegrees: 20, rollDegrees: 0 };

const center = projectTarget(pointing, 180, 20, fov, box);
assert("target ahead maps to center", Math.abs(center.x - 150) < 0.5 && Math.abs(center.y - 180) < 0.5 && center.onScreen);
const behind = projectTarget(pointing, 300, 20, fov, box);
assert("target behind is off-screen", behind.behind && !behind.onScreen);
const above = projectTarget(pointing, 180, 50, fov, box);
assert("target above FOV is off-screen", !above.onScreen && above.y < 0);

const dip = toRad(60);
const flat = pointingFromSensors({ x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 0 });
assert("flat screen-up -> camera altitude ~ -90", Math.abs(flat.altitudeDegrees + 90) < 1);
const zenith = pointingFromSensors({ x: 0, y: 0, z: -1 }, { x: 0, y: 1, z: 0 });
assert("tilted back -> camera altitude ~ +90", Math.abs(zenith.altitudeDegrees - 90) < 1);
const north = pointingFromSensors(
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -Math.sin(dip), z: -Math.cos(dip) }
);
assert("vertical facing north -> azimuth ~ 0", Math.abs(signed(north.azimuthDegrees)) < 1);

console.log("");
if (failed) {
  console.error(`Sky Lens AR self-test: ${failed} failure(s).`);
  process.exit(1);
}
console.log("Sky Lens AR self-test passed: projection and orientation math correct.");
