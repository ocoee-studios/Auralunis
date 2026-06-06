import React from "react";
import { Platform, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ChronauraColors } from "@/theme/tokens";
import { HomeScreen } from "@/screens/HomeScreen";
import { SkyScreen } from "@/screens/SkyScreen";
import { WatchScreen } from "@/screens/WatchScreen";
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
  Watch: undefined;
  Learn: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const icons: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Sky: "moon-outline",
  Watch: "watch-outline",
  Learn: "book-outline",
  Settings: "settings-outline"
};

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof RootTabParamList } }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: "rgba(212,175,55,0.18)",
          height: 82,
          paddingBottom: 18,
          paddingTop: 8,
          position: "absolute"
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: ChronauraColors.gold2,
        tabBarInactiveTintColor: ChronauraColors.muted,
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Ionicons name={icons[route.name]} color={color} size={size} />
        )
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sky" component={SkyScreen} />
      <Tab.Screen name="Watch" component={WatchScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
