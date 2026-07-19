// Device-locale-aware date/time formatting helpers.
//
// Every user-facing date/time in the app used to be hard-coded to "en-US", which forced
// US month/day ordering, English weekday/month names, and US AM/PM regardless of the
// device's language/region. These thin wrappers delegate straight to the platform Intl
// APIs but default the locale to the DEVICE locale (locale omitted → runtime default).
//
// Each helper accepts an explicit `locale` argument purely so the self-test can pin a
// locale and be machine-independent; production call sites omit it.
//
// Scope guarantees (see PR-7): these never set or change `timeZone`, never change the
// Date value/instant, and never touch numeric/scientific precision. They only choose the
// locale used to render an already-decided Date with already-decided options.

/** Clock time, e.g. "9:41 PM" (en-US) / "21:41" (en-GB). */
export function formatClockTime(date: Date, locale?: string): string {
  return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

/** Hour only, e.g. "9 PM" (en-US) / "21" (de-DE). */
export function formatHour(date: Date, locale?: string): string {
  return date.toLocaleTimeString(locale, { hour: "numeric" });
}

/** Medium date, e.g. "Jul 19, 2026" (en-US) / "19. Juli 2026" (de-DE, short month). */
export function formatMediumDate(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

/** Short weekday + short month + day, e.g. "Sun, Jul 19". */
export function formatWeekdayDay(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
}

/** Full weekday + full month + day, e.g. "Sunday, July 19". Callers may upper-case. */
export function formatFullWeekdayDate(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });
}

/** Long date, e.g. "July 19, 2026". */
export function formatLongDate(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
}

/** Combined date + time, e.g. "Jul 19, 2026, 9:41 PM". */
export function formatDateTime(date: Date, locale?: string): string {
  return date.toLocaleString(locale, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}
