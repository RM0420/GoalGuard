import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, ActivityIndicator, Button } from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { useUserProfile } from "../../src/contexts/UserProfileContext";

/**
 * `DashboardScreen` is the main screen users see after logging in.
 * It displays a summary of their goal progress, streaks, and coin balance.
 * @returns {JSX.Element} The dashboard screen component.
 */
export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { profile, loadingProfile, refreshUserProfile } = useUserProfile();

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome, {profile?.username || user?.email || "User"}!
      </Text>

      <Card style={styles.card}>
        <Card.Title title="Stats Summary" />
        <Card.Content>
          <Text variant="bodyLarge">
            Coins: {profile?.coin_balance ?? "N/A"}
          </Text>
          <Text variant="bodyLarge">
            Current Streak: {profile?.current_streak_length ?? "N/A"} days
          </Text>
          {/* Add more stats here as they are developed (e.g., current goal progress) */}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Today's Goal" />
        <Card.Content>
          <Text>Goal details will go here...</Text>
          {/* Display current day's goal and progress towards it */}
        </Card.Content>
      </Card>

      <Button
        onPress={refreshUserProfile}
        style={styles.button}
        mode="outlined"
      >
        Refresh Profile
      </Button>

      <Button onPress={signOut} style={styles.button} mode="contained">
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5", // A light background color
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    marginBottom: 20,
  },
  button: {
    marginTop: 15,
  },
  loadingText: {
    marginTop: 10,
  },
});
