import React from "react";
import { StyleSheet, View, ViewStyle, TextStyle } from "react-native";
import { Card, useTheme, Text } from "react-native-paper";
import type { AppTheme } from "../../constants/theme";

/**
 * Props for the StyledCard component
 */
interface StyledCardProps {
  /** Children to render inside the card */
  children: React.ReactNode;
  /** Optional custom style for the card */
  style?: ViewStyle;
  /** Whether to add a subtle shadow to the card */
  withShadow?: boolean;
  /** Whether to add a border to the card */
  withBorder?: boolean;
}

/**
 * A styled card component that follows the new UI design system
 * This component wraps React Native Paper's Card with custom styling
 */
const StyledCard: React.FC<StyledCardProps> = ({
  children,
  style,
  withShadow = true,
  withBorder = true,
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness,
          borderColor: theme.colors.outline,
          borderWidth: withBorder ? 1 : 0,
        },
        withShadow && styles.cardShadow,
        style,
      ]}
    >
      {children}
    </Card>
  );
};

/**
 * Props for the CardTitle component
 */
interface CardTitleProps {
  /** Title text content */
  children: React.ReactNode;
  /** Optional custom style for the title */
  style?: TextStyle;
}

/**
 * A styled card title component that matches the new UI design
 */
const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => {
  const theme = useTheme<AppTheme>();

  return (
    <Card.Title
      title={
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onSurface }, style]}
        >
          {children}
        </Text>
      }
      titleStyle={styles.titleContainer}
    />
  );
};

/**
 * Props for the CardContent component
 */
interface CardContentProps {
  /** Content to display inside the card */
  children: React.ReactNode;
  /** Optional custom style for the content container */
  style?: ViewStyle;
}

/**
 * A styled card content component that matches the new UI design
 */
const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return (
    <Card.Content style={[styles.content, style]}>{children}</Card.Content>
  );
};

/**
 * Props for the CardDescription component
 */
interface CardDescriptionProps {
  /** Description text content */
  children: React.ReactNode;
  /** Optional custom style for the description */
  style?: TextStyle;
}

/**
 * A styled card description component that matches the new UI design
 */
const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  style,
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <Text
      variant="bodyMedium"
      style={[
        styles.description,
        { color: theme.colors.customMutedForeground },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

/**
 * Props for the CardFooter component
 */
interface CardFooterProps {
  /** Footer content */
  children: React.ReactNode;
  /** Optional custom style for the footer */
  style?: ViewStyle;
}

/**
 * A styled card footer component that matches the new UI design
 */
const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={[
        styles.footer,
        { borderTopColor: theme.colors.customBorder },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    overflow: "hidden",
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleContainer: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  title: {
    fontWeight: "600",
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  description: {
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});

export { StyledCard, CardTitle, CardContent, CardDescription, CardFooter };
export default StyledCard;
