const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const failures = [];
const passes = [];

function check(label, condition, detail = "") {
  if (condition) {
    passes.push(label);
    console.log("PASS", label);
  } else {
    failures.push(`${label}${detail ? `: ${detail}` : ""}`);
    console.error("FAIL", label, detail);
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const app = JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8"));
const catalog = fs.readFileSync(
  path.join(root, "src/features/paywall/MonetizationCatalog.ts"),
  "utf8"
);
const service = fs.readFileSync(
  path.join(root, "src/services/RevenueCatService.ts"),
  "utf8"
);
const paywall = fs.readFileSync(
  path.join(root, "src/features/paywall/ThreeTierPaywallModal.tsx"),
  "utf8"
);

check(
  "react-native-purchases dependency",
  Boolean(pkg.dependencies && pkg.dependencies["react-native-purchases"])
);
check(
  "RevenueCat iOS public key placeholder",
  Boolean(app.expo.extra && app.expo.extra.revenueCatIosApiKey)
);
// (No Android RevenueCat key check — AuraLunis ships iOS-only; app.json carries only the
// iOS key. Requiring an Android key audited a platform the app doesn't target.)

// The pricing was migrated off the old `chronaura` Horizon/Aura/Sovereign product model
// to the shipped AuraLunis Premium model. Assert the REAL product IDs + entitlement that
// live in MonetizationCatalog.ts today (CLAUDE.md: premium monthly/annual + founders
// lifetime, all unlocking one entitlement). This audits the pricing that ships — it does
// not change it.
for (const term of [
  "com.ocoeestudios.auralunis.premium.monthly",
  "com.ocoeestudios.auralunis.premium.annual",
  "com.ocoeestudios.auralunis.lifetime",
  "AuraLunis Premium"
]) {
  check(`catalog: ${term}`, catalog.includes(term));
}

for (const term of [
  "Purchases.configure",
  "Purchases.getOfferings",
  "Purchases.purchasePackage",
  "Purchases.restorePurchases",
  "Purchases.getCustomerInfo",
  "managementURL"
]) {
  check(`RevenueCat service: ${term}`, service.includes(term));
}

// Real three-tier paywall: Monthly, Annual, Lifetime, plus Restore Purchases. (The old
// "Horizon Free / Aura Pro / Sovereign Coming Later" tier gating belonged to the retired
// chronaura model and is no longer part of the shipped paywall.)
check("paywall copy: Monthly tier", paywall.includes("Monthly"));
check("paywall copy: Annual tier", paywall.includes("Annual"));
check("paywall copy: Lifetime tier", paywall.includes("Lifetime"));
check("paywall copy: Restore Purchases", paywall.includes("Restore Purchases"));

console.log("");
console.log(`RevenueCat preflight: ${passes.length} pass, ${failures.length} fail.`);

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
