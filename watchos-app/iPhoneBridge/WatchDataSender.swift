import Foundation
import WatchConnectivity

class WatchDataSender: NSObject, WCSessionDelegate {
    static let shared = WatchDataSender()
    
    private override init() {
        super.init()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
    }
    
    func sendSkyData(
        solarTime: String, celestialBody: String, lunarPhase: String,
        lunarPercent: Int, moonDistanceKm: Int, nextEvent: String,
        nextEventCountdown: String, tonightScore: Int
    ) {
        guard WCSession.default.isPaired, WCSession.default.isWatchAppInstalled else { return }
        let context: [String: Any] = [
            "solarTime": solarTime, "celestialBody": celestialBody,
            "lunarPhase": lunarPhase, "lunarPercent": lunarPercent,
            "moonDistanceKm": moonDistanceKm, "nextEvent": nextEvent,
            "nextEventCountdown": nextEventCountdown, "tonightScore": tonightScore
        ]
        try? WCSession.default.updateApplicationContext(context)
        if WCSession.default.isReachable { WCSession.default.sendMessage(context, replyHandler: nil) }
    }
    
    func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {}
    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) { WCSession.default.activate() }
}
