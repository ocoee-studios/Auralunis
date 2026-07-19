// Local calendar-date helpers.
//
// A "today"/"tonight" calendar date is a LOCAL concept — it depends on the user's device
// time zone, not on UTC. `new Date().toISOString().slice(0, 10)` returns the *UTC* date, so
// for a user far from Greenwich (e.g. Honolulu UTC-10 in the evening, or Kiritimati UTC+14
// just after midnight) it can be a day off — dropping tonight's events from lists and alerts.
//
// `localDateKey` reads the device's local calendar fields directly (no UTC round-trip). Pass
// an explicit Date to make callers deterministic in tests.

export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
