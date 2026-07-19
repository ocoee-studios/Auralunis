// VaultScreen.tsx — the personal sky observation log. Lists everything saved to the
// (already-encrypted) Vault: Cosmic Notes, saved sky objects, captures, lesson marks.
// Newest first, tap a card to expand the full note. Read-only view over the existing
// AuraLunisVaultContext — saving happens elsewhere (Home notes, Sky "Save + Find",
// lessons) via addItem/addNote.
import React, { useMemo, useState } from "react";
import { formatMediumDate } from "@/utils/formatting";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { useAuraLunisVault, type VaultItemType } from "@/state/AuraLunisVaultContext";

// User-facing label for each stored item type.
const TYPE_LABEL: Record<VaultItemType, string> = {
  note: "Note",
  lifesky: "Moment",
  capture: "Capture",
  seal: "Seal",
  lesson: "Lesson",
  archive: "Object",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return formatMediumDate(d);
}

export function VaultScreen() {
  const { items } = useAuraLunisVault();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Newest first — sort a copy so we never mutate context state.
  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO)),
    [items]
  );

  return (
    <ScreenShell title="Vault" subtitle="Your Sky Log">
      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✦</Text>
          <Text style={styles.emptyText}>Your sky observations will appear here.</Text>
          <Text style={styles.emptyHint}>
            Save a Cosmic Note from Home, or a sky object from Sky Lens, and it lands here.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.count}>{sorted.length} {sorted.length === 1 ? "entry" : "entries"}</Text>
          {sorted.map((item) => {
            const open = expandedId === item.id;
            return (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => { tapLight(); setExpandedId(open ? null : item.id); }}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${TYPE_LABEL[item.type]}, saved ${formatDate(item.createdAtISO)}`}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.tag}>{TYPE_LABEL[item.type]}</Text>
                </View>
                <Text style={styles.date}>{formatDate(item.createdAtISO)}</Text>
                {item.detail ? (
                  <Text style={styles.detail} numberOfLines={open ? undefined : 2}>{item.detail}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  emptyIcon: { color: AuraLunisColors.gold2, fontSize: 34, marginBottom: 14 },
  emptyText: { color: "#FFF", fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  emptyHint: { color: AuraLunisColors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" },
  count: { color: AuraLunisColors.faint, fontSize: 10, letterSpacing: 1.5, fontWeight: "700", textTransform: "uppercase", marginBottom: 10 },
  card: {
    borderRadius: 18, padding: 16, marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1, borderColor: "rgba(217,168,78,0.16)",
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { color: AuraLunisColors.gold2, fontSize: 16, fontWeight: "800", flex: 1 },
  tag: {
    color: AuraLunisColors.gold2, fontSize: 10, fontWeight: "700", letterSpacing: 0.5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
    borderWidth: 1, borderColor: "rgba(217,168,78,0.28)", overflow: "hidden",
  },
  date: { color: AuraLunisColors.faint, fontSize: 11, marginTop: 4 },
  detail: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 20, marginTop: 10 },
});
