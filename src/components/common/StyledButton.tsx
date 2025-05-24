import React from "react";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Button as PaperButton, useTheme } from "react-native-paper";
import type { AppTheme, AppColors } from "../../constants/theme";

/**
 * Button variant types based on the new UI design
 */
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

/**
 * Button size options
 */
export type ButtonSize = "default" | "sm" | "lg" | "icon";

/**
 * Props for the StyledButton component
 */
export interface StyledButtonProps
  extends Omit<
    React.ComponentProps<typeof PaperButton>,
    "children" | "theme" | "uppercase" | "mode" | "color"
  > {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

/**
 * A styled button component that follows the new UI design system
 * This component wraps React Native Paper's Button with custom styling
 */
export const StyledButton: React.FC<StyledButtonProps> = ({
  variant = "default",
  size = "default",
  children,
  style,
  labelStyle,
  contentStyle,
  ...props
}) => {
  const theme = useTheme<AppTheme>();
  const colors = theme.colors as AppColors;

  // Map our variant to React Native Paper's mode
  let paperMode:
    | "text"
    | "outlined"
    | "contained"
    | "elevated"
    | "contained-tonal" = "contained";
  let paperColor: string = colors.primary;
  let textColor: string = colors.onPrimary;

  // Set size-specific styles
  let SIZESPECIFIC_STYLE: ViewStyle = {};
  let SIZESPECIFIC_LABEL_STYLE: TextStyle = { ...theme.fonts.labelLarge }; // Default RN Paper button font
  let SIZESPECIFIC_CONTENT_STYLE: ViewStyle = {};

  // Configure based on variant
  switch (variant) {
    case "default":
      paperMode = "contained";
      paperColor = colors.purple700;
      textColor = "#ffffff";
      break;
    case "destructive":
      paperMode = "contained";
      paperColor = colors.customDestructive;
      textColor = colors.customDestructiveForeground;
      break;
    case "outline":
      paperMode = "outlined";
      paperColor = "transparent";
      textColor = colors.purple700;
      break;
    case "secondary":
      paperMode = "contained-tonal";
      paperColor = colors.purple100;
      textColor = colors.purple900;
      break;
    case "ghost":
      paperMode = "text";
      paperColor = "transparent";
      textColor = colors.purple700;
      break;
    case "link":
      paperMode = "text";
      paperColor = "transparent";
      textColor = colors.purple700;
      SIZESPECIFIC_LABEL_STYLE = {
        ...SIZESPECIFIC_LABEL_STYLE,
        textDecorationLine: "underline",
      };
      break;
  }

  // Configure based on size
  switch (size) {
    case "sm":
      SIZESPECIFIC_STYLE = {
        height: 36,
        paddingHorizontal: 12,
      };
      SIZESPECIFIC_LABEL_STYLE = {
        ...SIZESPECIFIC_LABEL_STYLE,
        fontSize: theme.fonts.labelMedium.fontSize,
      };
      break;
    case "lg":
      SIZESPECIFIC_STYLE = {
        height: 48,
        paddingHorizontal: 24,
      };
      SIZESPECIFIC_LABEL_STYLE = {
        ...SIZESPECIFIC_LABEL_STYLE,
        fontSize: theme.fonts.labelLarge.fontSize,
      };
      break;
    case "icon":
      SIZESPECIFIC_STYLE = {
        width: 40,
        height: 40,
        padding: 0,
        borderRadius: 20,
      };
      SIZESPECIFIC_CONTENT_STYLE = {
        marginHorizontal: 0,
      };
      break;
    default:
      // Default size
      SIZESPECIFIC_STYLE = {
        height: 40,
        paddingHorizontal: 16,
      };
  }

  // For "outline" variant, ensure border color is from our theme if needed
  const themedStyle: ViewStyle = {};
  if (variant === "outline") {
    themedStyle.borderColor = colors.outline; // Explicitly set border color
  }

  return (
    <PaperButton
      mode={paperMode}
      buttonColor={paperColor}
      textColor={textColor}
      style={[styles.base, themedStyle, SIZESPECIFIC_STYLE, style]}
      labelStyle={[styles.label, SIZESPECIFIC_LABEL_STYLE, labelStyle]}
      contentStyle={[styles.content, SIZESPECIFIC_CONTENT_STYLE, contentStyle]}
      uppercase={false}
      theme={theme} // Pass the theme for internal Paper component consistency if needed
      {...props}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8, // Match the new UI's border radius
    // React Native Paper Button roundness is controlled by theme.roundness
  },
  label: {
    // Common label styles, e.g., fontWeight if not covered by theme.fonts.labelLarge
    // fontWeight: "500", // Handled by theme.fonts.labelLarge.fontWeight
  },
  content: {
    // Common content styles
  },
});

export default StyledButton;
