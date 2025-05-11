import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

/**
 * `RewardsStoreScreen` - Placeholder for the rewards store.
 * @returns {JSX.Element}
 */
export default function RewardsStoreScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Rewards Store</Text>
      <Text>Redeem your coins for rewards here.</Text>
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
