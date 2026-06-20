// AuraLunisWatchHapticsEngine.swift
// Standalone CoreHaptics engine for the watchOS target.
// Called directly from SwiftUI watch views when the phone sends
// an alignment score update via WatchConnectivity.
//
// Drop this file into the AuraLunisWatch watchOS Extension target.
// It does NOT bridge to React Native — it runs purely on-Watch.

import WatchKit
import CoreHaptics

final class AuraLunisWatchHapticsEngine {

    static let shared = AuraLunisWatchHapticsEngine()

    private var engine: CHHapticEngine?

    private init() {
        startEngine()
    }

    // MARK: — Engine lifecycle

    private func startEngine() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            engine = try CHHapticEngine()
            engine?.resetHandler = { [weak self] in
                try? self?.engine?.start()
            }
            try engine?.start()
        } catch {
            print("[WatchHaptics] Engine start failed: \(error)")
        }
    }

    // MARK: — Public API

    /// Crisp mechanical tick — call when alignment score crosses into
    /// the 70–85 range (approaching) or 85+ (near lock).
    func playCompassTick(intensity: Float = 0.6) {
        guard let engine = engine else { return }
        do {
            let intensityParam = CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity)
            let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.8)
            let event = CHHapticEvent(
                eventType: .hapticTransient,
                parameters: [intensityParam, sharpness],
                relativeTime: 0
            )
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let player = try engine.makePlayer(with: pattern)
            try player.start(atTime: CHHapticTimeImmediate)
        } catch {
            print("[WatchHaptics] compassTick failed: \(error)")
        }
    }

    /// Deep continuous rumble — call once on alignment lock entry.
    func playLockPulse() {
        guard let engine = engine else { return }
        do {
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
            print("[WatchHaptics] lockPulse failed: \(error)")
        }
    }

    /// Convenience: pick the right pattern based on alignment score.
    /// Call this from your WatchConnectivity receive handler.
    func respondToScore(_ score: Int, isLocked: Bool) {
        if isLocked {
            playLockPulse()
        } else if score > 85 {
            playCompassTick(intensity: 0.75)
        } else if score > 70 {
            playCompassTick(intensity: 0.5)
        }
        // Below 70 — silent
    }
}
