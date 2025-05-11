import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

/**
 * `ProgressScreen` - Placeholder for detailed progress display.
 * @returns {JSX.Element}
 */
export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Progress Screen</Text>
      <Text>View your detailed progress and history here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
