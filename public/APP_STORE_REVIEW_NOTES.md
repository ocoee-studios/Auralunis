# App Store Review Notes — AuraLunis

> Paste the block below verbatim into the **App Review Information → Notes** field in App Store Connect before submitting.

---

## Notes for App Reviewer

AuraLunis is an astronomy companion app that computes real-time positions of celestial objects and orbital targets (ISS, planets, Moon) relative to the reviewer's physical location using on-device GPS and motion sensors.

**Testing in a static review environment:**

1. On first launch, the app will request Location Services and Motion sensor permissions. Please grant both.

2. The **Orbital Alignment** screen (Sky tab → "Open Alignment") is the primary sensor-dependent feature. Because it relies on live GPS and device orientation, it includes a built-in **Simulation Mode** for testing in a static lab environment.

3. To activate Simulation Mode: on the "Acquiring telemetry…" loading screen, tap **"Enable Simulation Mode"**. This injects synthetic GPS coordinates and a slowly rotating orientation stream so that the 2D radar scope, alignment score, and proximity haptics can all be evaluated without physical movement or outdoor GPS signal.

4. All other tabs (Home, Watch, Learn, Settings) are fully functional without sensor access.

**Subscription testing:**
- AuraLunis Premium can be tested using a Sandbox Apple ID. No charge is applied in the Sandbox environment. No free trial is offered on any plan.
- RevenueCat product IDs: `com.ocoeestudios.auralunis.premium.monthly`, `com.ocoeestudios.auralunis.premium.annual`, and `com.ocoeestudios.auralunis.lifetime.founders` (a one-time "Lifetime" purchase). All three unlock the single "AuraLunis Premium" entitlement.

**Demo credentials:** None required — the app does not use email/password sign-in.
