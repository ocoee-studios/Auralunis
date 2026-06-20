import Foundation
import WatchConnectivity

final class AuraLunisWatchSyncManager: NSObject {
    static let shared = AuraLunisWatchSyncManager()

    private let session: WCSession? = WCSession.isSupported() ? .default : nil

    private override init() {
        super.init()
        session?.delegate = self
        session?.activate()
    }

    func sync(_ payload: AuraLunisPhoneWatchPayload) throws {
        guard let session else {
            return
        }

        let dictionary = payload.dictionary

        try session.updateApplicationContext(dictionary)

        if session.isReachable {
            session.sendMessage(
                dictionary,
                replyHandler: nil,
                errorHandler: nil
            )
        }
    }
}

extension AuraLunisWatchSyncManager: WCSessionDelegate {
    func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {}

    func sessionDidBecomeInactive(_ session: WCSession) {}

    func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
    }
}
