// LearnPreferencesModal.tsx — the real Learning Preferences editor (replaces the old
// "coming soon" alert). Single-select skill level + multi-select interests, persisted to
// AsyncStorage. The Learn screen reads these to order categories and lessons.
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import {
  LEARN_LEVELS,
  LEARN_INTERESTS,
  loadLearnPreferences,
  saveLearnLevel,
  saveLearnInterests,
  type LearnLevel,
  type LearnInterest
} from "./learnPreferences";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function LearnPreferencesModal({ visible, onClose }: Props) {
  const [level, setLevel] = useState<LearnLevel | null>(null);
  const [interests, setInterests] = useState<LearnInterest[]>([]);

  // Load current prefs each time the modal opens.
  useEffect(() => {
    if (!visible) return;
    let active = true;
    loadLearnPreferences().then((p) => {
      if (!active) return;
      setLevel(p.level);
      setInterests(p.interests);
    });
    return () => {
      active = false;
    };
  }, [visible]);

  function chooseLevel(next: LearnLevel) {
    tapLight();
    setLevel(next);
    saveLearnLevel(next);
  }

  function toggleInterest(next: LearnInterest) {
    tapLight();
    setInterests((prev) => {
      const updated = prev.includes(next) ? prev.filter((i) => i !== next) : [...prev, next];
      saveLearnInterests(updated);
      return updated;
    });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Learning Preferences</Text>
          <Pressable onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.intro}>
            Personalize your lessons. We'll surface the topics you care about first and match your level.
          </Text>

          <Text style={styles.sectionLabel}>SKILL LEVEL</Text>
          <View style={styles.pillRow}>
            {LEARN_LEVELS.map((l) => {
              const active = level === l.key;
              return (
                <Pressable
                  key={l.key}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => chooseLevel(l.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{l.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>INTERESTS</Text>
          {LEARN_INTERESTS.map((i) => {
            const checked = interests.includes(i.key);
            return (
              <Pressable
                key={i.key}
                style={styles.checkRow}
                onPress={() => toggleInterest(i.key)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
              >
                <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                  {checked && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkLabel}>{i.label}</Text>
              </Pressable>
            );
          })}

          <Text style={styles.note}>Saved automatically. Open the Learn tab to see your personalized order.</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AuraLunisColors.cosmicBlack ?? "#03060F" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)"
  },
  title: { color: "#FFF", fontSize: 20, fontWeight: "900", letterSpacing: -0.4 },
  done: { color: AuraLunisColors.gold, fontSize: 16, fontWeight: "800" },
  body: { padding: 20, paddingBottom: 48 },
  intro: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 21, marginBottom: 22 },
  sectionLabel: { color: AuraLunisColors.gold, fontSize: 11, letterSpacing: 2, fontWeight: "900", marginBottom: 12, marginTop: 8 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    borderWidth: 1, borderColor: AuraLunisColors.borderSubtle, backgroundColor: "rgba(255,255,255,0.04)"
  },
  pillActive: { borderColor: "rgba(217,168,78,0.5)", backgroundColor: "rgba(217,168,78,0.14)" },
  pillText: { color: AuraLunisColors.silver, fontSize: 14, fontWeight: "700" },
  pillTextActive: { color: AuraLunisColors.gold },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12 },
  checkbox: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: AuraLunisColors.borderSubtle,
    alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)"
  },
  checkboxOn: { borderColor: AuraLunisColors.gold, backgroundColor: "rgba(217,168,78,0.18)" },
  checkMark: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "900" },
  checkLabel: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  note: { color: AuraLunisColors.faint, fontSize: 12, lineHeight: 18, marginTop: 26 }
});
