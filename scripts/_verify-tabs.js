// Interaction smoke test: open every tab, exercise primary controls/flows,
// and capture any runtime errors or crashes. Runs against the web build.
const { chromium } = require("playwright");

const URL = "http://localhost:8081/";

const TABS = [
  { name: "Home", heading: "Living Astrolabe" },
  { name: "Sky", heading: "Sky Lens + Archive" },
  { name: "Watch", heading: "Watch Face Gallery" },
  { name: "Learn", heading: "Learn the Cosmos" },
  { name: "Settings", heading: "Settings" }
];

// Buttons/cards to tap per tab. Alerts no-op on web; we only care that taps
// don't throw or white-screen the app.
const INTERACTIONS = {
  Sky: ["Show Galaxy Mode", "Hide Galaxy Mode", "Find Venus", "Reveal Geometry", "Open Archive Summary"],
  Learn: ["Moon", "Planets", "Constellations", "Stars", "Deep Sky", "Milky Way", "30 Nights", "Solar System"],
  Settings: [],
  Watch: ["Moon Keeper", "Living Astrolabe"],
  Home: []
};

// Full-screen flows: open, then recover back to the tab.
const FLOWS = {
  Sky: [
    { open: "Open Manual Map", close: ["Close", "✕", "Back"] },
    { open: "Open Sky Lens", close: ["Use Manual Map", "Manual Map", "Not now", "Maybe later", "Close", "✕"] }
  ],
  Settings: [
    { open: "Manage Subscription", close: ["Continue with Horizon Free", "Continue Free", "Maybe later", "Not now", "Close", "✕"] }
  ]
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  await ctx.addInitScript(() => {
    try { window.localStorage.setItem("chronaura.onboarding.seen", "true"); } catch {}
  });

  const page = await ctx.newPage();
  let currentStep = "load";
  const errors = [];
  page.on("pageerror", (e) => errors.push(`[${currentStep}] pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") {
      const t = m.text();
      // ignore noisy web-only resource/network warnings
      if (!/Failed to load resource|favicon|Download the React/i.test(t)) {
        errors.push(`[${currentStep}] console.error: ${t.slice(0, 160)}`);
      }
    }
  });
  page.on("dialog", (d) => d.accept().catch(() => {}));

  await page.goto(URL, { waitUntil: "load", timeout: 120000 });
  await page.getByText("CHRONAURA").first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(2000);

  const results = [];

  async function tapTab(name) {
    currentStep = `tab:${name}`;
    await page.getByText(name, { exact: true }).last().click({ timeout: 8000 });
    await page.waitForTimeout(900);
  }

  async function tryClick(label, timeout = 4000) {
    const el = page.getByText(label, { exact: true }).last();
    if (await el.isVisible().catch(() => false)) {
      await el.click({ timeout }).catch(() => {});
      await page.waitForTimeout(700);
      return true;
    }
    return false;
  }

  for (const tab of TABS) {
    const errBefore = errors.length;
    await tapTab(tab.name);

    // 1) tab opened -> its unique heading is visible
    const headingVisible = await page
      .getByText(tab.heading, { exact: false })
      .first()
      .isVisible()
      .catch(() => false);

    // 2) exercise primary interactions
    const interactions = [];
    for (const label of INTERACTIONS[tab.name] || []) {
      currentStep = `${tab.name}:tap:${label}`;
      const clicked = await tryClick(label);
      interactions.push(`${label}:${clicked ? "ok" : "n/a"}`);
    }

    // 3) full-screen flows: open + recover
    const flows = [];
    for (const flow of FLOWS[tab.name] || []) {
      currentStep = `${tab.name}:flow:${flow.open}`;
      const opened = await tryClick(flow.open);
      let closed = false;
      if (opened) {
        for (const c of flow.close) {
          if (await tryClick(c, 2500)) { closed = true; break; }
        }
        if (!closed) {
          await page.keyboard.press("Escape").catch(() => {});
          await tapTab(tab.name); // hard recover
          closed = true;
        }
      }
      flows.push(`${flow.open}:${opened ? (closed ? "open+closed" : "open-stuck") : "n/a"}`);
      await tapTab(tab.name);
    }

    results.push({
      tab: tab.name,
      opened: headingVisible,
      interactions,
      flows,
      newErrors: errors.length - errBefore
    });
  }

  // Re-verify we can still navigate after all the flows (no stuck state)
  currentStep = "final-renav";
  let renav = true;
  for (const tab of TABS) {
    await tapTab(tab.name);
    const ok = await page.getByText(tab.heading, { exact: false }).first().isVisible().catch(() => false);
    if (!ok) renav = false;
  }

  await browser.close();

  console.log("\n===== TAB VERIFICATION REPORT =====");
  for (const r of results) {
    console.log(
      `\n[${r.opened ? "PASS" : "FAIL"}] ${r.tab} — opened:${r.opened} newErrors:${r.newErrors}`
    );
    if (r.interactions.length) console.log("   taps:  " + r.interactions.join("  "));
    if (r.flows.length) console.log("   flows: " + r.flows.join("  "));
  }
  console.log(`\nRe-navigation after all flows: ${renav ? "PASS" : "FAIL"}`);
  console.log(`Total runtime errors captured: ${errors.length}`);
  if (errors.length) {
    console.log("---- errors ----");
    errors.slice(0, 30).forEach((e) => console.log("  " + e));
  }
  console.log("\n===== END REPORT =====");
  process.exit(errors.length === 0 && results.every((r) => r.opened) && renav ? 0 : 1);
})().catch((e) => { console.error("FATAL", e); process.exit(2); });
