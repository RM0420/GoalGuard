import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, Text, TextStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "../../constants/theme";

type CardProps = {
  children: ReactNode;
  withShadow?: boolean;
  style?: ViewStyle;
  variant?: "default" | "gradient-purple" | "outline";
};

export const StyledCard: React.FC<CardProps> = ({
  children,
  withShadow = false,
  style,
  variant = "default",
}) => {
  const theme = useTheme<AppTheme>();

  const getCardStyle = () => {
    if (variant === "gradient-purple") {
      return {
        backgroundColor: theme.colors.purple700,
      };
    } else if (variant === "outline") {
      return {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      };
    } else {
      return {
        backgroundColor: theme.colors.surface,
      };
    }
  };

  return (
    <View
      style={[styles.card, getCardStyle(), withShadow && styles.shadow, style]}
    >
      {children}
    </View>
  );
};

export const CardHeader: React.FC<{
  children: ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

export const CardTitle: React.FC<{
  children: ReactNode;
  style?: TextStyle;
}> = ({ children, style }) => {
  const theme = useTheme<AppTheme>();
  return (
    <View style={styles.titleContainer}>
      {typeof children === "string" ? (
        <View style={styles.textTitleContainer}>
          <View style={styles.titleBar} />
          <Text style={[styles.titleText, style]}>{children}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
};

export const CardContent: React.FC<{
  children: ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 0,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  textTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleBar: {
    width: 4,
    height: 20,
    backgroundColor: "#7C3AED", // Purple color
    borderRadius: 2,
    marginRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937", // slate-800
  },
  content: {
    padding: 16,
  },
});
