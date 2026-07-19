// Time-zone / DST deterministic self-test.
//
// AuraLunis mixes two clocks that must never be conflated: absolute astronomical INSTANTS
// (always UTC) and LOCAL calendar concepts ("today"/"tonight", birth wall-clock). This runs a
// child Node process per IANA zone (Node reads TZ at startup, so Date + Intl use that zone)
// and asserts:
//   - localDateKey() uses the LOCAL calendar day (not UTC) — the bug that dropped tonight's
//     events/alerts for users far from Greenwich (Honolulu UTC-10 evening, Kiritimati UTC+14).
//   - a "tonight" event stays included on the correct local day.
//   - the astronomy INSTANT is identical across all display zones (positions never move).
//   - birth wall-clock -> UTC round-trips, incl. DST spring-forward gap / fall-back overlap.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const ZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Honolulu",
  "Pacific/Kiritimati"
];

// ─────────────────────────────── PARENT: fan out one process per zone ───────────────────────
if (!process.env.TZ_ZONE) {
  console.log(`Time-zone self-test — ${ZONES.length} zones (one isolated Node process each)\n`);
  let failed = 0;
  const astro = {};
  for (const zone of ZONES) {
    try {
      const out = execFileSync(process.execPath, [__filename], {
        env: { ...process.env, TZ: zone, TZ_ZONE: zone },
        encoding: "utf8"
      });
      process.stdout.write(out);
      const m = out.match(/^ASTRO:(.+)$/m);
      if (m) astro[zone] = m[1];
    } catch (e) {
      failed += 1;
      process.stdout.write((e.stdout || "") + `FAIL [${zone}] child process exited ${e.status}\n`);
    }
  }
  // Cross-zone invariance: the same UTC instant must yield identical az/alt in every zone.
  const vals = Object.values(astro);
  const invariant = vals.length === ZONES.length && vals.every((v) => v === vals[0]);
  console.log(invariant ? `PASS astronomy instant is identical across all ${ZONES.length} display zones — ${vals[0]}` : `FAIL astronomy instant varied by zone: ${JSON.stringify(astro)}`);
  if (!invariant) failed += 1;

  // BirthSkyScreen's DST/time-zone recovery copy must be user-facing (explains the DST cause;
  // no developer jargon like IANA / Intl / UTC / offset / the internal result codes).
  const bss = fs.readFileSync(path.join(SRC, "screens/BirthSkyScreen.tsx"), "utf8");
  const copies = [...bss.matchAll(/_COPY\s*=\s*"([\s\S]*?)";/g)].map((m) => m[1]).join("  ");
  const copyPresent = /daylight saving time/.test(copies) && copies.includes("sprang forward") && copies.includes("fell back");
  const noJargon = !/IANA|Intl|\bUTC\b|\bDST\b|offset|toISOString|-local-time/i.test(copies);
  console.log(copyPresent && noJargon ? "PASS birthplace DST/time-zone error copy is user-facing (no dev jargon)" : `FAIL birthplace DST/time-zone copy: present=${copyPresent} noJargon=${noJargon}`);
  if (!(copyPresent && noJargon)) failed += 1;

  console.log("");
  if (failed) {
    console.error(`Time-zone self-test: ${failed} failure(s).`);
    process.exit(1);
  }
  console.log(`Time-zone self-test passed: local-day keys, event inclusion, astronomy invariance, and birth conversion correct across ${ZONES.length} zones.`);
  process.exit(0);
}

// ─────────────────────────────── CHILD: assertions for one zone ─────────────────────────────
const ts = require(path.join(ROOT, "node_modules/typescript"));
const Module = require("module");

// Load .ts on require, transpiling to CommonJS (no type-check — behaviour isn't type-dependent).
require.extensions[".ts"] = function (module, filename) {
  const src = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: filename
  });
  module._compile(outputText, filename);
};
// Resolve the project's "@/..." alias to src/... (transpileModule doesn't apply tsconfig paths).
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    const base = path.resolve(SRC, request.slice(2));
    for (const cand of [base + ".ts", base + ".tsx", path.join(base, "index.ts")]) {
      if (fs.existsSync(cand)) return cand;
    }
  }
  return origResolve.call(this, request, ...rest);
};

const { localDateKey } = require(path.join(SRC, "utils/localDate.ts"));
const { resolveBirthMoment } = require(path.join(SRC, "utils/birthTime.ts"));
const { getUpcomingEvents, CELESTIAL_EVENTS } = require(path.join(SRC, "data/CelestialEvents.ts"));
const A = require(path.join(ROOT, "node_modules/astronomy-engine"));

const zone = process.env.TZ_ZONE;
let failed = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"} [${zone}] ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failed += 1;
};

// 1. Local calendar day: a Date built from LOCAL fields keys to that local day in every zone.
check("localDateKey(local 2026-07-18 23:30) = 2026-07-18", localDateKey(new Date(2026, 6, 18, 23, 30)) === "2026-07-18");
check("localDateKey(local 2026-07-19 00:30) = 2026-07-19", localDateKey(new Date(2026, 6, 19, 0, 30)) === "2026-07-19");

// 2. "Tonight" inclusion: an event dated = local-today stays in the upcoming list. Built from a
//    real event so the assertion exercises the shipping filter. (Under a UTC-day key this fails
//    in negative-offset zones — see the negative mutation.)
const E = [...CELESTIAL_EVENTS].sort((a, b) => a.date.localeCompare(b.date))[0];
const [ey, em, ed] = E.date.split("-").map(Number);
const tonight = new Date(ey, em - 1, ed, 23, 30); // 23:30 local on the event's day
check("event day-key resolves to the event's local date", localDateKey(tonight) === E.date, `${localDateKey(tonight)} vs ${E.date}`);
check("tonight's event is included in upcoming list", getUpcomingEvents(CELESTIAL_EVENTS.length, tonight).some((x) => x.id === E.id), E.date);

// 3. Astronomy INSTANT invariance: fixed UTC instant + observer -> az/alt (parent compares zones).
const inst = new Date("2026-07-18T22:00:00Z");
const obs = new A.Observer(37.3349, -122.009, 0);
const eq = A.Equator(A.Body.Jupiter, inst, obs, true, true);
const hz = A.Horizon(inst, obs, eq.ra, eq.dec, "normal");
console.log(`ASTRO:${hz.azimuth.toFixed(4)},${hz.altitude.toFixed(4)}`);

// 4. Birth wall-clock -> UTC round-trips in this zone (normal, non-DST-edge date).
const fmt = (d, tz) => {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const v = {};
  for (const x of p) if (x.type !== "literal") v[x.type] = x.value;
  return `${v.year}-${v.month}-${v.day} ${v.hour}:${v.minute}`;
};
const normal = resolveBirthMoment("1990-06-21", "13:35", zone);
check("birth 1990-06-21 13:35 is valid + round-trips in this zone", normal.kind === "valid" && fmt(normal.utc, zone) === "1990-06-21 13:35", normal.kind);

// 5. DST edges (explicit zones → process-zone-independent). Each transition: the spring-forward
//    skipped hour must be NONEXISTENT; the fall-back repeated hour must be AMBIGUOUS — never
//    silently coerced. Covers America/New_York, Europe/London, and Australia/Sydney (southern).
const DST_CASES = [
  { z: "America/New_York", gap: ["2021-03-14", "02:30"], overlap: ["2021-11-07", "01:30"] },
  { z: "Europe/London", gap: ["2021-03-28", "01:30"], overlap: ["2021-10-31", "01:30"] },
  { z: "Australia/Sydney", gap: ["2021-10-03", "02:30"], overlap: ["2021-04-04", "02:30"] }
];
for (const c of DST_CASES) {
  const g = resolveBirthMoment(c.gap[0], c.gap[1], c.z);
  check(`${c.z} spring-forward ${c.gap[1]} is rejected as nonexistent`, g.kind === "nonexistent-local-time", g.kind);
  const o = resolveBirthMoment(c.overlap[0], c.overlap[1], c.z);
  check(`${c.z} fall-back ${c.overlap[1]} is identified as ambiguous`, o.kind === "ambiguous-local-time", o.kind);
}

// 6. No-DST zones: the same "edge" wall time is just a normal, valid time.
check("Phoenix (no DST) 2021-03-14 02:30 is valid", resolveBirthMoment("2021-03-14", "02:30", "America/Phoenix").kind === "valid");
check("Tokyo (no DST) 2021-03-14 02:30 is valid", resolveBirthMoment("2021-03-14", "02:30", "Asia/Tokyo").kind === "valid");

// 7. Invalid zone → typed result (no throw, no guessed chart).
check("invalid time zone is reported as invalid-time-zone", resolveBirthMoment("1990-06-21", "13:35", "Not/AZone").kind === "invalid-time-zone");

if (failed) process.exit(1);
process.exit(0);
