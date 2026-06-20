import ExpoModulesCore

public final class AuraLunisWatchSyncModule: Module {
    public func definition() -> ModuleDefinition {
        Name("AuraLunisWatchSync")

        Function("syncWatch") {
            (
                moonPhase: String,
                tonightScore: Int,
                nextEvent: String
            ) in
            let payload = AuraLunisPhoneWatchPayload(
                moonPhase: moonPhase,
                tonightScore: tonightScore,
                nextEvent: nextEvent,
                updatedAt: Date()
            )

            try AuraLunisWatchSyncManager.shared.sync(payload)
        }
    }
}
