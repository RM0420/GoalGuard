import React from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import {
  Card as PaperCard,
  Text,
  useTheme,
  MD3Elevation,
} from "react-native-paper";
import type { AppTheme } from "../../constants/theme";

// StyledCard (Main Container)
// Explicitly define known props for StyledCard and use Omit for the rest.
interface StyledCardOwnProps {
  style?: ViewStyle;
  children?: React.ReactNode;
  elevation?: MD3Elevation; // Use the specific type from Paper
}

// All other PaperCard props, excluding those we define in StyledCardOwnProps or want to omit entirely
// This is to avoid conflicts if PaperCard's prop names are the same as our own specific ones.
export type StyledCardProps = StyledCardOwnProps &
  Omit<React.ComponentProps<typeof PaperCard>, keyof StyledCardOwnProps>;

export const StyledCard: React.FC<StyledCardProps> = ({
  style,
  children,
  elevation = 1,
  ...rest
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <PaperCard
      style={[
        styles.cardBase,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness,
          borderColor: theme.colors.outline, // shadcn cards have a border by default
        },
        style,
      ]}
      elevation={elevation} // shadcn "shadow-sm" maps roughly to Paper's default elevation 1 or 2
      theme={theme} // Pass theme for consistency
      {...rest}
    >
      {children}
    </PaperCard>
  );
};

// CardHeader
export interface StyledCardHeaderProps extends ViewProps {}
export const StyledCardHeader: React.FC<StyledCardHeaderProps> = ({
  style,
  children,
  ...rest
}) => {
  return (
    <View style={[styles.header, style]} {...rest}>
      {children}
    </View>
  );
};

// CardTitle
export interface StyledCardTitleProps
  extends React.ComponentProps<typeof Text> {
  children: React.ReactNode;
}
export const StyledCardTitle: React.FC<StyledCardTitleProps> = ({
  style,
  children,
  ...rest
}) => {
  const theme = useTheme<AppTheme>();
  return (
    <Text
      variant="headlineSmall"
      style={[styles.title, { color: theme.colors.onSurface }, style]}
      {...rest}
    >
      {/* shadcn: text-2xl (24px) font-semibold. Paper headlineSmall is 24px. fontWeight can be adjusted if needed. */}
      {/* Default labelLarge is medium(500), headlineSmall is regular(400). Need to make it semibold. */}
      {children}
    </Text>
  );
};

// CardDescription
export interface StyledCardDescriptionProps
  extends React.ComponentProps<typeof Text> {
  children: React.ReactNode;
}
export const StyledCardDescription: React.FC<StyledCardDescriptionProps> = ({
  style,
  children,
  ...rest
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
      {...rest}
    >
      {/* shadcn: text-sm (14px) text-muted-foreground. Paper bodyMedium is 14px. */}
      {children}
    </Text>
  );
};

// CardContent
export interface StyledCardContentProps extends ViewProps {}
export const StyledCardContent: React.FC<StyledCardContentProps> = ({
  style,
  children,
  ...rest
}) => {
  return (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );
};

// CardFooter
export interface StyledCardFooterProps extends ViewProps {}
export const StyledCardFooter: React.FC<StyledCardFooterProps> = ({
  style,
  children,
  ...rest
}) => {
  return (
    <View style={[styles.footer, style]} {...rest}>
      {children}
    </View>
  );
};

const PADDING = 24; // p-6 from shadcn (1.5rem = 24px)

const styles = StyleSheet.create({
  cardBase: {
    borderWidth: 1, // Default border for the card
  },
  header: {
    padding: PADDING,
    // shadcn: flex flex-col space-y-1.5. The space-y is harder to replicate directly without knowing children.
    // Consumers can use a <View style={{gap: 6}}> or similar if needed for space-y-1.5 (6px).
  },
  title: {
    // Based on shadcn: text-2xl font-semibold leading-none tracking-tight
    // Paper's variant="headlineSmall" is 24px. Default fontWeight might need adjustment.
    fontWeight: "600", // font-semibold
    letterSpacing: -0.5, // Approximation for tracking-tight
    lineHeight: 28, // Approximation for leading-none (24px * 1.15 for example, adjust)
  },
  description: {
    // Based on shadcn: text-sm text-muted-foreground
    // Paper's variant="bodyMedium" is 14px.
    marginTop: 4, // Small margin if title is present, approximating space-y-1.5 effect
  },
  content: {
    padding: PADDING,
    paddingTop: 0,
  },
  footer: {
    padding: PADDING,
    paddingTop: 0,
    flexDirection: "row", // shadcn: flex items-center
    alignItems: "center",
  },
});
