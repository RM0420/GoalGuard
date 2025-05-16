import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Or any icon pack you prefer
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "react-native-paper";

/**
 * `TabLayout` defines the main tab-based navigation for the authenticated part of the app.
 * It includes tabs for Dashboard, Goals, Progress, Rewards Store, and Profile.
 * It also handles redirection to auth screens if the user is not authenticated.
 * @returns {JSX.Element} The tab navigator.
 */
export default function TabLayout() {
  const { session } = useAuth();

  // While session is loading or if no session, Expo Router's root layout will handle redirection.
  // This check is more of a safeguard for the tabs themselves if accessed directly.
  // if (!session) {
  //   return <Redirect href="/(auth)/sign-in" />;
  // }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue", // Example color, customize as needed
        // headerShown: false, // Uncomment if you want to hide headers for all tab screens
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="target" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards-store"
        options={{
          title: "Store",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="storefront-outline"
              color={color}
              size={size}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="briefcase-outline"
              color={color}
              size={size}
            />
          ),
          headerShown: false, // The inventory screen has its own Appbar
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
