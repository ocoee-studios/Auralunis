// Paywall / restore-truthfulness deterministic self-test (Build 5 fix).
//
// Proves the runtime guarantees this PR added:
//   - restore success is shown ONLY when the exact "AuraLunis Premium" entitlement is active
//   - a completed restore with no entitlement does not unlock premium
//   - a genuine restore error is a DISTINCT path (not "not configured")
//   - "Manage Subscription" is shown only for an active auto-renewing subscription
//   - lifetime is classified as lifetime (never a subscription, never trial copy)
//   - the ungated Settings trial sentence is gone; trial copy stays paywall-eligibility-gated
//   - the entitlement constant is exactly "AuraLunis Premium"
// Pure logic is executed; UI/handler shape is asserted by scanning source (no RN runtime).

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

// ── transpile-require: load node-safe .ts modules, resolve "@/…" to src/… ──
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
    for (const c of [base + ".ts", base + ".tsx", path.join(base, "index.ts")]) {
      if (fs.existsSync(c)) return c;
    }
  }
  return origResolve.call(this, request, ...rest);
};

const { hasAuraLunisEntitlement, classifyAuraLunisMembership } = require(path.join(SRC, "features/paywall/entitlementStatus.ts"));
const { RevenueCatIds } = require(path.join(SRC, "features/paywall/MonetizationCatalog.ts"));

let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));
const hasnt = (hay, needle, n) => (!hay.includes(needle) ? ok(n) : bad(`${n} — should be absent: ${needle}`));

const ENT = RevenueCatIds.entitlement;
const MONTHLY = RevenueCatIds.products.premiumMonthly;
const ANNUAL = RevenueCatIds.products.premiumAnnual;
const LIFETIME = RevenueCatIds.products.lifetime;

console.log("── Entitlement identifier (must stay exactly 'AuraLunis Premium') ──");
eq("entitlement constant is exactly \"AuraLunis Premium\"", ENT, "AuraLunis Premium");
eq("entitlement constant is NOT the snake_case slug", ENT === "auralunis_premium", false);

console.log("\n── Restore truthfulness: entitlement drives success, not a bare completed call ──");
eq("no active entitlement → not entitled", hasAuraLunisEntitlement({ entitlements: { active: {} } }), false);
eq("active entitlement → entitled", hasAuraLunisEntitlement({ entitlements: { active: { [ENT]: {} } } }), true);
eq("wrong (snake_case) key active → NOT entitled", hasAuraLunisEntitlement({ entitlements: { active: { auralunis_premium: {} } } }), false);
eq("some other entitlement active → NOT entitled", hasAuraLunisEntitlement({ entitlements: { active: { "Some Other": {} } } }), false);

console.log("\n── Membership classification (subscription vs lifetime, from CustomerInfo) ──");
eq("no entitlement → none", classifyAuraLunisMembership({ entitlements: { active: {} }, activeSubscriptions: [] }), "none");
eq("entitled, no active sub → lifetime", classifyAuraLunisMembership({ entitlements: { active: { [ENT]: {} } }, activeSubscriptions: [] }), "lifetime");
eq("entitled via lifetime product (not a sub) → lifetime", classifyAuraLunisMembership({ entitlements: { active: { [ENT]: {} } }, activeSubscriptions: [LIFETIME] }), "lifetime");
eq("entitled + monthly sub → subscription", classifyAuraLunisMembership({ entitlements: { active: { [ENT]: {} } }, activeSubscriptions: [MONTHLY] }), "subscription");
eq("entitled + annual sub → subscription", classifyAuraLunisMembership({ entitlements: { active: { [ENT]: {} } }, activeSubscriptions: [ANNUAL] }), "subscription");
eq("active sub but NO entitlement → none (fail closed)", classifyAuraLunisMembership({ entitlements: { active: {} }, activeSubscriptions: [MONTHLY] }), "none");

console.log("\n── Restore handlers: gate on entitled + distinct error path ──");
const svc = read("src/services/RevenueCatService.ts");
has(svc, 'status: "error"', "RevenueCatService.restore returns a distinct \"error\" status");
has(svc, "classifyAuraLunisMembership(customerInfo)", "RevenueCatService.restore reports membership");
has(svc, "This is NOT \"not configured\"", "restore catch documents error is not conflated with not_configured");
const settings = read("src/screens/SettingsScreen.tsx");
has(settings, "result.entitled", "SettingsScreen restore success gated on result.entitled");
has(settings, 'result.status === "error"', "SettingsScreen shows a distinct restore error message");
has(settings, "No active AuraLunis purchase was found", "SettingsScreen shows truthful no-purchase message");
const app = read("App.tsx");
has(app, "result.entitled", "App.tsx restore success gated on result.entitled");
has(app, 'result.status === "error"', "App.tsx shows a distinct restore error message");
hasnt(app, "refreshed the membership status for this App Store account", "App.tsx no longer claims vague success");

console.log("\n── Manage Subscription visibility ──");
has(settings, 'membershipKind === "subscription"', "Manage Subscription shown only for an active subscription");
has(settings, 'membershipKind === "lifetime"', "Lifetime gets a no-subscription-to-manage note, not a manage button");
// The manage button must not be rendered purely from isPremium anymore.
hasnt(settings, "isPremium ? styles.actionButton : styles.secondaryButton", "Manage Subscription no longer rendered for every premium/non-premium user");

console.log("\n── Trial language ──");
hasnt(settings, "introductory trial may be available", "Settings has no ungated 'trial may be available' sentence");
const offers = read("src/features/paywall/usePaywallOffers.ts");
has(offers, 'p.interval !== "lifetime"', "usePaywallOffers excludes lifetime from intro-offer eligibility");
has(offers, 'status: "unavailable"', "usePaywallOffers marks lifetime trial unavailable");
const modal = read("src/features/paywall/ThreeTierPaywallModal.tsx");
has(modal, 'plan.interval !== "lifetime" && offer?.trial.status === "eligible"', "Paywall renders trial copy only for eligible non-lifetime plans");

console.log("\n── Monetization contract unchanged ──");
const catalog = read("src/features/paywall/MonetizationCatalog.ts");
has(catalog, 'entitlement: "AuraLunis Premium"', "entitlement constant unchanged");
has(catalog, '"com.ocoeestudios.auralunis.premium.monthly"', "monthly product id unchanged");
has(catalog, '"com.ocoeestudios.auralunis.premium.annual"', "annual product id unchanged");
has(catalog, '"com.ocoeestudios.auralunis.lifetime"', "lifetime product id unchanged");

console.log(`\nPaywall/restore self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
