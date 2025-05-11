import React, { useEffect } from "react";
import { View } from "react-native"; // Import View for a potential loading screen
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { UserProfileProvider } from "../src/contexts/UserProfileContext";
import { GoalsProvider } from "../src/contexts/GoalsContext";
import { PaperProvider, ActivityIndicator, Text } from "react-native-paper";
// Import a theme if you have one or use the default
// import { AppTheme } from "../src/constants/theme";

/**
 * `RootLayoutNav` is a component that handles the navigation logic based on auth state.
 * It determines whether to show authentication screens or the main app content.
 * @returns {JSX.Element | null} The main app slot or null if redirecting.
 */
const RootLayoutNav = () => {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments(); // segments is string[] e.g. ["(auth)", "sign-in"]

  console.log(
    `[RootLayoutNav] Initial: loading=${loading}, session=${!!session}, segments=${JSON.stringify(
      segments
    )}`
  );

  useEffect(() => {
    // Don't run any navigation logic if we are still loading the session
    if (loading) {
      console.log("[RootLayoutNav Effect] Still loading session state.");
      return;
    }

    console.log(
      `[RootLayoutNav Effect] Processing: session=${!!session}, segments=${JSON.stringify(
        segments
      )}`
    );

    const isAtAuthRoute = segments[0] === "(auth)";
    const isAtAppRoute = segments[0] === "(tabs)";

    if (session) {
      // User is logged in
      if (isAtAuthRoute) {
        // Logged in but still on an auth screen (e.g. sign-in, sign-up)
        console.log(
          "[RootLayoutNav Effect] User logged in, but on auth screen. Redirecting to dashboard."
        );
        router.replace("/(tabs)/dashboard");
      } else if (!isAtAppRoute) {
        // Logged in but not on a main app tab screen (could be at root "/" or an unknown path)
        // This also covers the initial load case where segments might be [] or ["index"]
        console.log(
          "[RootLayoutNav Effect] User logged in, not on an app tab screen. Redirecting to dashboard."
        );
        router.replace("/(tabs)/dashboard");
      }
      // If (session && isAtAppRoute), user is logged in and on a tab screen, do nothing.
    } else {
      // No session - User is logged out
      if (!isAtAuthRoute) {
        // Logged out but not on an auth screen (e.g. on a tab screen or at root)
        console.log(
          "[RootLayoutNav Effect] User logged out, not on auth screen. Redirecting to sign-in."
        );
        router.replace("/(auth)/sign-in");
      }
      // If (!session && isAtAuthRoute), user is logged out and on an auth screen, do nothing.
    }
  }, [session, loading, segments, router]);

  if (loading) {
    console.log(
      "[RootLayoutNav Render] Loading... returning loading indicator."
    );
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator animating={true} size="large" />
        <Text style={{ marginTop: 10 }}>Loading App...</Text>
      </View>
    );
  }

  console.log(
    `[RootLayoutNav Render] Loading false. Rendering <Slot /> for segments: ${JSON.stringify(
      segments
    )}`
  );
  return <Slot />;
};

/**
 * `RootLayout` is the main layout component for the application.
 * It wraps the entire app with `AuthProvider`, `UserProfileProvider`, `GoalsProvider`, and `PaperProvider`.
 * @returns {JSX.Element} The root layout component.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <GoalsProvider>
          <PaperProvider>
            <RootLayoutNav />
          </PaperProvider>
        </GoalsProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
}
