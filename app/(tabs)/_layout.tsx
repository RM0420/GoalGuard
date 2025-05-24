import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import StyledTabBar from "../../src/components/common/StyledTabBar";
import type { AppTheme } from "../../src/constants/theme";

/**
 * `TabLayout` defines the main tab-based navigation for the authenticated part of the app.
 * It includes tabs for Dashboard, Goals, Progress, Rewards Store, Inventory, and Profile.
 * It uses a custom styled tab bar that matches the new UI design.
 * @returns {JSX.Element} The tab navigator.
 */
export default function TabLayout() {
  const { session } = useAuth();
  const theme = useTheme<AppTheme>();

  // While session is loading or if no session, Expo Router's root layout will handle redirection.
  // This check is more of a safeguard for the tabs themselves if accessed directly.
  // if (!session) {
  //   return <Redirect href="/(auth)/sign-in" />;
  // }

  return (
    <Tabs
      screenOptions={{
        // Apply theme colors to the header
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          ...theme.fonts.titleMedium,
          color: theme.colors.onSurface,
        },
        // Hide the default tab bar as we're using our custom one
        tabBarStyle: { display: "none" },
        // Hide all default headers
        headerShown: false,
      }}
      // Use our custom tab bar
      tabBar={(props) => <StyledTabBar {...props} />}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
        }}
      />
      <Tabs.Screen
        name="rewards-store"
        options={{
          title: "Store",
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
