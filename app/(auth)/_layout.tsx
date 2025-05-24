import React from "react";
import { Stack } from "expo-router";
import { AppTheme } from "../../src/constants/theme";

/**
 * `AuthLayout` defines the navigation stack for authentication screens.
 * It uses Expo Router's Stack navigator.
 * @returns {JSX.Element} The stack navigator for auth routes.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: AppTheme.colors.background,
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
