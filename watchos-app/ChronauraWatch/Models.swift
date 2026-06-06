import Foundation

struct SkyData {
    var solarTime: String = "10:09 PM"
    var celestialBody: String = "MOON"
    var lunarPhase: String = "WAXING GIBBOUS"
    var lunarPercent: Int = 61
    var moonDistanceKm: Int = 384_400
    var nextEvent: String = "GOLDEN HOUR"
    var nextEventCountdown: String = "IN 2H 43M"
    var tonightScore: Int = 82
    var currentTime: Date = Date()
    var timeScrubOffset: Double = 0 // hours offset from now
}

struct CompassPoint: Identifiable {
    let id: String
    let label: String
    let angle: Double // degrees from north
}

let compassPoints = [
    CompassPoint(id: "n", label: "N", angle: 0),
    CompassPoint(id: "e", label: "E", angle: 90),
    CompassPoint(id: "s", label: "S", angle: 180),
    CompassPoint(id: "w", label: "W", angle: 270)
]
