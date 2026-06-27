import React from "react";
import { Platform, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuraLunisColors } from "@/theme/tokens";
import { HomeScreen } from "@/screens/HomeScreen";
import { SkyScreen } from "@/screens/SkyScreen";
import { LearnScreen } from "@/screens/LearnScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";

// Blur component for tab bar background (Liquid Glass)
let BlurTab: React.ComponentType<{ style?: object; children?: React.ReactNode }> | null = null;
try {
  const ExpoBlur = require("expo-blur") as { BlurView: typeof BlurTab };
  if (Platform.OS === "ios") BlurTab = ExpoBlur.BlurView;
} catch { /* fallback */ }

function TabBarBackground() {
  if (BlurTab) {
    return <BlurTab style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />;
  }
  return <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(7,10,19,0.96)" }} />;
}

export type RootTabParamList = {
  Home: undefined;
  Sky: undefined;
  Learn: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Exported so screens that go full-screen immersive (e.g. Sky Lens) can hide the
// tab bar and then restore this exact style on exit.
export const TAB_BAR_STYLE = {
  backgroundColor: "transparent",
  borderTopColor: "rgba(217,168,78,0.18)",
  height: 82,
  paddingBottom: 18,
  paddingTop: 8,
  position: "absolute" as const
};

const icons: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Sky: "moon-outline",
  Learn: "book-outline",
  Settings: "settings-outline"
};

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof RootTabParamList } }) => ({
        headerShown: false,
        tabBarAccessibilityLabel: `${route.name} tab`,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: AuraLunisColors.gold2,
        tabBarInactiveTintColor: AuraLunisColors.muted,
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Ionicons name={icons[route.name]} color={color} size={size} />
        )
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sky" component={SkyScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
