import SwiftUI

@main
struct ChronauraWatchApp: App {
    @StateObject private var connectivity = ChronauraWatchConnectivityBridge()

    var body: some Scene {
        WindowGroup {
            AstrolabeFaceView()
                .environmentObject(connectivity)
        }
    }
}
