// Birth-time conversion — pure Date/Intl, no React Native imports, so it is unit-testable.
//
// A birth chart needs the absolute UTC INSTANT of birth, derived from the birth wall-clock
// time interpreted in the BIRTHPLACE's IANA time zone (separate from the device zone and from
// the birthplace's latitude/longitude). Daylight-saving transitions make some local wall times
// either NONEXISTENT (spring-forward: the hour is skipped) or AMBIGUOUS (fall-back: the hour
// occurs twice). We never silently pick one — we report the edge so the UI can ask the user to
// verify, honoring the app's rule against presenting guessed time data as authoritative.

export type BirthMomentResult =
  | { kind: "valid"; utc: Date }
  | { kind: "nonexistent-local-time" } // spring-forward gap: the entered time never occurred
  | { kind: "ambiguous-local-time"; earlier: Date; later: Date } // fall-back overlap: occurred twice
  | { kind: "invalid-time-zone" };

const DAY_MS = 86400000;

/** Offset (ms) of `timeZone` from UTC at the instant `utcMs`, DST-aware, via Intl. */
function offsetMsAt(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(utcMs));
  const v: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") v[p.type] = Number(p.value);
  return Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second) - utcMs;
}

/** Local wall-clock "YYYY-MM-DD HH:MM" of a UTC instant in `timeZone`. */
function wallStringAt(utcMs: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(utcMs));
  const v: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") v[p.type] = p.value;
  return `${v.year}-${v.month}-${v.day} ${v.hour}:${v.minute}`;
}

/**
 * Resolve a birthplace wall time (`YYYY-MM-DD`, `HH:MM`, IANA `timeZone`) to the absolute UTC
 * instant, explicitly detecting DST edges:
 *   1. Sample the zone offset one day BEFORE and one day AFTER the wall time — those bracket
 *      any single transition, giving the offset on each side.
 *   2. Interpreting the wall time with each offset yields up to two candidate UTC instants.
 *   3. A candidate is REAL only if it round-trips back to the exact requested wall time.
 *   4. Two distinct real candidates → ambiguous (fall-back). Zero → nonexistent (spring-forward).
 * A normal time yields a single real candidate → { kind: "valid" }.
 */
export function resolveBirthMoment(dateText: string, timeText: string, timeZone: string): BirthMomentResult {
  const [year, month, day] = dateText.split("-").map(Number);
  const [hour, minute] = timeText.split(":").map(Number);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);

  let offBefore: number;
  let offAfter: number;
  try {
    offBefore = offsetMsAt(localAsUtc - DAY_MS, timeZone);
    offAfter = offsetMsAt(localAsUtc + DAY_MS, timeZone);
  } catch {
    return { kind: "invalid-time-zone" };
  }

  const want = `${dateText} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const candBefore = localAsUtc - offBefore;
  const candAfter = localAsUtc - offAfter;
  const beforeReal = wallStringAt(candBefore, timeZone) === want;
  const afterReal = wallStringAt(candAfter, timeZone) === want;

  if (beforeReal && afterReal && candBefore !== candAfter) {
    const earlier = Math.min(candBefore, candAfter);
    const later = Math.max(candBefore, candAfter);
    return { kind: "ambiguous-local-time", earlier: new Date(earlier), later: new Date(later) };
  }
  if (beforeReal) return { kind: "valid", utc: new Date(candBefore) };
  if (afterReal) return { kind: "valid", utc: new Date(candAfter) };
  return { kind: "nonexistent-local-time" };
}
