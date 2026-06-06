import Foundation
import WatchConnectivity

@MainActor
final class ChronauraWatchConnectivityBridge: NSObject, ObservableObject {
    @Published private(set) var payload: ChronauraWatchPayload = .preview
    @Published private(set) var activationState: WCSessionActivationState = .notActivated

    private let session: WCSession? = WCSession.isSupported() ? .default : nil

    override init() {
        super.init()
        session?.delegate = self
        session?.activate()
    }

    private func apply(_ dictionary: [String: Any]) {
        guard let decoded = ChronauraWatchPayload(dictionary: dictionary) else {
            return
        }

        payload = decoded
    }
}

extension ChronauraWatchConnectivityBridge: WCSessionDelegate {
    nonisolated func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {
        Task { @MainActor in
            self.activationState = activationState

            if activationState == .activated {
                self.apply(session.applicationContext)
            }
        }
    }

    nonisolated func session(
        _ session: WCSession,
        didReceiveApplicationContext applicationContext: [String: Any]
    ) {
        Task { @MainActor in
            self.apply(applicationContext)
        }
    }

    nonisolated func session(
        _ session: WCSession,
        didReceiveMessage message: [String: Any]
    ) {
        Task { @MainActor in
            self.apply(message)
        }
    }
}
