// CelestialCalendarScreen.tsx
// Upcoming sky events for 2026-2027 — meteor showers, eclipses, oppositions,
// conjunctions, supermoons, comets. Grouped into This Week / Highlights / Upcoming.
// Each event can deep-link into Sky Lens. Data from the prebuilt CelestialEvents
// catalog; local notifications scheduled on mount.

import React, { useMemo } from "react";
import { formatWeekdayDay } from "@/utils/formatting";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import {
  getThisWeekEvents,
  getHighlightEvents,
  getUpcomingEvents,
  type CelestialEvent,
  type EventType,
} from "@/data/CelestialEvents";
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";

interface Props {
  onClose: () => void;
  onSeeInSky?: (event: CelestialEvent) => void;
}

const TYPE_ICON: Record<EventType, string> = {
  meteor: "🌠",
  eclipse: "🌑",
  conjunction: "🪐",
  opposition: "🔭",
  supermoon: "🌕",
  comet: "☄️",
  equinox: "☀️",
  solstice: "❄️",
  transit: "⚫",
  occultation: "🌘",
};

function formatDate(iso: string): string {
  return formatWeekdayDay(new Date(`${iso}T12:00:00`));
}

function EventRow({ event, onSeeInSky, isPremium, onUpgrade }: {
  event: CelestialEvent;
  onSeeInSky?: (e: CelestialEvent) => void;
  isPremium: boolean;
  onUpgrade: () => void;
}) {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHead}>
        <Text style={styles.eventIcon}>{TYPE_ICON[event.type] ?? "✦"}</Text>
        <View style={styles.eventHeadText}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventDate}>
            {formatDate(event.date)}
            {event.endDate ? ` – ${formatDate(event.endDate)}` : ""}
          </Text>
        </View>
        <Text style={styles.rating}>{"★".repeat(event.rating)}</Text>
      </View>

      <Text style={styles.eventDesc}>{event.description}</Text>

      {/* Basic browsing (name/date/rating/description) is free. The advanced details — best
          time, where to look, and moon interference — are premium. Non-entitled users see a
          locked pill that opens the paywall instead of the detail chips. */}
      {isPremium ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>🕐 {event.bestTime}</Text>
          {event.direction ? <Text style={styles.metaChip}>🧭 {event.direction}</Text> : null}
          {event.moonInterference ? (
            <Text style={styles.metaChip}>🌙 {event.moonInterference} interference</Text>
          ) : null}
        </View>
      ) : (
        <Pressable style={styles.lockedMeta} onPress={() => { tapLight(); onUpgrade(); }} hitSlop={6}>
          <Text style={styles.lockedMetaText}>🔒 Best time, where to look & moon details · Premium</Text>
        </Pressable>
      )}

      {onSeeInSky && (
        <Pressable
          style={styles.seeBtn}
          onPress={() => { tapLight(); onSeeInSky(event); }}
          hitSlop={8}
        >
          <Text style={styles.seeBtnText}>See in Sky Lens ›</Text>
        </Pressable>
      )}
    </View>
  );
}

export function CelestialCalendarScreen({ onClose, onSeeInSky }: Props) {
  const { isPremium } = useEntitlement();
  const { openPaywall } = usePaywallNavigation();
  const thisWeek = useMemo(() => getThisWeekEvents(), []);
  const highlights = useMemo(() => getHighlightEvents(4).slice(0, 6), []);
  const upcoming = useMemo(() => getUpcomingEvents(40), []);

  const highlightIds = useMemo(() => new Set(highlights.map((e) => e.id)), [highlights]);
  const weekIds = useMemo(() => new Set(thisWeek.map((e) => e.id)), [thisWeek]);
  // Upcoming list excludes what's already surfaced above, to avoid repetition.
  const restUpcoming = upcoming.filter((e) => !highlightIds.has(e.id) && !weekIds.has(e.id));

  return (
    <ScreenShell title="Celestial Calendar" subtitle="What's coming" background={<Starfield />}>
      <Pressable style={styles.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      {thisWeek.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>THIS WEEK</Text>
          {thisWeek.map((e) => <EventRow key={e.id} event={e} onSeeInSky={onSeeInSky} isPremium={isPremium} onUpgrade={openPaywall} />)}
        </>
      )}

      {highlights.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>UPCOMING HIGHLIGHTS</Text>
          {highlights.map((e) => <EventRow key={e.id} event={e} onSeeInSky={onSeeInSky} isPremium={isPremium} onUpgrade={openPaywall} />)}
        </>
      )}

      {restUpcoming.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>ALL UPCOMING</Text>
          {restUpcoming.map((e) => <EventRow key={e.id} event={e} onSeeInSky={onSeeInSky} isPremium={isPremium} onUpgrade={openPaywall} />)}
        </>
      )}

      <View style={{ height: 32 }} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backBtn: { alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 4, marginBottom: 4 },
  backText: { color: AuraLunisColors.gold2, fontSize: 16, fontWeight: "700" },
  sectionTitle: {
    color: "rgba(233,236,245,0.6)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
  },
  eventCard: {
    backgroundColor: "rgba(12,16,28,0.6)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.18)",
    padding: 16,
    marginBottom: 12,
  },
  eventHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  eventIcon: { fontSize: 26 },
  eventHeadText: { flex: 1 },
  eventName: { color: "#F3ECDD", fontSize: 16, fontWeight: "800" },
  eventDate: { color: AuraLunisColors.gold2, fontSize: 12.5, fontWeight: "600", marginTop: 2 },
  rating: { color: AuraLunisColors.gold, fontSize: 13, letterSpacing: 1 },
  eventDesc: { color: "rgba(233,236,245,0.82)", fontSize: 13.5, lineHeight: 19, marginTop: 12 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  lockedMeta: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "rgba(217,168,78,0.10)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.35)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  lockedMetaText: { color: AuraLunisColors.gold2, fontSize: 11.5, fontWeight: "700" },
  metaChip: {
    color: "rgba(233,236,245,0.78)",
    fontSize: 11.5,
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  seeBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "rgba(217,168,78,0.16)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.45)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  seeBtnText: { color: AuraLunisColors.gold2, fontSize: 13, fontWeight: "800" },
});
