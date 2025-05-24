import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { Text, TextInput, ActivityIndicator } from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { useUserProfile } from "../../src/contexts/UserProfileContext";
import { updateUsername } from "../../src/api/userApi"; // Assuming this path
import {
  StyledCard,
  CardContent,
  CardTitle,
} from "../../src/components/common/StyledCard";
import { StyledButton } from "../../src/components/common/StyledButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "react-native-paper";
import type { AppTheme } from "../../src/constants/theme";

/**
 * `ProfileScreen` allows users to view and update their profile information.
 * For now, it focuses on updating the username.
 * @returns {JSX.Element} The profile screen component.
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, loadingProfile, refreshUserProfile } = useUserProfile();
  const theme = useTheme() as AppTheme;

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
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.purple700}
        />
        <Text style={[styles.loadingText, { color: theme.colors.purple700 }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LinearGradient
        colors={[theme.colors.purple50, theme.colors.customBackground]}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          Profile
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Your Profile
        </Text>
      </View>

      {/* Profile Info Card */}
      <StyledCard withShadow style={styles.card}>
        <CardTitle>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name="account"
              size={20}
              color={theme.colors.purple600}
            />
            <Text variant="titleMedium" style={styles.cardTitle}>
              Profile Information
            </Text>
          </View>
        </CardTitle>
        <CardContent style={styles.cardContent}>
          {/* Email */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons
                name="email"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.fieldLabel}>
                Email:
              </Text>
            </View>
            <View style={styles.emailContainer}>
              <Text variant="bodyLarge" style={styles.emailText}>
                {user?.email ?? "N/A"}
              </Text>
            </View>
          </View>

          {/* Username */}
          <View style={styles.fieldContainer}>
            <Text variant="bodyMedium" style={styles.fieldLabel}>
              Username:
            </Text>
            <TextInput
              value={usernameInput}
              onChangeText={setUsernameInput}
              style={styles.input}
              disabled={isUpdating}
              placeholder={profile?.username || "Enter a username"}
              mode="outlined"
              outlineColor={theme.colors.customBorder}
              activeOutlineColor={theme.colors.purple500}
              textColor={theme.colors.onSurface}
            />
          </View>

          <StyledButton
            variant="default"
            onPress={handleUpdateUsername}
            loading={isUpdating}
            disabled={isUpdating || usernameInput === (profile?.username || "")}
            style={styles.updateButton}
            icon="pencil"
          >
            Update Username
          </StyledButton>
        </CardContent>
      </StyledCard>

      {/* Stats Card */}
      <StyledCard withShadow style={styles.card}>
        <CardTitle>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Stats
          </Text>
        </CardTitle>
        <CardContent>
          <View style={styles.statsContainer}>
            {/* Coins */}
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.warning50,
                  borderColor: theme.colors.warning100,
                },
              ]}
            >
              <View style={styles.statContent}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={24}
                  color={theme.colors.warning600}
                />
                <View style={styles.statTextContainer}>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.statLabel,
                      { color: theme.colors.warning600 },
                    ]}
                  >
                    Coins
                  </Text>
                  <Text
                    variant="headlineSmall"
                    style={[
                      styles.statValue,
                      { color: theme.colors.warning600 },
                    ]}
                  >
                    {profile?.coin_balance ?? "0"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Streak */}
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.success50,
                  borderColor: theme.colors.success100,
                },
              ]}
            >
              <View style={styles.statContent}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={24}
                  color={theme.colors.success600}
                />
                <View style={styles.statTextContainer}>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.statLabel,
                      { color: theme.colors.success600 },
                    ]}
                  >
                    Current Streak
                  </Text>
                  <Text
                    variant="headlineSmall"
                    style={[
                      styles.statValue,
                      { color: theme.colors.success600 },
                    ]}
                  >
                    {profile?.current_streak_length ?? "0"} days
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </CardContent>
      </StyledCard>

      {/* Sign Out Button */}
      <StyledButton
        variant="outline"
        onPress={signOut}
        style={styles.signOutButton}
        icon="logout"
      >
        Sign Out
      </StyledButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "600",
    marginLeft: 8,
  },
  cardContent: {
    paddingVertical: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontWeight: "600",
    marginLeft: 6,
  },
  emailContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  emailText: {
    color: "#334155",
  },
  input: {
    backgroundColor: "#ffffff",
    fontSize: 16,
    height: 50,
  },
  updateButton: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontWeight: "500",
    marginBottom: 2,
  },
  statValue: {
    fontWeight: "bold",
  },
  signOutButton: {
    marginTop: 8,
    borderColor: "#fecaca",
    borderWidth: 1,
  },
  loadingText: {
    marginTop: 10,
  },
});
