import Foundation
import WatchConnectivity

class WatchSessionManager: NSObject, ObservableObject, WCSessionDelegate {
    @Published var skyData = SkyData()
    
    override init() {
        super.init()
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        // Request initial data from iPhone
        if activationState == .activated {
            session.sendMessage(["request": "skyData"], replyHandler: nil)
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        DispatchQueue.main.async {
            if let solarTime = message["solarTime"] as? String {
                self.skyData.solarTime = solarTime
            }
            if let body = message["celestialBody"] as? String {
                self.skyData.celestialBody = body
            }
            if let phase = message["lunarPhase"] as? String {
                self.skyData.lunarPhase = phase
            }
            if let percent = message["lunarPercent"] as? Int {
                self.skyData.lunarPercent = percent
            }
            if let distance = message["moonDistanceKm"] as? Int {
                self.skyData.moonDistanceKm = distance
            }
            if let event = message["nextEvent"] as? String {
                self.skyData.nextEvent = event
            }
            if let countdown = message["nextEventCountdown"] as? String {
                self.skyData.nextEventCountdown = countdown
            }
            if let score = message["tonightScore"] as? Int {
                self.skyData.tonightScore = score
            }
        }
    }
    
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        session(session, didReceiveMessage: applicationContext)
    }
}
