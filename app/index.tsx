import { Redirect } from "expo-router";
import React from "react";

/**
 * This is the initial entry point for the app directory.
 * It immediately redirects to let the root _layout.tsx handle authentication
 * and appropriate screen display.
 *
 * Alternatively, this could be a loading screen, but since _layout.tsx handles
 * auth state and redirects, a direct Redirect or even null render is often sufficient.
 * For robustness, we can redirect to a known starting point if needed,
 * but often just having this file helps the router.
 * For this setup, _layout.tsx will handle the redirection, so this component
 * effectively just ensures Expo Router has a concrete 'index' file.
 */
export default function Index() {
  // The root _layout (app/_layout.tsx) handles all initial routing logic
  // based on auth state. So, this component can simply return null
  // or redirect to a known valid path if absolutely necessary, though
  // the <Slot /> in _layout should pick up the correct route.
  // Let's try returning null and letting _layout.tsx do its job.
  // If issues persist, we could try <Redirect href="/(auth)/sign-in" /> or similar
  // but that might conflict with _layout.tsx's logic.
  return null;
  // Or, for a more explicit approach if null doesn't work:
  // return <Redirect href="/_loading_placeholder" />; // and create a dummy _loading_placeholder.tsx
}
