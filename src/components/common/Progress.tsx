import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "../../constants/theme";

type ProgressProps = {
  value: number; // 0-100
  height?: number;
  style?: ViewStyle;
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  height = 8,
  style,
}) => {
  const theme = useTheme<AppTheme>();

  // Ensure value is between 0-100
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <View
      style={[
        styles.container,
        { height: height, backgroundColor: theme.colors.purple100 },
        style,
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${clampedValue}%`,
            backgroundColor: theme.colors.purple700,
            height: height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 9999, // Very large value to make it fully rounded
    overflow: "hidden",
  },
  progress: {
    borderRadius: 9999,
  },
});

export default Progress;
