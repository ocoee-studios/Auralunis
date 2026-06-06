import SwiftUI

@main
struct ChronauraWatchApp: App {
    @StateObject private var session = WatchSessionManager()
    
    var body: some Scene {
        WindowGroup {
            ChronauraWatchFace()
                .environmentObject(session)
        }
    }
}
