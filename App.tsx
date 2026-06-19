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
import { ThreeTierPaywallModal } from "@/features/paywall/ThreeTierPaywallModal";
import { ChronauraSettingsProvider } from "@/state/ChronauraSettingsContext";
import { ChronauraVaultProvider } from "@/state/ChronauraVaultContext";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import {
  configureRevenueCat,
  purchaseChronauraTier,
  restoreChronauraPurchases
} from "@/services/RevenueCatService";
import type {
} from "@/features/paywall/MonetizationCatalog";
import { configureNotificationHandler } from "@/services/NotificationService";
import { trackPaywallEvent } from "@/services/AnalyticsService";
import { useChronauraFonts } from "@/theme/useFonts";
import { PaywallNavigationProvider, usePaywallNavigation } from "@/context/PaywallNavigationContext";
import { recordSession } from "@/services/ReviewPromptService";

const ONBOARDING_SEEN_KEY = "chronaura.onboarding.seen";

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
      const result = await purchaseChronauraTier(planId as never, planId.includes("annual") ? "annual" as never : "monthly" as never);

      if (result.status === "purchased") {
        trackPaywallEvent("purchase_complete", { planId, productId: result.productId });
        setPaywallVisible(false);
        Alert.alert("Welcome to Chronaura Premium", "Your membership is active.");
        return;
      }

      if (result.status === "cancelled") {
        trackPaywallEvent("purchase_cancelled", { planId });
        return;
      }

      if (result.status === "not_configured") {
        Alert.alert(
          "RevenueCat setup required",
          `The purchase handler is wired for ${result.productId}. Add the public RevenueCat SDK key and finish App Store Connect / RevenueCat sandbox setup before purchase testing.`
        );
        return;
      }

      Alert.alert(
        "Product not available yet",
        `The App Store package for ${result.productId ?? planId} is not available in the current RevenueCat offering.`
      );
    } catch {
      Alert.alert(
        "Purchase could not be completed",
        "Please try again after confirming the StoreKit sandbox and RevenueCat offering configuration."
      );
    }
  }

  async function handleRestorePurchases() {
    try {
      const result = await restoreChronauraPurchases();

      if (result.status === "not_configured") {
        Alert.alert(
          "RevenueCat setup required",
          "The restore handler is wired. Add the public RevenueCat SDK key before sandbox restore testing."
        );
        return;
      }

      Alert.alert(
        "Purchases restored",
        "Chronaura refreshed the membership status for this App Store account."
      );
    } catch {
      Alert.alert(
        "Restore could not be completed",
        "Please try again after confirming the StoreKit sandbox account."
      );
    }
  }

  function handleJoinSovereignWaitlist() {
    Alert.alert(
      "Sovereign Waitlist",
      "Sovereign is saved as an annual-only collector tier. Keep it waitlist-only until Desk Obelisk, Stellar Portal, Sovereign Sigil, and physical fulfillment are ready."
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaywallNavigationProvider>
        <ChronauraSettingsProvider>
          <ChronauraVaultProvider>
            <NavigationContainer>
              <RootTabs />
            </NavigationContainer>
            <PaywallBridge onOpen={() => setPaywallVisible(true)} />

            <ThreeTierPaywallModal
              visible={paywallVisible}
              onClose={() => setPaywallVisible(false)}
              onPurchase={handlePurchase}
            />

          <OnboardingFlow
            visible={onboardingVisible}
            onComplete={handleOnboardingComplete}
            onOpenPaywall={handleOnboardingOpenPaywall}
          />
          </ChronauraVaultProvider>
        </ChronauraSettingsProvider>
      </PaywallNavigationProvider>
    </GestureHandlerRootView>
  );
}
