import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTheme } from "../../constants/theme";

/**
 * Icons mapping for each tab route
 */
const ICONS_MAP: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> =
  {
    dashboard: "view-dashboard",
    goals: "target",
    progress: "chart-line",
    "rewards-store": "storefront-outline",
    inventory: "briefcase-outline",
    profile: "account-circle",
  };

/**
 * A styled tab bar component that follows the new UI design
 * Shows only icons for a cleaner mobile experience
 */
const StyledTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.customBorder,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const iconName = ICONS_MAP[route.name] || "help-circle";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel as string}
            onPress={onPress}
            style={[
              styles.tabButton,
              isFocused && {
                backgroundColor: theme.colors.purple100,
                transform: [{ scale: 1.05 }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={
                  isFocused
                    ? theme.colors.purple700
                    : theme.colors.onSurfaceVariant
                }
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 60, // Slightly reduced height since we don't have text
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  iconContainer: {
    width: 32, // Slightly larger icon container
    height: 32, // Slightly larger icon container
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StyledTabBar;
