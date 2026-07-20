// Premium telemetry-mode gate deterministic self-test.
//
// Product decision: Train, Debris, Chain, Static, Re-Entry are PREMIUM telemetry modes; Fleet,
// Deep Space, Golden Hour, Meteor are free. A non-entitled user who selects a premium mode gets
// the PremiumModeGate/paywall and must NOT see that mode's content cards. The Chain and Debris
// info cards previously rendered without the entitlement guard the radar block already had.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));

const oa = read("src/screens/OrbitalAlignmentScreen.tsx");

console.log("── Premium-mode content cards are entitlement-guarded ──");
has(oa, '{mode === "chain" && (!isModeGated(mode) || isPremium) && (', "Chain content card is gated (no leak for non-entitled)");
has(oa, '{mode === "debris" && (!isModeGated(mode) || isPremium) && (', "Debris content card is gated (no leak for non-entitled)");

console.log("\n── Existing gates remain intact ──");
has(oa, '(!isModeGated(mode) || isPremium) && (', "radar block keeps its entitlement guard");
has(oa, '(!isModeGated("static") || isPremium)', "Static block keeps its entitlement guard");
has(oa, "isModeGated", "isModeGated gate helper still in use");

console.log("\n── The paywall path for gated modes still exists (PremiumModeGate) ──");
has(oa, "PremiumModeGate", "PremiumModeGate (paywall CTA) still rendered for gated modes");

// Premium modes must not fire their NON-VISUAL side-effects (audio / haptics / vibration) for a
// non-entitled user — only the upgrade gate shows. These are premium features in their own right.
console.log("\n── Premium-mode side-effects (audio/haptics) are entitlement-gated ──");
// Static = premium ionospheric audio: both audio effects bail when not static OR not premium.
const staticAudioGates = (oa.match(/mode !== "static" \|\| !isPremium/g) || []).length;
(staticAudioGates >= 2 ? ok : bad)(`Static ionospheric audio is gated on isPremium (${staticAudioGates}/2 audio effects)`);
// Re-Entry = premium: the decay-tick + urgent vibration only run when premium.
has(oa, 'mode !== "reentry" || !isPremium', "Re-Entry decay ticker + alert vibration are gated on isPremium");
// Haptics: premium modes (debris/reentry/train) gated; free modes (fleet/deep-space/meteor) stay free.
has(oa, '(mode === "debris" || mode === "reentry") && isPremium', "debris/reentry haptics gated on isPremium");
has(oa, 'mode === "train" && !premiumModeBlocked', "train haptics gated for non-entitled users");
// Free-mode haptics must remain ungated (no over-gating).
has(oa, 'mode === "fleet" || mode === "deep-space" || mode === "meteor"', "free-mode haptics (fleet/deep-space/meteor) stay ungated");

console.log(`\nTelemetry-mode premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
