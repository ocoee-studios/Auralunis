# Xcode Watch Target Setup Checklist

## Create target
- [ ] Open the generated iOS workspace in Xcode
- [ ] File → New → Target → watchOS App
- [ ] Name target `AuraLunisWatch`
- [ ] Choose SwiftUI and Swift
- [ ] Associate it with the AuraLunis iOS companion app
- [ ] Enable Widget Extension if building Smart Stack / complication surfaces now

## Add watch source
- [ ] Copy `apple-native/watchOS/AuraLunisWatch/`
- [ ] Add files to the `AuraLunisWatch` target membership
- [ ] Verify `WatchConnectivity` framework import
- [ ] Verify `WatchKit` framework import
- [ ] Merge approved logo / Watch assets from the older asset package

## Add iPhone Watch sync source
- [ ] Copy `apple-native/iOS/AuraLunisWatchSync/`
- [ ] Add files to the iOS app target membership
- [ ] Register the Expo module
- [ ] Call `syncAuraLunisWatch(...)` when current sky summary changes

## Verify on devices
- [ ] iPhone and Apple Watch are paired
- [ ] Install iOS development build
- [ ] Install Watch companion app
- [ ] Moon phase syncs
- [ ] Tonight Score syncs
- [ ] Next Event syncs
- [ ] Digital Crown scrubs -12h to +12h
- [ ] Haptic clicks happen once at each hour checkpoint
- [ ] `Now` reset works
- [ ] watchOS 26 Liquid Glass rings are readable
- [ ] watchOS 11 fallback remains readable
