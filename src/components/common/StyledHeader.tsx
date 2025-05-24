import React from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { AppTheme } from "../../constants/theme";

interface StyledHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
}

/**
 * A styled header component that follows the new UI design
 * This can be used across the app for consistent header styling
 */
const StyledHeader: React.FC<StyledHeaderProps> = ({
  title,
  showBackButton = false,
  rightContent,
}) => {
  const theme = useTheme<AppTheme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Appbar.Header
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          paddingTop: insets.top,
          height: 56 + insets.top,
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.customBorder,
        },
      ]}
    >
      {showBackButton && (
        <Appbar.BackAction
          onPress={() => router.back()}
          color={theme.colors.onSurface}
        />
      )}
      <Appbar.Content
        title={title}
        titleStyle={{
          color: theme.colors.onSurface,
          ...theme.fonts.titleMedium,
          fontWeight: "600",
          textAlign: "center",
        }}
      />
      {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: "center",
  },
  rightContent: {
    marginRight: 16,
  },
});

export default StyledHeader;
