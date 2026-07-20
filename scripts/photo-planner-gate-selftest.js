// Photo Planner premium-gate deterministic self-test.
//
// Product decision: Photo Planner is an ENTIRELY premium feature. A non-entitled user must never
// enter the planner or use any planner control — the tonight verdict, the gear/exposure settings,
// and the ranked target list must not render. Two layers enforce this:
//   1. Entry gate  — the "Photo Planner" Sky card paywalls non-entitled users (never opens it).
//   2. Screen guard — PhotoPlannerScreen early-returns a premium preview/gate for non-entitled
//                     users, so the planner UI is unreachable even if the screen is opened another way.
// The two-layer wiring is asserted by scanning source.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));
const hasnt = (hay, needle, n) => (!hay.includes(needle) ? ok(n) : bad(`${n} — should be absent: ${needle}`));

const sky = read("src/screens/SkyScreen.tsx");
const pp = read("src/screens/PhotoPlannerScreen.tsx");

console.log("── 1/2. Entry gate: non-entitled Sky card tap → paywall, never opens Photo Planner ──");
const cardIdx = sky.indexOf('actionLabel="Plan a Shoot"');
eq("the Photo Planner card exists", cardIdx >= 0, true);
const cardRegion = cardIdx >= 0 ? sky.slice(cardIdx, cardIdx + 320) : "";
has(cardRegion, "if (!isPremium) { openPaywall(); return; }", "non-entitled tap opens the paywall and does NOT open Photo Planner");
has(cardRegion, "setPhotoPlannerOpen(true)", "entitled users still open Photo Planner from the card (enter normally)");

console.log("\n── 3/4/5. Screen guard: planner controls unreachable for non-entitled ──");
const guardIdx = pp.indexOf("if (!isPremium) {");
eq("PhotoPlannerScreen has a screen-level !isPremium guard", guardIdx >= 0, true);
// The guard block = from the guard to the MAIN return (2-space indent). The guard's own return is
// deeper-indented, so this delimiter uniquely marks where the guard ends and the feature begins.
const mainReturnDelim = '  return (\n    <ScreenShell title="Photo Planner"';
const mainReturnIdx = pp.lastIndexOf(mainReturnDelim);
eq("the full feature has its own (main) return", mainReturnIdx > guardIdx, true);
const guardBlock = guardIdx >= 0 && mainReturnIdx > guardIdx ? pp.slice(guardIdx, mainReturnIdx) : "";
has(guardBlock, "PREMIUM FEATURE", "guard renders a premium preview/gate");
has(guardBlock, "openPaywall()", "guard's Unlock Premium opens the existing paywall");
// The guard must NOT render any part of the actual planner.
hasnt(guardBlock, "YOUR GEAR", "guard does NOT render the gear controls");
hasnt(guardBlock, "Focal length", "guard does NOT render the focal-length picker");
hasnt(guardBlock, "styles.verdict", "guard does NOT render the tonight verdict");
// The planner (verdict + gear + targets) exists ONLY past the guard — reached only when isPremium.
const gearIdx = pp.indexOf("YOUR GEAR");
const focalIdx = pp.indexOf("Focal length");
const verdictIdx = pp.indexOf("styles.verdict}");
eq("gear controls are only past the guard (premium-only)", gearIdx > guardIdx, true);
eq("focal-length picker is only past the guard (premium-only)", focalIdx > guardIdx, true);
eq("tonight verdict is only past the guard (premium-only)", verdictIdx > guardIdx, true);

console.log("\n── Entitlement uses the single 'AuraLunis Premium' source (no new string) ──");
has(pp, "useEntitlement()", "PhotoPlannerScreen reads entitlement via useEntitlement");
hasnt(pp, "auralunis_premium", "no snake_case entitlement string introduced");
has(read("src/features/paywall/MonetizationCatalog.ts"), 'entitlement: "AuraLunis Premium"', "canonical entitlement unchanged");

console.log("\n── No pricing / RevenueCat / entitlement / other-premium-feature behavior change ──");
const base = "9bb4053";
for (const f of [
  "src/features/paywall/MonetizationCatalog.ts",
  "src/services/RevenueCatService.ts",
  "src/context/EntitlementContext.tsx",
  "src/features/paywall/ThreeTierPaywallModal.tsx",
  "src/context/PaywallNavigationContext.tsx",
  "src/context/paywallRelay.ts",
  "src/screens/BirthSkyScreen.tsx",
  "src/screens/OrbitalAlignmentScreen.tsx",
  "src/screens/SettingsScreen.tsx",
]) {
  const changed = execSync(`git diff --name-only ${base} -- ${f} || true`, { cwd: ROOT }).toString().trim();
  eq(`untouched: ${f}`, changed, "");
}

console.log(`\nPhoto Planner premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
