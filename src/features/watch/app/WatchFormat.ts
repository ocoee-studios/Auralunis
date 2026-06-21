// Small presentation helpers shared by the watch tabs.

const COMPASS_8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function azimuthToCompass(azimuthDegrees: number): string {
  const idx = Math.round((((azimuthDegrees % 360) + 360) % 360) / 45) % 8;
  return COMPASS_8[idx];
}

// Plain-language "where to look" guidance from a horizontal position.
export function lookGuidance(azimuthDegrees: number, altitudeDegrees: number): string {
  const dir = azimuthToCompass(azimuthDegrees);
  const height =
    altitudeDegrees < 20
      ? "low on the horizon"
      : altitudeDegrees < 50
        ? "about a third of the way up"
        : "high overhead";
  return `Look ${dir}, ${height}`;
}

export function formatClock(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function formatISOClock(iso: string | null): string {
  if (!iso) return "—";
  return formatClock(new Date(iso));
}

// Glyphs for the naked-eye bodies the watch shows.
const GLYPHS: Record<string, string> = {
  sun: "☀",
  moon: "☾",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄"
};

export function bodyGlyph(id: string): string {
  return GLYPHS[id] ?? "•";
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}
