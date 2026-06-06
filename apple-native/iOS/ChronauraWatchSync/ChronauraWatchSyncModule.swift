import ExpoModulesCore

public final class ChronauraWatchSyncModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ChronauraWatchSync")

        Function("syncWatch") {
            (
                moonPhase: String,
                tonightScore: Int,
                nextEvent: String
            ) in
            let payload = ChronauraPhoneWatchPayload(
                moonPhase: moonPhase,
                tonightScore: tonightScore,
                nextEvent: nextEvent,
                updatedAt: Date()
            )

            try ChronauraWatchSyncManager.shared.sync(payload)
        }
    }
}
