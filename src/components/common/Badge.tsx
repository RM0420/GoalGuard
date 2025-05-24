import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "../../constants/theme";

type BadgeVariant = "default" | "outline" | "success" | "warning" | "danger";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  style,
  textStyle,
}) => {
  const theme = useTheme<AppTheme>();

  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    switch (variant) {
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: theme.colors.outlineVariant,
          },
          text: {
            color: theme.colors.onSurfaceVariant,
          },
        };
      case "success":
        return {
          container: {
            backgroundColor: theme.colors.success50,
            borderWidth: 1,
            borderColor: theme.colors.success100,
          },
          text: {
            color: theme.colors.success600,
          },
        };
      case "warning":
        return {
          container: {
            backgroundColor: theme.colors.warning50,
            borderWidth: 1,
            borderColor: theme.colors.warning100,
          },
          text: {
            color: theme.colors.warning600,
          },
        };
      case "danger":
        return {
          container: {
            backgroundColor: "#FEF2F2", // red-50
            borderWidth: 1,
            borderColor: "#FECACA", // red-200
          },
          text: {
            color: "#B91C1C", // red-700
          },
        };
      default:
        return {
          container: {
            backgroundColor: theme.colors.purple100,
          },
          text: {
            color: theme.colors.primary,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, variantStyles.container, style]}>
      {typeof children === "string" ? (
        <Text style={[styles.text, variantStyles.text, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default Badge;
