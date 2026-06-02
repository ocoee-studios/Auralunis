const Astronomy = require("astronomy-engine");

// Ephemeris regression smoke test. Asserts the astronomy-engine integration
// produces known reference positions for a fixed place and time, so a library
// upgrade or a wrong API call is caught in CI. Mirrors the calls in
// src/features/sky-lens/ephemeris/SkyEphemerisService.ts.

const observer = new Astronomy.Observer(35.0334, -84.3835, 460); // Ducktown, TN
const when = new Date("2026-05-30T02:00:00Z"); // ~10:00 PM EDT
const TOL = 0.05; // degrees

const expected = {
  Sun: { az: 309.55, alt: -13.15, visible: false },
  Moon: { az: 143.02, alt: 20.42, visible: true },
  Mercury: { az: 300.76, alt: 1.47, visible: true },
  Venus: { az: 289.99, alt: 14.88, visible: true },
  Mars: { az: 331.81, alt: -36.26, visible: false },
  Jupiter: { az: 281.76, alt: 22.16, visible: true },
  Saturn: { az: 2.01, alt: -51.98, visible: false }
};

let failed = 0;

for (const [name, want] of Object.entries(expected)) {
  const eq = Astronomy.Equator(Astronomy.Body[name], when, observer, true, true);
  const hor = Astronomy.Horizon(when, observer, eq.ra, eq.dec, "normal");
  const azOk = Math.abs(hor.azimuth - want.az) <= TOL;
  const altOk = Math.abs(hor.altitude - want.alt) <= TOL;
  const visOk = hor.altitude > 0 === want.visible;

  if (azOk && altOk && visOk) {
    console.log(`PASS ${name} (az ${hor.azimuth.toFixed(2)}, alt ${hor.altitude.toFixed(2)})`);
  } else {
    failed += 1;
    console.error(
      `FAIL ${name}: got az ${hor.azimuth.toFixed(2)} alt ${hor.altitude.toFixed(2)} ` +
        `visible ${hor.altitude > 0}; want az ${want.az} alt ${want.alt} visible ${want.visible}`
    );
  }
}

console.log("");
if (failed) {
  console.error(`Ephemeris self-test: ${failed} failure(s).`);
  process.exit(1);
}
console.log("Ephemeris self-test passed: live positions match reference values.");
