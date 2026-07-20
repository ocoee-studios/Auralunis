// Encrypted Vault premium-gate deterministic self-test.
//
// Product decision: the Encrypted Vault is an ENTIRELY premium feature. A non-entitled user must
// never read their saved sky log. VaultScreen is a bottom-tab root (no caller to return to), so it
// renders a locked premium placeholder in place of the log; "Unlock Premium" opens the paywall.

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

const v = read("src/screens/VaultScreen.tsx");

console.log("── Screen guard: the sky log is unreachable for non-entitled ──");
const guardIdx = v.indexOf("if (!isPremium) {");
eq("VaultScreen has a screen-level !isPremium guard", guardIdx >= 0, true);
const mainReturnDelim = '  return (\n    <ScreenShell title="Vault" subtitle="Your Sky Log">';
const mainReturnIdx = v.lastIndexOf(mainReturnDelim);
eq("the full feature has its own (main) return", mainReturnIdx > guardIdx, true);
const guardBlock = guardIdx >= 0 && mainReturnIdx > guardIdx ? v.slice(guardIdx, mainReturnIdx) : "";
has(guardBlock, "PREMIUM FEATURE", "guard renders a premium placeholder");
has(guardBlock, "openPaywall()", "guard's Unlock Premium opens the existing paywall");
hasnt(guardBlock, "sorted.map", "guard does NOT render the saved-items list");
hasnt(guardBlock, "styles.count", "guard does NOT render the entry count / log");
// The log (list + count) exists ONLY past the guard — reached only when premium.
eq("saved-items list is only past the guard (premium-only)", v.indexOf("sorted.map") > guardIdx, true);
eq("entry count is only past the guard (premium-only)", v.indexOf("styles.count") > guardIdx, true);

console.log("\n── Entitlement uses the single 'AuraLunis Premium' source (no new string) ──");
has(v, "useEntitlement()", "VaultScreen reads entitlement via useEntitlement");
hasnt(v, "auralunis_premium", "no snake_case entitlement string introduced");
has(read("src/features/paywall/MonetizationCatalog.ts"), 'entitlement: "AuraLunis Premium"', "canonical entitlement unchanged");

console.log(`\nEncrypted Vault premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
