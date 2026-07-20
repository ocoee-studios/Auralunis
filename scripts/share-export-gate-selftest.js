// Share Your Sky export premium-gate deterministic self-test.
//
// Product decision: building and previewing a share card is FREE; the export/share action is
// PREMIUM ("Share Your Sky exports and premium sharing"). The single outbound action is share(),
// which must paywall a non-entitled user before the native Share sheet is invoked. The entry
// (opening the Share screen) stays FREE — so the Sky card onPress must NOT be entitlement-gated.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));

const share = read("src/screens/SkyShareScreen.tsx");
const sky = read("src/screens/SkyScreen.tsx");

console.log("── Export is premium: share() paywalls before the native Share sheet ──");
const shareFnIdx = share.indexOf("async function share()");
eq("share() export action exists", shareFnIdx >= 0, true);
const nativeShareIdx = share.indexOf("Share.share(");
eq("native Share sheet call exists", nativeShareIdx >= 0, true);
// The premium guard must sit inside share(), BEFORE the native Share sheet call.
const guardIdx = share.indexOf("if (!isPremium) { openPaywall(); return; }");
eq("share() is premium-gated", guardIdx >= 0, true);
eq("the gate runs INSIDE share()", guardIdx > shareFnIdx, true);
eq("the gate runs BEFORE the native Share sheet", guardIdx < nativeShareIdx, true);
has(share, "useEntitlement()", "SkyShareScreen reads entitlement via useEntitlement");

console.log("\n── Creation/preview stays FREE: the entry is NOT entitlement-gated ──");
const cardIdx = sky.indexOf('actionLabel="Create Share Card"');
eq("the Share Your Sky card exists", cardIdx >= 0, true);
const cardRegion = cardIdx >= 0 ? sky.slice(cardIdx, cardIdx + 200) : "";
// Entry opens the screen directly (free) — no paywall on the entry onPress.
has(cardRegion, "setSkyShareOpen(true)", "the entry opens the Share screen (creation is free)");
if (cardRegion.includes("openPaywall")) bad("entry must NOT paywall — creation/preview is free");
else ok("entry does NOT paywall (creation/preview is free)");

console.log("\n── Canonical entitlement unchanged ──");
has(read("src/features/paywall/MonetizationCatalog.ts"), 'entitlement: "AuraLunis Premium"', "canonical entitlement unchanged");

console.log(`\nShare export premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
