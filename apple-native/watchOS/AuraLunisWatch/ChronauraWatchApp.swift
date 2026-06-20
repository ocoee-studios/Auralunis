import SwiftUI

@main
struct AuraLunisWatchApp: App {
    @StateObject private var connectivity = AuraLunisWatchConnectivityBridge()

    var body: some Scene {
        WindowGroup {
            AstrolabeFaceView()
                .environmentObject(connectivity)
        }
    }
}
