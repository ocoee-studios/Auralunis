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
check(
  "RevenueCat Android public key placeholder",
  Boolean(app.expo.extra && app.expo.extra.revenueCatAndroidApiKey)
);

for (const term of [
  "com.ocoee.chronaura.horizon.monthly",
  "com.ocoee.chronaura.horizon.annual",
  "com.ocoee.chronaura.aura.monthly",
  "com.ocoee.chronaura.aura.annual",
  "com.ocoee.chronaura.sovereign.annual",
  "horizon_plus",
  "aura_pro",
  "sovereign",
  "chronaura_launch"
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

check("paywall copy: Horizon free option", paywall.includes("Continue with Horizon Free"));
check(
  "paywall copy: trial eligibility",
  paywall.includes("SEVEN_DAY_TRIAL_COPY") || paywall.includes("7-day")
);
check(
  "paywall copy: Sovereign labeled Coming Later",
  catalog.includes('"Waitlist · Coming Later"')
);
check("paywall copy: Restore Purchases", paywall.includes("Restore Purchases"));

check(
  "Aura Pro launch purchase disabled",
  catalog.includes('tierId: "aura_pro"') &&
    catalog.includes('"COMING LATER"')
);
check(
  "Sovereign launch purchase disabled",
  catalog.includes('tierId: "sovereign"') &&
    catalog.includes('availableAtLaunch: false')
);

console.log("");
console.log(`RevenueCat preflight: ${passes.length} pass, ${failures.length} fail.`);

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
