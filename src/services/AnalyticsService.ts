// Lightweight analytics for conversion tracking. Events are logged locally and
// can be wired to any backend (RevenueCat, Mixpanel, Firebase) by replacing the
// `send` function. For v1, events go to AsyncStorage as a local log and
// console.log in __DEV__.
//
// Key events to watch after launch:
//   paywall_impression   — how many users see the paywall
//   toggle_monthly       — user switched to monthly (vs default annual)
//   toggle_annual        — user switched back to annual
//   purchase_tap         — user tapped the purchase button (conversion intent)
//   continue_free        — user declined (compare to impression for drop-off rate)
//   purchase_complete    — StoreKit confirmed (actual conversion)
//   purchase_cancelled   — user cancelled in StoreKit sheet

import AsyncStorage from "@react-native-async-storage/async-storage";

export type PaywallEventName =
  | "paywall_impression"
  | "toggle_monthly"
  | "toggle_annual"
  | "purchase_tap"
  | "continue_free"
  | "purchase_complete"
  | "purchase_cancelled";

interface AnalyticsEvent {
  name: PaywallEventName;
  properties: Record<string, unknown>;
  timestamp: string;
}

const EVENT_LOG_KEY = "auralunis.analytics.paywall_events";
const MAX_LOCAL_EVENTS = 200;

async function appendLocalEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(EVENT_LOG_KEY);
    const log: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    log.push(event);
    // Keep only the most recent events to bound storage.
    const trimmed = log.length > MAX_LOCAL_EVENTS ? log.slice(-MAX_LOCAL_EVENTS) : log;
    await AsyncStorage.setItem(EVENT_LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // Analytics should never crash the app.
  }
}

// Replace this function to wire a real analytics backend.
async function send(event: AnalyticsEvent): Promise<void> {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event.name}`, event.properties);
  }
  await appendLocalEvent(event);
}

export function trackPaywallEvent(
  name: PaywallEventName,
  properties: Record<string, unknown> = {}
): void {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString()
  };
  // Fire-and-forget: don't await so the UI stays responsive.
  void send(event);
}

// Read the local event log (useful for debugging / export).
export async function getPaywallEventLog(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(EVENT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearPaywallEventLog(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EVENT_LOG_KEY);
  } catch {
    // No-op.
  }
}
