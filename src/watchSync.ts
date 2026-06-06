// Typed accessor for NativeModules (resolves classic module type gap).
const NativeModules = (require("react-native") as { NativeModules: Record<string, unknown> }).NativeModules;

type WatchSyncPayload = {
  moonPhase: string;
  tonightScore: number;
  nextEvent: string;
};

type ChronauraWatchSyncNativeModule = {
  syncWatch: (
    moonPhase: string,
    tonightScore: number,
    nextEvent: string
  ) => void;
};

const nativeModule = NativeModules.ChronauraWatchSync as
  | ChronauraWatchSyncNativeModule
  | undefined;

export function syncChronauraWatch(payload: WatchSyncPayload) {
  if (!nativeModule) {
    return;
  }

  nativeModule.syncWatch(
    payload.moonPhase,
    payload.tonightScore,
    payload.nextEvent
  );
}
