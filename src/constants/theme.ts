import { MD3LightTheme as DefaultTheme } from "react-native-paper";
import type { MD3Theme as _MD3Theme } from "react-native-paper";

/**
 * Custom color definitions for our app that extend the default MD3 theme
 * These are based on the new UI design's color scheme
 */
interface CustomAppColors {
  // Custom colors not in the standard MD3 theme
  customPrimary: string;
  customPrimaryForeground: string;
  customSecondary: string;
  customSecondaryForeground: string;
  customMuted: string;
  customMutedForeground: string;
  customAccent: string;
  customAccentForeground: string;
  customBorder: string;
  customRing: string;
  customBackground: string;
  customForeground: string;
  customCard: string;
  customCardForeground: string;
  customDestructive: string;
  customDestructiveForeground: string;

  // Goal Guard custom colors from the new UI
  purple50: string;
  purple100: string;
  purple200: string;
  purple300: string;
  purple400: string;
  purple500: string;
  purple600: string;
  purple700: string;
  purple800: string;
  purple900: string;

  success50: string;
  success100: string;
  success500: string;
  success600: string;

  warning50: string;
  warning100: string;
  warning500: string;
  warning600: string;
}

// Our AppColors type combines React Native Paper's MD3 theme colors with our custom ones.
// We use _MD3Theme["colors"] to get the correct type for the standard MD3 colors,
// then extend it with our CustomAppColors interface.
export type AppColors = _MD3Theme["colors"] & CustomAppColors;

// Define our AppTheme type that uses the extended AppColors type
export interface AppTheme extends Omit<_MD3Theme, "colors"> {
  colors: AppColors;
}

// Define the custom theme
export const AppTheme: AppTheme = {
  ...DefaultTheme, // Spread all properties from DefaultTheme (including its original colors and fonts)

  // Override the colors property with our extended AppColors
  colors: {
    ...DefaultTheme.colors, // Spread the default MD3 colors

    // Add our custom colors based on the new UI design
    // Light theme values from the new UI
    customPrimary: "#18181b", // hsl(222.2 47.4% 11.2%)
    customPrimaryForeground: "#f8fafc", // hsl(210 40% 98%)
    customSecondary: "#f1f5f9", // hsl(210 40% 96.1%)
    customSecondaryForeground: "#18181b", // hsl(222.2 47.4% 11.2%)
    customMuted: "#f1f5f9", // hsl(210 40% 96.1%)
    customMutedForeground: "#64748b", // hsl(215.4 16.3% 46.9%)
    customAccent: "#f1f5f9", // hsl(210 40% 96.1%)
    customAccentForeground: "#18181b", // hsl(222.2 47.4% 11.2%)
    customBorder: "#e2e8f0", // hsl(214.3 31.8% 91.4%)
    customRing: "#18181b", // hsl(222.2 84% 4.9%)
    customBackground: "#ffffff", // hsl(0 0% 100%)
    customForeground: "#18181b", // hsl(222.2 84% 4.9%)
    customCard: "#ffffff", // hsl(0 0% 100%)
    customCardForeground: "#18181b", // hsl(222.2 84% 4.9%)
    customDestructive: "#ef4444", // hsl(0 84.2% 60.2%)
    customDestructiveForeground: "#f8fafc", // hsl(210 40% 98%)

    // Goal Guard custom colors
    purple50: "#faf5ff",
    purple100: "#f3e8ff",
    purple200: "#e9d5ff",
    purple300: "#d8b4fe",
    purple400: "#c084fc",
    purple500: "#a855f7",
    purple600: "#9333ea",
    purple700: "#7c3aed",
    purple800: "#6b21a8",
    purple900: "#581c87",

    success50: "#ecfdf5",
    success100: "#d1fae5",
    success500: "#10b981",
    success600: "#059669",

    warning50: "#fffbeb",
    warning100: "#fef3c7",
    warning500: "#f59e0b",
    warning600: "#d97706",

    // Override some of the default MD3 colors to match our new theme
    primary: "#7c3aed", // purple700 - main brand color
    onPrimary: "#ffffff",
    primaryContainer: "#9333ea", // purple600
    onPrimaryContainer: "#ffffff",
    secondary: "#a855f7", // purple500
    onSecondary: "#ffffff",
    secondaryContainer: "#f3e8ff", // purple100
    onSecondaryContainer: "#581c87", // purple900
    background: "#ffffff",
    onBackground: "#18181b",
    surface: "#ffffff",
    onSurface: "#18181b",
    surfaceVariant: "#f1f5f9",
    onSurfaceVariant: "#64748b",
    error: "#ef4444",
    onError: "#ffffff",

    // Keep the elevation colors from the default theme
    elevation: {
      ...DefaultTheme.colors.elevation,
    },
  },

  // Keep the default roundness or adjust as needed
  roundness: 8,

  // Keep the default animation values
  animation: {
    ...DefaultTheme.animation,
  },

  // fonts property will be inherited from DefaultTheme
};

// Export the default theme for convenience
export default AppTheme;
