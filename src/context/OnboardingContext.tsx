// OnboardingContext.tsx
// Global context that lets any component (e.g. Settings → "Replay Tutorial") re-open the
// first-run onboarding without prop-drilling. Replay is a pure UI request: it re-shows the
// tutorial and NEVER touches birth data, entitlement state, RevenueCat identity, or the
// "new install" determination — App.tsx keeps the persisted onboarding flag set throughout.
//
// Usage:
//   const { replayTutorial } = useOnboarding();
//   <Pressable onPress={replayTutorial}>…</Pressable>

import React, { createContext, useContext, useState, type ReactNode } from "react";

interface OnboardingContextType {
  /** Bumped each time replay is requested; App.tsx watches this to re-show onboarding. */
  replayNonce: number;
  replayTutorial: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [replayNonce, setReplayNonce] = useState(0);

  return (
    <OnboardingContext.Provider
      value={{
        replayNonce,
        replayTutorial: () => setReplayNonce((n) => n + 1),
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
