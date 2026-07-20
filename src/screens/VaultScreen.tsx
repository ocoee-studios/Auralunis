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
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";

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
  const { isPremium } = useEntitlement();
  const { openPaywall } = usePaywallNavigation();

  // Newest first — sort a copy so we never mutate context state.
  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO)),
    [items]
  );

  // Entitlement guard: the Encrypted Vault is an entirely premium feature. A non-entitled user
  // must never read saved observations. This is a tab root (no caller to return to), so render a
  // locked premium placeholder in place of the log; "Unlock Premium" opens the existing paywall.
  if (!isPremium) {
    return (
      <ScreenShell title="Vault" subtitle="Your Sky Log">
        <View style={styles.gateCard}>
          <Text style={styles.gateIcon}>◈</Text>
          <Text style={styles.gateTitle}>Encrypted Vault</Text>
          <Text style={styles.gateBadge}>PREMIUM FEATURE</Text>
          <Text style={styles.gateDesc}>
            Your private, encrypted sky log — Cosmic Notes, saved objects, captures, and lesson
            marks, all in one place. Unlock Premium to open your Vault.
          </Text>
          <Pressable style={styles.unlockBtn} onPress={() => { tapLight(); openPaywall(); }}>
            <Text style={styles.unlockText}>✦ Unlock Premium</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

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
  gateCard: { marginTop: 24, backgroundColor: "rgba(7,18,37,0.7)", borderRadius: 20, borderWidth: 1, borderColor: AuraLunisColors.gold, padding: 24, alignItems: "center" },
  gateIcon: { fontSize: 32, color: AuraLunisColors.gold, marginBottom: 10 },
  gateTitle: { color: AuraLunisColors.gold2, fontSize: 22, fontWeight: "900", textAlign: "center" },
  gateBadge: { color: AuraLunisColors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", marginTop: 4, marginBottom: 12 },
  gateDesc: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 21, textAlign: "center", marginBottom: 20 },
  unlockBtn: { backgroundColor: AuraLunisColors.gold, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignItems: "center" },
  unlockText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 14 },
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
