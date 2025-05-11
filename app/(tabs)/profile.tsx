import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { useUserProfile } from "../../src/contexts/UserProfileContext";
import { updateUsername } from "../../src/api/userApi"; // Assuming this path

/**
 * `ProfileScreen` allows users to view and update their profile information.
 * For now, it focuses on updating the username.
 * @returns {JSX.Element} The profile screen component.
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, loadingProfile, refreshUserProfile } = useUserProfile();

  const [usernameInput, setUsernameInput] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (profile?.username) {
      setUsernameInput(profile.username);
    }
  }, [profile]);

  /**
   * Handles the process of updating the user's username.
   */
  const handleUpdateUsername = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return;
    }
    if (!usernameInput.trim()) {
      Alert.alert("Input Error", "Username cannot be empty.");
      return;
    }

    setIsUpdating(true);
    const { success, error } = await updateUsername(user, usernameInput.trim());
    setIsUpdating(false);

    if (success) {
      Alert.alert("Success", "Username updated successfully!");
      await refreshUserProfile(); // Refresh context to show updated username
    } else {
      Alert.alert(
        "Update Failed",
        error?.message || "Could not update username."
      );
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Your Profile
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Email:</Text>
          <Text variant="bodyLarge" style={styles.userInfoText}>
            {user?.email ?? "N/A"}
          </Text>

          <Text variant="titleMedium" style={styles.fieldTitle}>
            Username:
          </Text>
          <TextInput
            label="Username"
            value={usernameInput}
            onChangeText={setUsernameInput}
            style={styles.input}
            disabled={isUpdating}
            placeholder={profile?.username || "Enter a username"}
          />
          <Button
            mode="contained"
            onPress={handleUpdateUsername}
            loading={isUpdating}
            disabled={isUpdating || usernameInput === (profile?.username || "")}
            style={styles.button}
          >
            Update Username
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Stats" />
        <Card.Content>
          <Text variant="bodyLarge">
            Coins: {profile?.coin_balance ?? "N/A"}
          </Text>
          <Text variant="bodyLarge">
            Current Streak: {profile?.current_streak_length ?? "N/A"} days
          </Text>
        </Card.Content>
      </Card>

      <Button
        onPress={signOut}
        style={styles.button}
        mode="outlined"
        icon="logout"
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
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
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  userInfoText: {
    marginBottom: 15,
  },
  fieldTitle: {
    marginTop: 10,
    marginBottom: 5,
  },
  loadingText: {
    marginTop: 10,
  },
});
