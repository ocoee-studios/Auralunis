import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView as RNGestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

// react-native-gesture-handler's published types omit `children` on this
// component in some versions; it accepts them at runtime. Typed locally to match.
const GestureHandlerRootView = RNGestureHandlerRootView as unknown as React.ComponentType<{
  style?: object;
  children?: React.ReactNode;
}>;
import { NavigationContainer } from "@react-navigation/native";
import { RootTabs } from "@/navigation/RootTabs";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThreeTierPaywallModal } from "@/features/paywall/ThreeTierPaywallModal";
import { AuraLunisSettingsProvider } from "@/state/AuraLunisSettingsContext";
import { AuraLunisVaultProvider } from "@/state/AuraLunisVaultContext";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import {
  configureRevenueCat,
  purchaseAuraLunisPackage,
  restoreAuraLunisPurchases
} from "@/services/RevenueCatService";
import { plans } from "@/features/paywall/MonetizationCatalog";
import { configureNotificationHandler } from "@/services/NotificationService";
import { trackPaywallEvent } from "@/services/AnalyticsService";
import { useAuraLunisFonts } from "@/theme/useFonts";
import { PaywallNavigationProvider, usePaywallNavigation } from "@/context/PaywallNavigationContext";
import { EntitlementProvider, refreshEntitlement } from "@/context/EntitlementContext";
import { recordSession } from "@/services/ReviewPromptService";

const ONBOARDING_SEEN_KEY = "auralunis.onboarding.seen";

// Bridges the global PaywallNavigationContext to App.tsx's local paywallVisible state.
// Mounted inside PaywallNavigationProvider so it can read the context.
function PaywallBridge({ onOpen }: { onOpen: () => void }) {
  const { isPaywallVisible } = usePaywallNavigation();
  React.useEffect(() => {
    if (isPaywallVisible) onOpen();
  }, [isPaywallVisible]);
  return null;
}

export default function App() {
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    let active = true;

    async function initialize() {
      configureNotificationHandler();
      void recordSession();

      void configureRevenueCat().catch(() => {
        // Keep the free Horizon experience usable if purchase setup is unavailable.
      });

      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
        if (active && !seen) setOnboardingVisible(true);
      } catch {
        if (active) setOnboardingVisible(true);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  async function markOnboardingSeen() {
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    } catch {
      // Keep the experience usable if storage is unavailable.
    }
  }

  function handleOnboardingComplete() {
    markOnboardingSeen();
    setOnboardingVisible(false);
  }

  function handleOnboardingOpenPaywall() {
    markOnboardingSeen();
    setOnboardingVisible(false);
    setPaywallVisible(true);
  }

  // Also callable from Settings → Manage Membership
  function openPaywall() {
    setPaywallVisible(true);
  }

  async function handleContinueFree() {
    setPaywallVisible(false);
  }

  async function handlePurchase(planId: string) {
    try {
      // Package-based purchase so EVERY plan (incl. lifetime) buys the right product.
      const plan = plans.find((p) => p.id === planId);
      const result = await purchaseAuraLunisPackage(plan?.revenueCatPackageId ?? planId, plan?.productId);

      if (result.status === "purchased") {
        trackPaywallEvent("purchase_complete", { planId });
        await refreshEntitlement(); // flip the whole app to premium immediately
        setPaywallVisible(false);
        Alert.alert("Welcome to AuraLunis Premium", "Your membership is active.");
        return;
      }

      if (result.status === "cancelled") {
        trackPaywallEvent("purchase_cancelled", { planId });
        return;
      }

      if (result.status === "not_configured" || result.status === "not_available") {
        // No live RevenueCat key / offering yet (e.g. before launch) — never crash.
        Alert.alert("Subscriptions available after launch", "Premium plans will be purchasable once AuraLunis is live on the App Store.");
        return;
      }
    } catch {
      Alert.alert(
        "Purchase could not be completed",
        "Your purchase didn't go through. Please check your internet connection and try again. If you were charged, tap Restore Purchases to unlock Premium."
      );
    }
  }

  async function handleRestorePurchases() {
    try {
      const result = await restoreAuraLunisPurchases();

      if (result.status === "not_configured") {
        Alert.alert(
          "Subscriptions available after launch",
          "Purchases can be restored once AuraLunis is live on the App Store."
        );
        return;
      }

      await refreshEntitlement(); // reflect any restored entitlement app-wide
      Alert.alert(
        "Purchases restored",
        "AuraLunis refreshed the membership status for this App Store account."
      );
    } catch {
      Alert.alert(
        "Restore could not be completed",
        "We couldn't reach the App Store to restore your purchases. Please check your connection and try again."
      );
    }
  }

  // Sovereign tier removed — killed feature (Desk Obelisk, Stellar Portal, etc.)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
      <EntitlementProvider>
      <PaywallNavigationProvider>
        <AuraLunisSettingsProvider>
          <AuraLunisVaultProvider>
            <NavigationContainer>
              <RootTabs />
            </NavigationContainer>
            <PaywallBridge onOpen={() => setPaywallVisible(true)} />

            <ThreeTierPaywallModal
              visible={paywallVisible}
              onClose={() => setPaywallVisible(false)}
              onPurchase={handlePurchase}
              onRestore={handleRestorePurchases}
            />

          <OnboardingFlow
            visible={onboardingVisible}
            onComplete={handleOnboardingComplete}
            onOpenPaywall={handleOnboardingOpenPaywall}
          />
          </AuraLunisVaultProvider>
        </AuraLunisSettingsProvider>
      </PaywallNavigationProvider>
      </EntitlementProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
