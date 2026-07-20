// Aura Pro panels premium-gate deterministic self-test.
//
// Product decision: "Aura Pro Satellite Thermal" and "Aura Pro Astrophoto Predictor" are PREMIUM.
// Both panels render inline on the Sky tab; each now self-gates — a non-entitled user sees a locked
// teaser (never the interactive overlay / predictor), and Unlock opens the existing paywall.

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

function checkPanel(rel, label, contentMarker) {
  console.log(`\n── ${label} ──`);
  const src = read(rel);
  const guardIdx = src.indexOf("if (!isPremium) {");
  eq(`${label}: has a !isPremium guard`, guardIdx >= 0, true);
  const mainReturnIdx = src.lastIndexOf("  return (\n    <View style={styles.panel}>");
  eq(`${label}: has its own (main) return`, mainReturnIdx > guardIdx, true);
  const guardBlock = guardIdx >= 0 && mainReturnIdx > guardIdx ? src.slice(guardIdx, mainReturnIdx) : "";
  has(guardBlock, "PREMIUM FEATURE", `${label}: guard renders a premium teaser`);
  has(guardBlock, "openPaywall", `${label}: guard's Unlock opens the paywall`);
  hasnt(guardBlock, contentMarker, `${label}: guard does NOT render the interactive content`);
  eq(`${label}: interactive content is only past the guard`, src.indexOf(contentMarker) > guardIdx, true);
  has(src, "useEntitlement()", `${label}: reads entitlement via useEntitlement`);
  hasnt(src, "auralunis_premium", `${label}: no snake_case entitlement string`);
}

checkPanel("src/features/aura-pro/SatelliteThermalOverlayPanel.tsx", "Aura Pro Satellite Thermal", "styles.modeRow");
checkPanel("src/features/aura-pro/AstrophotographyPredictorPanel.tsx", "Aura Pro Astrophoto Predictor", "styles.scenarioRow");

console.log("\n── Canonical entitlement unchanged ──");
has(read("src/features/paywall/MonetizationCatalog.ts"), 'entitlement: "AuraLunis Premium"', "canonical entitlement unchanged");

console.log(`\nAura Pro panels premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
