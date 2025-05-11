import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

/**
 * `GoalsScreen` - Placeholder for goal setting and viewing.
 * @returns {JSX.Element}
 */
export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Goals Screen</Text>
      <Text>Set and view your daily goals here.</Text>
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
