const satellite = require("satellite.js");

// SGP4 regression smoke test. Confirms the satellite.js pipeline
// (twoline2satrec -> propagate -> eciToEcf -> ecfToLookAngles) produces finite
// look-angles for a known object/observer/time, and degrades safely on bad
// elements. Mirrors src/features/aura-pro/SatelliteFeedService.ts.

const observer = {
  longitude: satellite.degreesToRadians(-84.3835),
  latitude: satellite.degreesToRadians(35.0334),
  height: 0.46
};
const when = new Date("2026-05-30T02:00:00Z");

// Reference ISS element set (snapshot epoch — propagation is exact, position
// drifts with epoch age; tolerances below are intentionally loose).
const l1 = "1 25544U 98067A   24145.50000000  .00016717  00000-0  30000-3 0  9990";
const l2 = "2 25544  51.6400 200.0000 0006703  90.0000 270.0000 15.50000000    05";

let failed = 0;
function assert(label, ok) {
  if (ok) console.log("PASS", label);
  else { failed += 1; console.error("FAIL", label); }
}

const rec = satellite.twoline2satrec(l1, l2);
const pv = satellite.propagate(rec, when);
assert("propagate returns finite ECI position", !!(pv && pv.position) &&
  Number.isFinite(pv.position.x) && Number.isFinite(pv.position.y) && Number.isFinite(pv.position.z));

const gmst = satellite.gstime(when);
const ecf = satellite.eciToEcf(pv.position, gmst);
const look = satellite.ecfToLookAngles(observer, ecf);
const az = satellite.radiansToDegrees(look.azimuth);
const el = satellite.radiansToDegrees(look.elevation);
const range = look.rangeSat;

console.log(`ISS look-angles: az ${az.toFixed(1)} el ${el.toFixed(1)} range ${range.toFixed(0)} km`);
assert("azimuth finite and in range", Number.isFinite(az) && az >= 0 && az <= 360);
assert("elevation finite and in range", Number.isFinite(el) && el >= -90 && el <= 90);
assert("range plausible (LEO/MEO)", range > 100 && range < 50000);
assert("matches reference az ~102.4", Math.abs(az - 102.4) < 1.5);
assert("matches reference el ~-39.6", Math.abs(el - -39.6) < 1.5);

// Garbage elements must not crash and must yield a non-finite position.
const bad = satellite.twoline2satrec("1 00000U garbage", "2 00000 garbage");
const badPv = satellite.propagate(bad, when);
assert("bad elements degrade safely", !badPv || !badPv.position || !Number.isFinite(badPv.position.x));

console.log("");
if (failed) {
  console.error(`Satellite self-test: ${failed} failure(s).`);
  process.exit(1);
}
console.log("Satellite self-test passed: SGP4 look-angle pipeline is correct.");
