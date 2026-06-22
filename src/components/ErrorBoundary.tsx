// Catches JS crashes anywhere in its subtree and shows a recovery screen instead of
// a white-screen crash — the production safety net around the Sky renderer, the
// sensor manager, and Settings. Properly typed so it can be used as a JSX component.
import { Component, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={s.container}>
          <Text style={s.icon}>✦</Text>
          <Text style={s.title}>Something went wrong</Text>
          <Text style={s.body}>AuraLunis encountered an unexpected error. Your Vault data is safe.</Text>
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
  container: { flex: 1, backgroundColor: AuraLunisColors.cosmicBlack, alignItems: "center", justifyContent: "center", padding: 32 },
  icon: { fontSize: 48, color: AuraLunisColors.gold, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: "#FFF", marginBottom: 8 },
  body: { fontSize: 14, color: AuraLunisColors.silver, textAlign: "center", lineHeight: 22 },
  detail: { fontSize: 11, color: AuraLunisColors.faint, textAlign: "center", marginTop: 12, marginBottom: 24 },
  button: { backgroundColor: AuraLunisColors.gold, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12 },
  buttonText: { color: "#030816", fontWeight: "800", fontSize: 14 }
});
