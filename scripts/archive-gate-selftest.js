// Celestial Archive premium-gate deterministic self-test.
//
// Product decision: the FULL Celestial Archive is PREMIUM. A non-entitled user must never browse
// the reference library. Two layers enforce this:
//   1. Entry gate  — the "Celestial Archive" Sky card paywalls non-entitled users (never opens it).
//   2. Screen guard — CelestialArchiveScreen early-returns a premium preview/gate for non-entitled
//                     users, so the library is unreachable even if the screen is opened another way.

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
const ar = read("src/screens/CelestialArchiveScreen.tsx");

console.log("── 1/2. Entry gate: non-entitled Sky card tap → paywall, never opens the Archive ──");
const cardIdx = sky.indexOf('actionLabel="Open Archive"');
eq("the Celestial Archive card exists", cardIdx >= 0, true);
const cardRegion = cardIdx >= 0 ? sky.slice(cardIdx, cardIdx + 320) : "";
has(cardRegion, "if (!isPremium) { openPaywall(); return; }", "non-entitled tap opens the paywall and does NOT open the Archive");
has(cardRegion, "setArchiveOpen(true)", "entitled users still open the Archive from the card (enter normally)");

console.log("\n── 3/4/5. Screen guard: reference library unreachable for non-entitled ──");
const guardIdx = ar.indexOf("if (!isPremium) {");
eq("CelestialArchiveScreen has a screen-level !isPremium guard", guardIdx >= 0, true);
const mainReturnDelim = '  return (\n    <ScreenShell title="Celestial Archive" subtitle="Reference"';
const mainReturnIdx = ar.lastIndexOf(mainReturnDelim);
eq("the full feature has its own (main) return", mainReturnIdx > guardIdx, true);
const guardBlock = guardIdx >= 0 && mainReturnIdx > guardIdx ? ar.slice(guardIdx, mainReturnIdx) : "";
has(guardBlock, "PREMIUM FEATURE", "guard renders a premium preview/gate");
has(guardBlock, "openPaywall()", "guard's Unlock Premium opens the existing paywall");
hasnt(guardBlock, "sections.map", "guard does NOT render the section list");
hasnt(guardBlock, "styles.intro", "guard does NOT render the library intro/browse view");
// The browse list exists ONLY past the guard — reached only when premium.
const listIdx = ar.indexOf("sections.map");
const introIdx = ar.indexOf("styles.intro");
eq("section list is only past the guard (premium-only)", listIdx > guardIdx, true);
eq("library browse view is only past the guard (premium-only)", introIdx > guardIdx, true);

console.log("\n── Entitlement uses the single 'AuraLunis Premium' source (no new string) ──");
has(ar, "useEntitlement()", "CelestialArchiveScreen reads entitlement via useEntitlement");
hasnt(ar, "auralunis_premium", "no snake_case entitlement string introduced");
has(read("src/features/paywall/MonetizationCatalog.ts"), 'entitlement: "AuraLunis Premium"', "canonical entitlement unchanged");

console.log(`\nCelestial Archive premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
