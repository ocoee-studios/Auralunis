// PaywallNavigationContext.tsx
// Global context that lets any component open the ThreeTierPaywallModal
// without prop-drilling or navigation coupling.
//
// Usage:
//   const { openPaywall } = usePaywallNavigation();
//   <TouchableOpacity onPress={openPaywall}>...</TouchableOpacity>

import React, { createContext, useContext, useState, type ReactNode } from "react";

interface PaywallNavigationContextType {
  isPaywallVisible: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
}

const PaywallNavigationContext = createContext<PaywallNavigationContextType | undefined>(undefined);

export function PaywallNavigationProvider({ children }: { children: ReactNode }) {
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);

  return (
    <PaywallNavigationContext.Provider
      value={{
        isPaywallVisible,
        openPaywall:  () => setIsPaywallVisible(true),
        closePaywall: () => setIsPaywallVisible(false),
      }}
    >
      {children}
    </PaywallNavigationContext.Provider>
  );
}

export function usePaywallNavigation(): PaywallNavigationContextType {
  const ctx = useContext(PaywallNavigationContext);
  if (!ctx) throw new Error("usePaywallNavigation must be used within PaywallNavigationProvider");
  return ctx;
}
