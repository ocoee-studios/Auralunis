const fs = require("fs");
const path = require("path");

// Only the accuracy scaffolding that actually ships. SkyLensMath / SkyLensMockTargets /
// SkyLensAccuracyRunner were planned but never built (absent on main and every branch);
// requiring them made this audit fail on unrelated commits. SkyLensAccuracyTypes.ts is
// real (imported by useSkyProjection) and stays.
const required = [
  "src/features/sky-lens/accuracy/SkyLensAccuracyTypes.ts",
  "docs/SKY_LENS_ACCURACY_PLAN.md",
  "qa/SKY_LENS_DEVICE_QA_CHECKLIST.md"
];

const root = path.resolve(__dirname, "..");
let failed = false;

for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.error("MISSING", file);
    failed = true;
  } else {
    console.log("PASS", file);
  }
}

const plan = fs.readFileSync(path.join(root, "docs/SKY_LENS_ACCURACY_PLAN.md"), "utf8");
for (const term of ["0.25°", "2.0°", "5.0°", "Moon", "Venus", "Jupiter", "Orion"]) {
  if (!plan.includes(term)) {
    console.error("MISSING ACCURACY TERM", term);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("Sky Lens accuracy scaffold QA passed.");
