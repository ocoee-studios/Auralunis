import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { formatClockTime, formatWeekdayDay } from "@/utils/formatting";

type Props = {
  offsetMinutes: number;          // current scrub offset from real "now", in minutes
  onChange: (minutes: number) => void;
  accent: string;
};

// Horizontal drag → minutes, piecewise so small drags are fine (minute precision)
// and long drags accelerate to hours/days. Integrating the multiplier over the drag
// distance keeps the mapping CONTINUOUS (no jump when a speed bucket changes).
const seg = (abs: number, a: number, b: number, mult: number) =>
  Math.max(0, Math.min(abs, b) - a) * mult;
function pixelsToMinutes(tx: number): number {
  const abs = Math.abs(tx);
  const mins =
    seg(abs, 0, 60, 1) +      // ×1   — fine, minute by minute
    seg(abs, 60, 160, 10) +   // ×10
    seg(abs, 160, 300, 100) + // ×100
    seg(abs, 300, 1e9, 1000); // ×1000 — days fly by
  return Math.sign(tx) * mins;
}
const speedFor = (tx: number): number => {
  const abs = Math.abs(tx);
  return abs < 60 ? 1 : abs < 160 ? 10 : abs < 300 ? 100 : 1000;
};

// ±12h fills the visible track; beyond that the thumb pins to the end.
const WINDOW_MIN = 12 * 60;

export function TimeScrubBar({ offsetMinutes, onChange, accent }: Props) {
  const startOffset = useRef(0);
  const [speed, setSpeed] = useState(1);
  const [scrubbing, setScrubbing] = useState(false);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      startOffset.current = offsetMinutes;
      setScrubbing(true);
    })
    .onUpdate((e) => {
      setSpeed(speedFor(e.translationX));
      onChange(Math.round(startOffset.current + pixelsToMinutes(e.translationX)));
    })
    .onEnd(() => setScrubbing(false))
    .onFinalize(() => setScrubbing(false));

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onEnd(() => {
      onChange(0);
      setSpeed(1);
    });

  const gesture = Gesture.Race(doubleTap, pan);

  const scrubbed = new Date(Date.now() + offsetMinutes * 60_000);
  const timeLabel = formatClockTime(scrubbed);
  const dayLabel = formatWeekdayDay(scrubbed);
  const isNow = offsetMinutes === 0;
  const offsetLabel =
    isNow ? "NOW" : `${offsetMinutes > 0 ? "+" : "−"}${humanizeOffset(Math.abs(offsetMinutes))}`;

  // Thumb position: center = NOW, clamped to ±12h of visible travel.
  const frac = Math.max(-1, Math.min(1, offsetMinutes / WINDOW_MIN));
  const thumbLeft = `${50 + frac * 46}%`;

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text style={[styles.time, { color: accent }]}>{timeLabel}</Text>
          <Text style={styles.meta}>
            {dayLabel} · {offsetLabel}
            {scrubbing && speed > 1 ? `  ×${speed}` : ""}
          </Text>
        </View>
        <View style={styles.track}>
          {/* center tick = NOW */}
          <View style={[styles.nowTick, { backgroundColor: "rgba(217,168,78,0.5)" }]} />
          <View style={[styles.fill, { backgroundColor: accent }]} />
          <View style={[styles.thumb, { left: thumbLeft as any, borderColor: accent }]} />
        </View>
        <Text style={styles.hint}>{isNow ? "Drag to time-travel · double-tap to reset" : "Double-tap to return to now"}</Text>
      </View>
    </GestureDetector>
  );
}

function humanizeOffset(min: number): string {
  if (min < 60) return `${min}m`;
  const hrs = min / 60;
  if (hrs < 48) return `${hrs % 1 === 0 ? hrs : hrs.toFixed(1)}h`;
  const days = hrs / 24;
  return `${days % 1 === 0 ? days : days.toFixed(1)}d`;
}

const styles = StyleSheet.create({
  // Trimmed ~23% (≈79pt → ≈61pt) after device review: when open, the panel shoved the
  // whole dock — and the Moon prompt with it — up into the sky. Same controls, same hit
  // targets, less air.
  wrap: {
    alignSelf: "center",
    width: "86%",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(7,10,19,0.55)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(217,168,78,0.22)",
  },
  header: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: 8 },
  time: { fontSize: 21, fontWeight: "800", letterSpacing: 0.5 },
  meta: { fontSize: 15, color: "rgba(233,236,245,0.8)", fontWeight: "600" },
  track: { height: 16, justifyContent: "center", marginTop: 4 },
  fill: { position: "absolute", left: 0, right: 0, height: 2, borderRadius: 1, opacity: 0.35 },
  nowTick: { position: "absolute", left: "50%", width: 1.5, height: 10, top: 3 },
  thumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    backgroundColor: "rgba(7,10,19,0.95)",
    borderWidth: 2,
  },
  hint: { fontSize: 14, color: "rgba(233,236,245,0.6)", textAlign: "center", marginTop: 3, letterSpacing: 0.3 },
});
