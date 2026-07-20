// Astro Weather premium-gate deterministic self-test.
//
// Product decision: Astro Weather is a PREMIUM feature. A non-entitled user must never see
// tonight's verdict or the hour-by-hour forecast. Two layers enforce this:
//   1. Entry gate  — the "Astro Weather" Sky card paywalls non-entitled users (never opens it).
//   2. Screen guard — AstroWeatherScreen early-returns a premium preview/gate for non-entitled
//                     users, so the forecast is unreachable even if the screen is opened another way.
//
// NOTE: this test intentionally does NOT assert a hardcoded-base git "untouched files" list —
// that pattern rots as sibling premium-gate PRs legitimately touch listed files (see PR #185).
// Scope is guarded by the canonical-entitlement assertion below plus qa:all + PR review.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));
const hasnt = (hay, needle, n) => (!hay.includes(needle) ? ok(n) : bad(`${n} — should be absent: ${needle}`));

const sky = read("src/screens/SkyScreen.tsx");
const aw = read("src/screens/AstroWeatherScreen.tsx");

console.log("── 1/2. Entry gate: non-entitled Sky card tap → paywall, never opens Astro Weather ──");
const cardIdx = sky.indexOf('actionLabel="Check Tonight\'s Sky"');
eq("the Astro Weather card exists", cardIdx >= 0, true);
const cardRegion = cardIdx >= 0 ? sky.slice(cardIdx, cardIdx + 320) : "";
has(cardRegion, "if (!isPremium) { openPaywall(); return; }", "non-entitled tap opens the paywall and does NOT open Astro Weather");
has(cardRegion, "setAstroWeatherOpen(true)", "entitled users still open Astro Weather from the card (enter normally)");

console.log("\n── 3/4/5. Screen guard: forecast unreachable for non-entitled ──");
const guardIdx = aw.indexOf("if (!isPremium) {");
eq("AstroWeatherScreen has a screen-level !isPremium guard", guardIdx >= 0, true);
const mainReturnDelim = '  return (\n    <ScreenShell title="Astro Weather" subtitle="Tonight"';
const mainReturnIdx = aw.lastIndexOf(mainReturnDelim);
eq("the full feature has its own (main) return", mainReturnIdx > guardIdx, true);
const guardBlock = guardIdx >= 0 && mainReturnIdx > guardIdx ? aw.slice(guardIdx, mainReturnIdx) : "";
has(guardBlock, "PREMIUM FEATURE", "guard renders a premium preview/gate");
has(guardBlock, "openPaywall()", "guard's Unlock Premium opens the existing paywall");
// The guard must NOT render any part of the actual forecast.
hasnt(guardBlock, "Reading tonight's sky", "guard does NOT render the forecast loading/content");
hasnt(guardBlock, "styles.verdictCard", "guard does NOT render the verdict card");
// The forecast (loading + verdict + hourly) exists ONLY past the guard — reached only when premium.
const loadingIdx = aw.indexOf("Reading tonight's sky");
const verdictIdx = aw.indexOf("styles.verdictCard");
eq("forecast loading is only past the guard (premium-only)", loadingIdx > guardIdx, true);
eq("verdict card is only past the guard (premium-only)", verdictIdx > guardIdx, true);

console.log("\n── Entitlement uses the single 'AuraLunis Premium' source (no new string) ──");
has(aw, "useEntitlement()", "AstroWeatherScreen reads entitlement via useEntitlement");
hasnt(aw, "auralunis_premium", "no snake_case entitlement string introduced");
has(read("src/features/paywall/MonetizationCatalog.ts"), 'entitlement: "AuraLunis Premium"', "canonical entitlement unchanged");

console.log(`\nAstro Weather premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
