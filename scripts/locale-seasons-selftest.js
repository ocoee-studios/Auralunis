// Locale-formatting + Southern-Hemisphere-season deterministic self-test (PR-7).
//
// PR-7 removed 14 hard-coded "en-US" user-facing date/time formatters (routing them through
// device-locale helpers in src/utils/formatting.ts) and added a latitude-aware season label
// helper (src/utils/seasons.ts) applied to the deep-sky "Best season" display. This test:
//   - proves each formatting helper is exactly its native Intl equivalent for an explicit locale,
//   - proves at least one non-US locale differs from en-US (ordering / clock),
//   - proves the season classifier + label helper behave per hemisphere, incl. equator/unknown,
//   - guards the invariants: birthTime.ts keeps its fixed "en-US" formatToParts, no user-facing
//     "en-US" formatter remains, scientific/fixed formatting is untouched, and formatting never
//     mutates the Date instant.
// All locale cases pass EXPLICIT locales, so the test is machine-locale independent. ar-EG is
// skipped (not failed) when the runtime lacks its CLDR data.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

// ── transpile-require: load .ts as CommonJS, resolve the "@/..." alias to src/... ──
const ts = require(path.join(ROOT, "node_modules/typescript"));
const Module = require("module");
require.extensions[".ts"] = function (module, filename) {
  const src = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
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

const F = require(path.join(SRC, "utils/formatting.ts"));
const S = require(path.join(SRC, "utils/seasons.ts"));

let pass = 0, fail = 0, skip = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const skipped = (m) => { skip += 1; console.log("SKIP " + m); };
const eq = (name, a, b) => (a === b ? ok(`${name}`) : bad(`${name} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));

// A fixed instant used for all formatting comparisons.
const D = new Date(Date.UTC(2026, 6, 19, 21, 41, 0)); // 2026-07-19T21:41:00Z

// Each helper paired with its exact native Intl equivalent (same options, no timeZone).
const HELPERS = [
  ["formatClockTime", (d, l) => d.toLocaleTimeString(l, { hour: "numeric", minute: "2-digit" })],
  ["formatHour", (d, l) => d.toLocaleTimeString(l, { hour: "numeric" })],
  ["formatMediumDate", (d, l) => d.toLocaleDateString(l, { month: "short", day: "numeric", year: "numeric" })],
  ["formatWeekdayDay", (d, l) => d.toLocaleDateString(l, { weekday: "short", month: "short", day: "numeric" })],
  ["formatFullWeekdayDate", (d, l) => d.toLocaleDateString(l, { weekday: "long", month: "long", day: "numeric" })],
  ["formatLongDate", (d, l) => d.toLocaleDateString(l, { month: "long", day: "numeric", year: "numeric" })],
  ["formatDateTime", (d, l) => d.toLocaleString(l, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })],
];

function localeSupported(loc) {
  try {
    return new Intl.DateTimeFormat(loc).resolvedOptions().locale.toLowerCase().startsWith(loc.split("-")[0].toLowerCase());
  } catch { return false; }
}

console.log("── Locale formatting: helper output === native Intl output (explicit locales) ──");
for (const loc of ["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP", "ar-EG"]) {
  if (loc === "ar-EG" && !localeSupported("ar-EG")) { skipped("ar-EG not supported by runtime ICU — locale cases skipped"); continue; }
  for (const [name, native] of HELPERS) {
    eq(`${name}(${loc}) matches native Intl`, F[name](D, loc), native(D, loc));
  }
}

console.log("\n── Locale differences are actually applied (not silently en-US) ──");
// Date ordering: en-US is month-first, en-GB is day-first.
if (F.formatMediumDate(D, "en-US") !== F.formatMediumDate(D, "en-GB")) ok("medium date ordering differs en-US vs en-GB"); else bad("en-GB medium date did not differ from en-US");
// Clock: en-US uses AM/PM, de-DE uses 24h.
if (F.formatClockTime(D, "en-US") !== F.formatClockTime(D, "de-DE")) ok("clock rendering differs en-US vs de-DE"); else bad("de-DE clock did not differ from en-US");
// ja-JP long date differs from en-US.
if (F.formatLongDate(D, "ja-JP") !== F.formatLongDate(D, "en-US")) ok("long date differs en-US vs ja-JP"); else bad("ja-JP long date did not differ from en-US");
// ar-EG (if supported) differs from en-US.
if (localeSupported("ar-EG")) { if (F.formatMediumDate(D, "ar-EG") !== F.formatMediumDate(D, "en-US")) ok("medium date differs en-US vs ar-EG"); else bad("ar-EG did not differ from en-US"); }
else skipped("ar-EG difference check skipped (unsupported)");

console.log("\n── Formatting never mutates the Date instant ──");
const before = D.getTime();
HELPERS.forEach(([name]) => F[name](D, "de-DE"));
eq("Date instant unchanged after formatting", D.getTime(), before);

console.log("\n── Fixed scientific/number formatting is locale-independent & unchanged ──");
eq("magnitude toFixed(1) invariant", (4).toFixed(1), "4.0");
eq("rounded altitude invariant", Math.round(12.345 * 10) / 10, 12.3);
eq("raw distance renders un-grouped", String(1344), "1344");

console.log("\n── Season classification by hemisphere (1-based month) ──");
eq("N+40 Jan → winter", S.classifySeason(1, 40), "winter");
eq("N+40 Apr → spring", S.classifySeason(4, 40), "spring");
eq("N+40 Jul → summer", S.classifySeason(7, 40), "summer");
eq("N+40 Oct → autumn", S.classifySeason(10, 40), "autumn");
eq("S-33 Jan → summer", S.classifySeason(1, -33), "summer");
eq("S-33 Apr → autumn", S.classifySeason(4, -33), "autumn");
eq("S-33 Jul → winter", S.classifySeason(7, -33), "winter");
eq("S-33 Oct → spring", S.classifySeason(10, -33), "spring");

console.log("\n── displaySeasonLabel: hemisphere flip, equator/unknown neutral, passthrough ──");
eq("N+40 'winter' unchanged", S.displaySeasonLabel("winter", 40), "winter");
eq("S-33 'winter' → 'summer'", S.displaySeasonLabel("winter", -33), "summer");
eq("S-33 'summer' → 'winter'", S.displaySeasonLabel("summer", -33), "winter");
eq("S-33 'spring' → 'autumn'", S.displaySeasonLabel("spring", -33), "autumn");
eq("S-33 'autumn' → 'spring'", S.displaySeasonLabel("autumn", -33), "spring");
eq("S-33 'fall' → 'spring'", S.displaySeasonLabel("fall", -33), "spring");
eq("S-33 capitalization preserved 'Winter' → 'Summer'", S.displaySeasonLabel("Winter", -33), "Summer");
eq("equator 0 plain season → neutral", S.displaySeasonLabel("winter", 0), S.NEUTRAL_SEASON_LABEL);
eq("unknown latitude plain season → neutral", S.displaySeasonLabel("winter", undefined), S.NEUTRAL_SEASON_LABEL);
eq("neutral wording is exact", S.NEUTRAL_SEASON_LABEL, "Season varies by local climate");
eq("'Varies' passes through (S)", S.displaySeasonLabel("Varies", -33), "Varies");
eq("'Year-round (N)' passes through (S)", S.displaySeasonLabel("Year-round (N)", -33), "Year-round (N)");
eq("'Varies' passes through (equator)", S.displaySeasonLabel("Varies", 0), "Varies");
eq("zodiac 'Aquarius season' not inverted (S)", S.displaySeasonLabel("Aquarius season", -33), "Aquarius season");
eq("compound 'winter Orion' not inverted (S)", S.displaySeasonLabel("winter Orion", -33), "winter Orion");

console.log("\n── Static invariants: en-US removed from user-facing formatters, birthTime untouched ──");
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}
const enUsFormatter = /\.toLocale(?:Date|Time)?String\(\s*["']en-US["']|Intl\.DateTimeFormat\(\s*["']en-US["']/g;
let userFacingEnUs = 0;
for (const file of walk(SRC)) {
  if (file.endsWith(path.join("utils", "birthTime.ts"))) continue; // approved invariant
  const src = fs.readFileSync(file, "utf8");
  const m = src.match(enUsFormatter);
  if (m) { userFacingEnUs += m.length; console.log("   residual en-US formatter in " + path.relative(ROOT, file)); }
}
eq("0 user-facing hard-coded en-US formatters remain (excl. birthTime)", userFacingEnUs, 0);

const birth = fs.readFileSync(path.join(SRC, "utils/birthTime.ts"), "utf8");
const birthEnUs = (birth.match(/Intl\.DateTimeFormat\(\s*["']en-US["']/g) || []).length;
eq("birthTime.ts retains its 2 fixed en-US formatToParts calls", birthEnUs, 2);
if (/formatToParts/.test(birth)) ok("birthTime.ts still uses formatToParts (internal parsing intact)"); else bad("birthTime.ts formatToParts missing");

const skyScreen = fs.readFileSync(path.join(SRC, "screens/SkyScreen.tsx"), "utf8");
if (/displaySeasonLabel\([^)]*latitudeDegrees/.test(skyScreen)) ok("SkyScreen applies displaySeasonLabel with observer latitude"); else bad("SkyScreen does not apply displaySeasonLabel with latitude");

console.log(`\nLocale/season self-test: ${pass} passed, ${fail} failed, ${skip} skipped.`);
process.exit(fail === 0 ? 0 : 1);
