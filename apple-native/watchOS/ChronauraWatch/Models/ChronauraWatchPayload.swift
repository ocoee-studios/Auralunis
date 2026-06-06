import Foundation

struct ChronauraWatchPayload: Codable, Equatable {
    var moonPhase: String
    var tonightScore: Int
    var nextEvent: String
    var updatedAt: Date

    static let preview = ChronauraWatchPayload(
        moonPhase: "Waxing Gibbous",
        tonightScore: 91,
        nextEvent: "Venus visible in 1h 18m",
        updatedAt: Date()
    )

    init(
        moonPhase: String,
        tonightScore: Int,
        nextEvent: String,
        updatedAt: Date
    ) {
        self.moonPhase = moonPhase
        self.tonightScore = tonightScore
        self.nextEvent = nextEvent
        self.updatedAt = updatedAt
    }

    init?(dictionary: [String: Any]) {
        guard
            let moonPhase = dictionary["moonPhase"] as? String,
            let tonightScore = dictionary["tonightScore"] as? Int,
            let nextEvent = dictionary["nextEvent"] as? String
        else {
            return nil
        }

        let updatedAt: Date
        if let rawDate = dictionary["updatedAt"] as? String,
           let decodedDate = ISO8601DateFormatter().date(from: rawDate) {
            updatedAt = decodedDate
        } else {
            updatedAt = Date()
        }

        self.init(
            moonPhase: moonPhase,
            tonightScore: tonightScore,
            nextEvent: nextEvent,
            updatedAt: updatedAt
        )
    }
}
