# Sky Lens Device QA Checklist

## Permission flow
- [ ] App does not ask for camera on first launch
- [ ] Opening Sky Lens shows Chronaura pre-permission screen
- [ ] Native camera prompt appears after user continues
- [ ] Denied camera permission shows fallback
- [ ] Accepted camera permission opens Sky Lens
- [ ] Photo permission is asked only when saving a capture
- [ ] Location permission is asked only when local sky is needed

## Sensor calibration
- [ ] Bad compass accuracy triggers calibration prompt
- [ ] Figure-eight calibration prompt is clear
- [ ] Recenter Lens control works
- [ ] Manual sky map fallback works
- [ ] Labels stabilize after calibration

## Target tests
- [ ] Moon overlay within 2°
- [ ] Venus overlay within 2°
- [ ] Jupiter overlay within 2°
- [ ] Orion overlay within 2°
- [ ] Sirius overlay within 2°
- [ ] Polaris overlay within 2°

## Feature tests
- [ ] Find Mode arrow points correct direction
- [ ] Tap-to-Listen card opens for selected object
- [ ] X-Ray Lens uses same target coordinates
- [ ] Birth Sky Overlay labels current vs birth positions
- [ ] Guided tour advances steps correctly
- [ ] Capture saves only when user confirms

## Environmental tests
- [ ] Test with phone case
- [ ] Test without phone case
- [ ] Test near car/building
- [ ] Test in open field
- [ ] Test after app restart
- [ ] Test after location changes
