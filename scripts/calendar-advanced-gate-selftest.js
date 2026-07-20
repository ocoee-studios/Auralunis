// Celestial Calendar advanced-details premium-gate deterministic self-test.
//
// Product decision (partial gate): BASIC browsing is free — the event list, names, dates, rating,
// and description. The ADVANCED details (best time, where to look, moon interference) are PREMIUM.
// A non-entitled user sees a locked pill (opens the paywall) instead of the detail chips. The
// entry ("Open Calendar") stays free — the Sky card must NOT be entitlement-gated.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));

const cal = read("src/screens/CelestialCalendarScreen.tsx");
const sky = read("src/screens/SkyScreen.tsx");

console.log("── Advanced details are premium; basic browsing is free ──");
has(cal, "useEntitlement()", "Calendar reads entitlement via useEntitlement");
const gateIdx = cal.indexOf("{isPremium ? (");
eq("advanced details are behind an isPremium branch", gateIdx >= 0, true);
const metaIdx = cal.indexOf("styles.metaRow");
const lockedIdx = cal.indexOf("styles.lockedMeta");
// The detail chips (metaRow) render only in the premium branch; a locked pill is the free fallback.
eq("detail chips (metaRow) are inside the premium branch", metaIdx > gateIdx, true);
eq("a locked pill exists for non-entitled users", lockedIdx >= 0, true);
has(cal, "onUpgrade()", "locked pill opens the paywall (onUpgrade)");
has(cal, "isPremium={isPremium} onUpgrade={openPaywall}", "EventRow receives entitlement + upgrade callback");

// Basic content (name/description) is rendered BEFORE/outside the premium branch — always free.
const nameIdx = cal.indexOf("styles.eventName");
const descIdx = cal.indexOf("styles.eventDesc");
eq("event name is basic/free (rendered before the premium branch)", nameIdx >= 0 && nameIdx < gateIdx, true);
eq("event description is basic/free (rendered before the premium branch)", descIdx >= 0 && descIdx < gateIdx, true);

console.log("\n── Entry stays free: 'Open Calendar' is NOT entitlement-gated ──");
const cardIdx = sky.indexOf('actionLabel="Open Calendar"');
eq("the Celestial Calendar card exists", cardIdx >= 0, true);
const cardRegion = cardIdx >= 0 ? sky.slice(cardIdx, cardIdx + 200) : "";
has(cardRegion, "setCalendarOpen(true)", "the entry opens the Calendar (basic browsing is free)");
if (cardRegion.includes("openPaywall")) bad("entry must NOT paywall — basic browsing is free");
else ok("entry does NOT paywall (basic browsing is free)");

console.log("\n── Canonical entitlement unchanged ──");
has(read("src/features/paywall/MonetizationCatalog.ts"), 'entitlement: "AuraLunis Premium"', "canonical entitlement unchanged");

console.log(`\nCelestial Calendar advanced-details premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
