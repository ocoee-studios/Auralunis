# AuraLunis Native Device QA Checklist

Tester:
Device:
iOS version:
Build profile:
Build URL / version:
Test date:
Location:
Weather / sky conditions:

## Install and launch
- [ ] Internal development build installs successfully
- [ ] AuraLunis opens without crash
- [ ] Star-dust app icon appears
- [ ] Splash screen appears correctly
- [ ] Bottom navigation shows Home / Sky / Watch / Learn / Settings
- [ ] First-open 7-day trial popup appears on fresh install
- [ ] Continue Exploring dismisses popup
- [ ] Popup does not reappear after dismissal

## Settings → Native Device QA
- [ ] Camera permission prompt opens
- [ ] Camera permission status reads correctly
- [ ] Foreground location prompt opens
- [ ] Location services status reads correctly
- [ ] Photo-save permission prompt opens
- [ ] Compass heading returns a degree value
- [ ] Accelerometer available
- [ ] Gyroscope available
- [ ] Magnetometer available
- [ ] Test haptic is physically felt

## Sky
- [ ] Sky Lens opens after camera approval
- [ ] Manual Sky Map opens directly
- [ ] Declining camera routes to Manual Sky Map
- [ ] Find Mode button responds
- [ ] X-Ray / Birth Sky button responds
- [ ] Milky Way / Galaxy Mode toggles
- [ ] Deep Sky object save increments Vault count

## Home
- [ ] Tonight Score refresh changes value
- [ ] Cosmic Note saves
- [ ] Empty Cosmic Note shows validation alert
- [ ] LifeSky moment saves
- [ ] Cosmic Steering Wheel day offset increments
- [ ] Astral Sound Bath prototype toggles

## Watch
- [ ] Seven Watch layouts render
- [ ] Five themes render
- [ ] Four-complication limit is enforced
- [ ] Signature curated reset works
- [ ] Watch selections persist after force-close and reopen

## Learn
- [ ] Category selection changes the live visual
- [ ] Solar System visual animates
- [ ] Moon visual animates
- [ ] Constellation visual animates
- [ ] Star visual animates
- [ ] Deep Sky visual animates
- [ ] Milky Way visual animates
- [ ] 30 Nights progress visual animates

## Settings persistence
- [ ] Theme persists after relaunch
- [ ] Notification toggles persist
- [ ] Privacy toggles persist
- [ ] Watch toggle persists
- [ ] Widget toggle persists
- [ ] About Us card is visible
- [ ] Reset Settings restores defaults
- [ ] Clear Prototype Vault clears local items

## Outdoor Sky Lens
- [ ] Compass test completed outdoors
- [ ] Figure-eight calibration tested
- [ ] Moon comparison recorded
- [ ] Venus comparison recorded if visible
- [ ] Jupiter comparison recorded if visible
- [ ] Polaris comparison recorded if visible
- [ ] Sirius comparison recorded if visible
- [ ] Orion comparison recorded if visible

## Result
- [ ] PASS for continued native implementation
- [ ] BLOCKED — issue log attached
