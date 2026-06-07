// Catches JS crashes and shows a recovery screen instead of white screen of death.
import React, { Component, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("Chronaura ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={s.container}>
          <Text style={s.icon}>✦</Text>
          <Text style={s.title}>Something went wrong</Text>
          <Text style={s.body}>Chronaura encountered an unexpected error. Your Vault data is safe.</Text>
          <Text style={s.detail}>{this.state.error}</Text>
          <Pressable style={s.button} onPress={() => this.setState({ hasError: false, error: "" })}>
            <Text style={s.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChronauraColors.cosmicBlack, alignItems: "center", justifyContent: "center", padding: 32 },
  icon: { fontSize: 48, color: ChronauraColors.gold, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: "#FFF", marginBottom: 8 },
  body: { fontSize: 14, color: ChronauraColors.silver, textAlign: "center", lineHeight: 22 },
  detail: { fontSize: 11, color: ChronauraColors.faint, textAlign: "center", marginTop: 12, marginBottom: 24 },
  button: { backgroundColor: ChronauraColors.gold, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12 },
  buttonText: { color: "#0B0B12", fontWeight: "800", fontSize: 14 }
});
