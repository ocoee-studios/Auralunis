import Foundation

struct AuraLunisPhoneWatchPayload {
    let moonPhase: String
    let tonightScore: Int
    let nextEvent: String
    let updatedAt: Date

    var dictionary: [String: Any] {
        [
            "moonPhase": moonPhase,
            "tonightScore": tonightScore,
            "nextEvent": nextEvent,
            "updatedAt": ISO8601DateFormatter().string(from: updatedAt)
        ]
    }
}
