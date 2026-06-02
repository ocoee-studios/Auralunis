const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const failures = [];
const warnings = [];
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

function warn(label, condition, detail = "") {
  if (!condition) {
    warnings.push(`${label}${detail ? `: ${detail}` : ""}`);
    console.warn("WARN", label, detail);
  } else {
    console.log("PASS", label);
  }
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const pkg = readJson("package.json");
const app = readJson("app.json");
const eas = readJson("eas.json");
const settings = fs.readFileSync(path.join(root, "src/screens/SettingsScreen.tsx"), "utf8");
const diagnostics = fs.readFileSync(path.join(root, "src/features/device-qa/DeviceDiagnosticsPanel.tsx"), "utf8");

check("eas.json exists", fs.existsSync(path.join(root, "eas.json")));
check(
  "development build profile",
  eas.build &&
    eas.build.development &&
    eas.build.development.developmentClient === true &&
    eas.build.development.distribution === "internal"
);
check("iOS bundle identifier", app.expo.ios.bundleIdentifier === "com.ocoee.chronaura");
check("iOS camera permission copy", Boolean(app.expo.ios.infoPlist.NSCameraUsageDescription));
check("iOS location permission copy", Boolean(app.expo.ios.infoPlist.NSLocationWhenInUseUsageDescription));
check("iOS motion permission copy", Boolean(app.expo.ios.infoPlist.NSMotionUsageDescription));
check("iOS photo-save permission copy", Boolean(app.expo.ios.infoPlist.NSPhotoLibraryAddUsageDescription));
check(
  "expo-sensors config plugin",
  app.expo.plugins.some((plugin) => Array.isArray(plugin) && plugin[0] === "expo-sensors")
);
check(
  "Settings opens Device Diagnostics",
  settings.includes("Open Device Diagnostics") && settings.includes("<DeviceDiagnosticsPanel />")
);
for (const term of [
  "requestCameraPermission",
  "requestLocationPermission",
  "requestPermissionsAsync",
  "getHeadingAsync",
  "Accelerometer.isAvailableAsync",
  "Gyroscope.isAvailableAsync",
  "Magnetometer.isAvailableAsync",
  "notificationAsync"
]) {
  check(`diagnostics: ${term}`, diagnostics.includes(term));
}

warn(
  "expo-dev-client installed",
  Boolean(pkg.dependencies && pkg.dependencies["expo-dev-client"]),
  "Run ./scripts/bootstrap-native-device.sh before creating the EAS development build."
);

console.log("");
console.log(`Preflight complete: ${passes.length} pass, ${warnings.length} warning, ${failures.length} fail.`);

if (warnings.length) {
  console.log("Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (failures.length) {
  console.error("Failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
