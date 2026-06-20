# Ephemeris integration

AuraLunis now computes real sky positions with
[`astronomy-engine`](https://github.com/cosinekitty/astronomy) (MIT, pure
JavaScript/TypeScript, no native build step, reference-grade accuracy).

## Modules

- `src/features/sky-lens/ephemeris/SkyEphemerisService.ts` — pure, no React
  Native imports, unit-testable in plain Node.
  - `computeTonightSky(location, when?)` → full snapshot: every body's azimuth,
    altitude, magnitude, RA/Dec, `aboveHorizon`, plus Moon illumination and
    next Sun/Moon rise & set.
  - `computeExpectedTargets(location, when?)` → truth values for the Sky Lens
    accuracy suite.
  - `findBody(sky, id)` → single-body lookup (used by Find Mode).
  - `DEFAULT_OBSERVER` → neutral fallback location used before a GPS fix.
- `src/features/sky-lens/ephemeris/useObserverLocation.ts` — `expo-location`
  hook returning an `ObserverLocation`, with graceful fallback to
  `DEFAULT_OBSERVER` when permission is declined.

## Where it's used

- Home `AstrolabePreview` renders an all-sky dial (center = zenith, rim =
  horizon, north up, clockwise) plotting the bodies currently above the horizon.
- Home summary shows live "planets visible now / Moon % / next moonrise".
- Sky tab shows a live "Tonight's Sky" panel and Find Mode points to the real
  current position of a target.
- `SkyLensAccuracyRunner` compares real truth vs a simulated calibrated overlay.

## Tests

- `npm run qa:ephemeris` — asserts known reference positions for a fixed place
  and time (catches a library upgrade or wrong API call).
- `npm run qa:fresh-bugs` — static integration checks plus orphan/drift guards.

## Coordinate convention

Azimuth is degrees from true north, increasing clockwise (E = 90°, S = 180°,
W = 270°). Altitude is degrees above the horizon. `Horizon(..., "normal")`
applies standard atmospheric refraction.

## Satellites (real SGP4)

`src/features/aura-pro/SatelliteFeedService.ts` fetches CelesTrak orbital
elements (TLE), caches the *elements* (valid for hours), and on each render
propagates them with `satellite.js` SGP4 to the current time, then converts the
ECI position to observer look-angles (`eciToEcf` -> `ecfToLookAngles`). Only
objects above the horizon are plotted; azimuth maps across the overlay box and
altitude maps top (overhead) to bottom (horizon). `npm run qa:satellite` guards
the pipeline. Offline fixtures use bundled snapshot elements that drift with
epoch age — the live feed replaces them with current elements.

## Sky Lens AR alignment (implemented)

`src/features/sky-lens/ar/` contains the camera overlay pipeline:
- `SkyLensOrientation.ts` — pure tilt-compensated orientation: accelerometer +
  magnetometer → camera azimuth/altitude/roll.
- `SkyLensProjection.ts` — pure projection: a body's (azimuth, altitude) →
  screen (x, y) given pointing, field of view, and box size; flags on-screen /
  behind and a guidance bearing for off-screen targets.
- `useDevicePointing.ts` — streams the sensors into the orientation math.
- The overlay (in `SkyLensPlaceholder.tsx`) renders `CameraView`, labels bodies
  in frame, shows a heading HUD, and points toward the brightest off-screen body.

Both pure modules are verified by `npm run qa:skylens`.

## Remaining: outdoor calibration

The math is exact, but real-world accuracy needs an on-device session to tune
per-device camera FOV, apply magnetic declination, smooth sensor noise, and
confirm the device-frame axis conventions on hardware. This is the one Sky Lens
step that cannot be done off-device.
