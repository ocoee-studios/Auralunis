// Wraps content that has text inputs to prevent keyboard from hiding them.
import React, { type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

type Props = { children: ReactNode };

export function KeyboardAware({ children }: Props) {
  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 }
});
