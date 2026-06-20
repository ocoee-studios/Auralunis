import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { ChronauraColors } from "@/theme/tokens";
import { generateSovereignSigilPreview } from "@/features/future/SovereignSigilService";
import type { SovereignSigilRender } from "@/features/future/SovereignSigilTypes";

export function SovereignSigilPreview() {
  const [nonce, setNonce] = useState(0);
  const [sigil, setSigil] = useState<SovereignSigilRender | undefined>(undefined);
  const [generationFailed, setGenerationFailed] = useState(false);

  useEffect(() => {
    let active = true;

    setGenerationFailed(false);

    generateSovereignSigilPreview(
      "chronaura-local-preview-salt",
      "normalized-birth-sky-preview-hash",
      nonce
    )
      .then((next) => {
        if (active) setSigil(next);
      })
      .catch(() => {
        if (active) {
          setSigil(undefined);
          setGenerationFailed(true);
        }
      });

    return () => {
      active = false;
    };
  }, [nonce]);

  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>SOVEREIGN · LOCAL-SAFE PREVIEW</Text>
      <Text style={styles.title}>Sovereign Sigil</Text>
      <Text style={styles.copy}>
        Generates a SHA-256-derived local vector preview without exposing raw
        birth coordinates or a raw device identifier.
      </Text>

      <View style={styles.preview}>
        <Svg width={180} height={180} viewBox="0 0 120 120">
          <Circle
            cx="60"
            cy="60"
            r="43"
            stroke={ChronauraColors.gold}
            strokeWidth="0.8"
            opacity="0.5"
            fill="none"
          />
          <Circle
            cx="60"
            cy="60"
            r="28"
            stroke={ChronauraColors.silver}
            strokeWidth="0.6"
            opacity="0.35"
            fill="none"
          />
          {sigil?.paths.map((path) => (
            <Path
              key={path.id}
              d={path.d}
              stroke={ChronauraColors.gold2}
              strokeWidth={path.strokeWidth}
              opacity={path.opacity}
              fill="none"
            />
          ))}
        </Svg>
      </View>

      <Text style={styles.fingerprint}>
        Fingerprint: {generationFailed ? "preview unavailable" : sigil?.seedFingerprint ?? "generating…"}
      </Text>

      <Pressable style={styles.button} onPress={() => setNonce((value) => value + 1)}>
        <Text style={styles.buttonText}>Regenerate Local Preview</Text>
      </Pressable>

      <Text style={styles.note}>
        Production WidgetKit output remains disabled until Sovereign launches.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "rgba(217,168,78,0.06)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.18)"
  },
  eyebrow: {
    color: ChronauraColors.gold2,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "900"
  },
  title: { color: "#FFF", fontSize: 21, fontWeight: "900", marginTop: 7 },
  copy: {
    color: ChronauraColors.silver,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  },
  preview: { alignItems: "center", marginTop: 8 },
  fingerprint: {
    color: ChronauraColors.gold2,
    fontSize: 11,
    textAlign: "center"
  },
  button: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(217,168,78,0.13)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.25)"
  },
  buttonText: { color: "#FFF", fontWeight: "900" },
  note: {
    color: ChronauraColors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8
  }
});
