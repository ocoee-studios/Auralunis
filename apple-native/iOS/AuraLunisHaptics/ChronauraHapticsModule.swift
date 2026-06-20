// AuraLunisHapticsModule.swift
// Expo Module that exposes CoreHaptics compass-tick and lock-pulse patterns
// to the React Native layer. Registered automatically by Expo Modules Core.
//
// Usage from JS: import { WatchHaptics } from '@/modules/WatchHaptics'
// WatchHaptics.triggerCompassTick()
// WatchHaptics.triggerLockPulse()

import ExpoModulesCore
import CoreHaptics

public final class AuraLunisHapticsModule: Module {

    private var engine: CHHapticEngine?

    public func definition() -> ModuleDefinition {
        Name("AuraLunisHaptics")

        // Called once when the module is loaded
        OnCreate {
            self.startEngine()
        }

        // Crisp mechanical micro-tick — use for proximity approach (within 30°)
        Function("triggerCompassTick") {
            self.playCompassTick()
        }

        // Deep continuous pulse — use on alignment lock
        Function("triggerLockPulse") {
            self.playLockPulse()
        }
    }

    // MARK: — Engine lifecycle

    private func startEngine() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            engine = try CHHapticEngine()
            engine?.resetHandler = { [weak self] in
                // Restart engine if the system resets it (e.g. after a call)
                try? self?.engine?.start()
            }
            engine?.stoppedHandler = { reason in
                print("[AuraLunisHaptics] Engine stopped: \(reason)")
            }
            try engine?.start()
        } catch {
            print("[AuraLunisHaptics] Failed to start engine: \(error)")
        }
    }

    // MARK: — Patterns

    private func playCompassTick() {
        guard let engine = engine else { return }
        do {
            // Sharp transient — mimics a mechanical gear click
            let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.6)
            let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.8)
            let event = CHHapticEvent(
                eventType: .hapticTransient,
                parameters: [intensity, sharpness],
                relativeTime: 0
            )
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try engine.makePlayer(with: pattern)
            try player.start(atTime: CHHapticTimeImmediate)
        } catch {
            print("[AuraLunisHaptics] compassTick failed: \(error)")
        }
    }

    private func playLockPulse() {
        guard let engine = engine else { return }
        do {
            // Warm continuous rumble — signals a perfect alignment lock
            let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0)
            let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.4)
            let event = CHHapticEvent(
                eventType: .hapticContinuous,
                parameters: [intensity, sharpness],
                relativeTime: 0,
                duration: 0.4
            )
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try engine.makePlayer(with: pattern)
            try player.start(atTime: CHHapticTimeImmediate)
        } catch {
            print("[AuraLunisHaptics] lockPulse failed: \(error)")
        }
    }
}
