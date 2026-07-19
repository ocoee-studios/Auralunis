// Local notification scheduler for sky events. Computes upcoming sunset and
// moonrise from the ephemeris and schedules alerts 30 minutes before each.
// Planet-rise notifications are a planned expansion.

import * as Notifications from "expo-notifications";
import type { TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { localDateKey } from "@/utils/localDate";

// Typed accessor: expo-notifications' published types under classic resolution
// may only surface a subset. Runtime API matches Expo SDK 51 docs.
const Notifs = Notifications as unknown as {
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  scheduleNotificationAsync: (request: {
    content: { title: string; body: string; data?: Record<string, unknown> };
    trigger: { date: Date } | null;
  }) => Promise<string>;
  cancelAllScheduledNotificationsAsync: () => Promise<void>;
  setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }) => void;
};

const LEAD_TIME_MS = 30 * 60 * 1000;

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifs.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifs.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export function configureNotificationHandler(): void {
  try {
    Notifs.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
      })
    });
  } catch {
    // Notifications unavailable in this environment (simulator, web).
  }
}

export async function scheduleSkyEventNotifications(
  sky: TonightSky
): Promise<number> {
  const granted = await requestNotificationPermission();
  if (!granted) return 0;

  // Cancel previous schedules to avoid duplicates across refreshes.
  await Notifs.cancelAllScheduledNotificationsAsync();

  const now = Date.now();
  let scheduled = 0;

  // Sunset: the observing window is about to open.
  if (sky.sun.setISO) {
    const eventTime = Date.parse(sky.sun.setISO);
    const notifyAt = eventTime - LEAD_TIME_MS;
    if (notifyAt > now) {
      await Notifs.scheduleNotificationAsync({
        content: {
          title: "Sunset approaching",
          body: "Your observing window opens soon. Tonight's sky is waiting.",
          data: { event: "sunset" }
        },
        trigger: { date: new Date(notifyAt) }
      });
      scheduled += 1;
    }
  }

  // Moonrise.
  if (sky.moon.riseISO) {
    const eventTime = Date.parse(sky.moon.riseISO);
    const notifyAt = eventTime - LEAD_TIME_MS;
    if (notifyAt > now) {
      await Notifs.scheduleNotificationAsync({
        content: {
          title: `Moonrise soon · ${sky.moonIlluminationPercent}% illuminated`,
          body: "The Moon is about to rise. Open Sky Lens to watch.",
          data: { event: "moonrise" }
        },
        trigger: { date: new Date(notifyAt) }
      });
      scheduled += 1;
    }
  }

  return scheduled;
}

// Schedule reminders for upcoming celestial events (meteor showers, eclipses,
// oppositions…). ADDITIVE — does NOT cancel existing notifications, so it composes
// with scheduleSkyEventNotifications (call it right after, since that one cancels
// all first → no duplicate stacking across reschedules). Capped to the next few
// highlight events to stay well under the OS pending-notification limit.
export async function scheduleCelestialEventNotifications(
  events: Array<{ id: string; name: string; date: string; type: string; bestTime: string; rating: number }>,
  maxEvents = 6
): Promise<number> {
  const granted = await requestNotificationPermission();
  if (!granted) return 0;

  const now = Date.now();
  const todayISO = localDateKey(new Date(now)); // LOCAL calendar day, not UTC
  const upcoming = events
    .filter((e) => e.date > todayISO && e.rating >= 3)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, maxEvents);

  let scheduled = 0;
  for (const e of upcoming) {
    // Day-of at 7 PM local — the observing window is tonight.
    const dayOf = new Date(`${e.date}T19:00:00`).getTime();
    if (dayOf > now) {
      await Notifs.scheduleNotificationAsync({
        content: {
          title: `Tonight: ${e.name}`,
          body: `${e.bestTime}. Open AuraLunis to find it in the sky.`,
          data: { event: "celestial", id: e.id },
        },
        trigger: { date: new Date(dayOf) },
      });
      scheduled += 1;
    }
    // 1 day before at 7 PM — a heads-up to plan.
    const dayBefore = dayOf - 24 * 60 * 60 * 1000;
    if (dayBefore > now) {
      await Notifs.scheduleNotificationAsync({
        content: {
          title: `Tomorrow night: ${e.name}`,
          body: `${e.bestTime}. Don't miss it.`,
          data: { event: "celestial", id: e.id },
        },
        trigger: { date: new Date(dayBefore) },
      });
      scheduled += 1;
    }
  }
  return scheduled;
}
