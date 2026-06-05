import * as Haptics from "expo-haptics";

const H = Haptics as unknown as {
  impactAsync: (style: string) => Promise<void>;
  notificationAsync: (type: string) => Promise<void>;
  selectionAsync: () => Promise<void>;
};

export function tapLight() { H.impactAsync("light").catch(() => {}); }
export function tapMedium() { H.impactAsync("medium").catch(() => {}); }
export function tapHeavy() { H.impactAsync("heavy").catch(() => {}); }
export function tapSelection() { H.selectionAsync().catch(() => {}); }
export function tapSuccess() { H.notificationAsync("success").catch(() => {}); }
export function tapWarning() { H.notificationAsync("warning").catch(() => {}); }
