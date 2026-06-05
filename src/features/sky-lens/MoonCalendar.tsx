// Monthly moon phase calendar. Each day shows a circle sized/shaded by illumination.
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";
import { computeMoonCalendar, type MoonDay } from "@/services/MoonCalendarService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

type Props = { location: ObserverLocation; year: number; month: number };

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MoonCalendar({ location, year, month }: Props) {
  const days = useMemo(() => computeMoonCalendar(year, month, location), [year, month, location]);
  const firstDow = new Date(year, month - 1, 1).getDay();
  const blanks = Array.from({ length: firstDow }, (_, i) => i);

  return (
    <View style={s.container}>
      <Text style={s.title}>{MONTH_NAMES[month - 1]} {year} · Moon Phases</Text>
      <View style={s.header}>
        {WEEKDAYS.map((d, i) => <Text key={i} style={s.dow}>{d}</Text>)}
      </View>
      <View style={s.grid}>
        {blanks.map((i) => <View key={`b${i}`} style={s.cell} />)}
        {days.map((day) => (
          <View key={day.date.getDate()} style={s.cell}>
            <View style={[s.moon, { opacity: 0.2 + (day.illumination / 100) * 0.8 }]} />
            <Text style={s.dayNum}>{day.date.getDate()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: 12 },
  title: { color: ChronauraColors.gold2, fontSize: 14, fontWeight: "900", marginBottom: 10 },
  header: { flexDirection: "row" },
  dow: { flex: 1, textAlign: "center", color: ChronauraColors.muted, fontSize: 10, fontWeight: "700", marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", alignItems: "center", paddingVertical: 6 },
  moon: { width: 22, height: 22, borderRadius: 11, backgroundColor: ChronauraColors.silver },
  dayNum: { color: ChronauraColors.muted, fontSize: 9, marginTop: 2 }
});
