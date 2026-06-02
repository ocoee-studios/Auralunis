import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ChronauraColors } from "@/theme/tokens";
import { HomeScreen } from "@/screens/HomeScreen";
import { SkyScreen } from "@/screens/SkyScreen";
import { WatchScreen } from "@/screens/WatchScreen";
import { LearnScreen } from "@/screens/LearnScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";

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
          backgroundColor: "rgba(7,10,19,0.96)",
          borderTopColor: "rgba(212,175,55,0.18)",
          height: 82,
          paddingBottom: 18,
          paddingTop: 8
        },
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
