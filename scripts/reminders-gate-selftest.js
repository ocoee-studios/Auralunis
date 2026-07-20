// Celestial-event reminders premium-gate deterministic self-test.
//
// Product decision: event / eclipse / meteor / conjunction reminders are PREMIUM. Basic
// sunset / moonrise alerts remain free. A non-entitled user must never have the celestial-event
// reminders scheduled. The single scheduling choke point is the HomeScreen mount effect.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));

const home = read("src/screens/HomeScreen.tsx");

console.log("── Celestial-event reminders are gated behind premium at the scheduling choke point ──");
has(home, "useEntitlement()", "HomeScreen reads entitlement via useEntitlement");

// The celestial scheduler must be guarded by isPremium in the same statement that calls it.
const callIdx = home.indexOf("scheduleCelestialEventNotifications(CELESTIAL_EVENTS)");
if (callIdx < 0) { bad("celestial scheduler call exists"); }
else {
  ok("celestial scheduler call exists");
  // Look at the line/statement containing the call — it must be premium-guarded.
  const lineStart = home.lastIndexOf("\n", callIdx);
  const line = home.slice(lineStart, callIdx + 60);
  has(line, "if (isPremium)", "celestial reminders only scheduled when isPremium (premium-gated)");
}

// Sunset/moonrise (basic, free) scheduler must still run unconditionally (not gated).
const skyCallIdx = home.indexOf("scheduleSkyEventNotifications(sky)");
if (skyCallIdx < 0) bad("basic sky-event scheduler call exists");
else {
  ok("basic sky-event scheduler call exists");
  const before = home.slice(Math.max(0, skyCallIdx - 120), skyCallIdx);
  // The basic scheduler is inside the notificationsEnabled block, NOT wrapped in isPremium.
  if (before.includes("if (isPremium)")) bad("basic sunset/moonrise alerts must remain free (not isPremium-gated)");
  else ok("basic sunset/moonrise alerts remain free (not isPremium-gated)");
}

// isPremium must be in the effect deps so the gate re-evaluates when entitlement changes.
has(home, "settings.notificationsEnabled, isPremium]", "effect re-runs when entitlement changes (isPremium in deps)");

console.log(`\nReminders premium-gate self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
