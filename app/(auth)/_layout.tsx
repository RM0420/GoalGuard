import React from "react";
import { Stack } from "expo-router";

/**
 * `AuthLayout` defines the navigation stack for authentication screens.
 * It uses Expo Router's Stack navigator.
 * @returns {JSX.Element} The stack navigator for auth routes.
 */
export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
}
