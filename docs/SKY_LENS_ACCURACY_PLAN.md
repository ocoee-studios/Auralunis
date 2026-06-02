# Chronaura Sky Lens Accuracy Plan

## Honest target
We should not claim the AR overlay is “100% accurate” until real-device outdoor tests prove it. The goal is:

- **Astronomical calculation accuracy:** within 0.25° for MVP validation.
- **Calibrated AR overlay accuracy:** within 2.0° of the true target on screen.
- **Uncalibrated fallback accuracy:** within 5.0°, with calibration prompt shown.

Real AR accuracy depends on:
- GPS/location accuracy
- compass/magnetometer calibration
- phone case magnets or nearby metal
- device orientation sensor drift
- time/date/time-zone correctness
- atmospheric refraction near horizon
- camera field-of-view calibration
- whether the user is indoors or near interference

## Acceptance criteria for MVP

### Must pass before TestFlight
- Camera permission asks only when Sky Lens opens.
- Denied camera permission falls back to manual sky map.
- Location permission is requested only when local sky is needed.
- Manual location fallback exists.
- Moon, Venus, Jupiter, Orion test targets are within tolerance after calibration.
- Find Mode points in the correct direction after calibration.
- Labels do not jump or drift aggressively when the phone is still.
- X-Ray Lens aligns with the same sky-state source as Sky Lens.
- Birth Sky Overlay clearly labels current vs birth positions.
- Capture mode saves only when user chooses to save.

### Accuracy thresholds
- Calculation tolerance: <= 0.25°
- Calibrated overlay tolerance: <= 2.0°
- Uncalibrated overlay tolerance: <= 5.0°

## Calibration UX
If sensor accuracy is poor, show:

“Move your phone slowly in a figure-eight to calibrate the Sky Lens.”

Also show:
- Manual Sky Map
- Recenter Lens
- Use Current Location
- Enter Location Manually

## Field test checklist
Use visible, easy targets:
1. Moon
2. Venus
3. Jupiter
4. Orion
5. Sirius
6. Polaris

Test in:
- open sky
- suburban sky
- near buildings
- near a parked car
- with and without phone case
- after closing/reopening app
- after rotating phone from portrait to landscape

## Production requirement
For true accuracy, the production app needs a real astronomy/ephemeris engine and real device sensor calibration. The current package contains the validation framework and placeholder targets, not the final star-catalog engine.
