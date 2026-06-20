// Typed accessor for NativeModules (resolves classic module type gap).
const NativeModules = (require("react-native") as { NativeModules: Record<string, unknown> }).NativeModules;

type WatchSyncPayload = {
  moonPhase: string;
  tonightScore: number;
  nextEvent: string;
};

type AuraLunisWatchSyncNativeModule = {
  syncWatch: (
    moonPhase: string,
    tonightScore: number,
    nextEvent: string
  ) => void;
};

const nativeModule = NativeModules.AuraLunisWatchSync as
  | AuraLunisWatchSyncNativeModule
  | undefined;

export function syncAuraLunisWatch(payload: WatchSyncPayload) {
  if (!nativeModule) {
    return;
  }

  nativeModule.syncWatch(
    payload.moonPhase,
    payload.tonightScore,
    payload.nextEvent
  );
}
