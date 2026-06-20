// Catches JS crashes and shows a recovery screen.
// Uses require("react").Component to work around type resolution.
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";

const React = require("react") as { Component: any; createElement: any };

type Props = { children: unknown };
type State = { hasError: boolean; error: string };

export class ErrorBoundary extends (React.Component as any) {
  state: State = { hasError: false, error: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  render() {
    const self = this as unknown as { state: State; props: Props; setState: (s: Partial<State>) => void };
    if (self.state.hasError) {
      return React.createElement(View, { style: s.container },
        React.createElement(Text, { style: s.icon }, "✦"),
        React.createElement(Text, { style: s.title }, "Something went wrong"),
        React.createElement(Text, { style: s.body }, "Chronaura encountered an unexpected error. Your Vault data is safe."),
        React.createElement(Text, { style: s.detail }, self.state.error),
        React.createElement(Pressable, { style: s.button, onPress: () => self.setState({ hasError: false, error: "" }) },
          React.createElement(Text, { style: s.buttonText }, "Try Again")
        )
      );
    }
    return self.props.children;
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChronauraColors.cosmicBlack, alignItems: "center", justifyContent: "center", padding: 32 },
  icon: { fontSize: 48, color: ChronauraColors.gold, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: "#FFF", marginBottom: 8 },
  body: { fontSize: 14, color: ChronauraColors.silver, textAlign: "center", lineHeight: 22 },
  detail: { fontSize: 11, color: ChronauraColors.faint, textAlign: "center", marginTop: 12, marginBottom: 24 },
  button: { backgroundColor: ChronauraColors.gold, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12 },
  buttonText: { color: "#030816", fontWeight: "800", fontSize: 14 }
});
