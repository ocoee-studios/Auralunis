import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = { children: React.ReactNode };
type State = { error: string | null };

// Wraps the SVG overlay so a crash in any single layer (Milky Way, twinkle,
// meteors, etc.) doesn't take down the whole Sky Lens screen — the camera + HUD
// keep working, and the exact error is shown on-screen for fast diagnosis.
export class SkyLensErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(e: unknown): State {
    return { error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
  }

  componentDidCatch(e: unknown) {
    // eslint-disable-next-line no-console
    console.warn("[SkyLens overlay crashed]", e);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.box} pointerEvents="none">
          <Text style={styles.title}>Sky overlay couldn't render</Text>
          <Text style={styles.msg}>{this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "38%",
    backgroundColor: "rgba(120,12,12,0.9)",
    borderRadius: 14,
    padding: 16
  },
  title: { color: "#fff", fontWeight: "900", fontSize: 14, marginBottom: 6 },
  msg: { color: "#FFD9D9", fontSize: 12, lineHeight: 18 }
});
