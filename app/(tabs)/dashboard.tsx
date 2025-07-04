import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, Button, ActivityIndicator, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { useUserProfile } from "../../src/contexts/UserProfileContext";
import { useGoals } from "../../src/contexts/GoalsContext";
import { StyledCard } from "../../src/components/common/StyledCard";
import { StyledButton } from "../../src/components/common/StyledButton";
import StyledHeader from "../../src/components/common/StyledHeader";
import { Badge } from "../../src/components/common/Badge";
import { supabase } from "../../src/lib/supabaseClient";
import { AppTheme } from "../../src/constants/theme";
import useHealthKit from "../../src/hooks/useHealthKit";
import useScreenTime from "../../src/hooks/useScreenTime";

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const {
    userGoal,
    isLoadingGoal,
    todayProgress,
    isLoadingProgress,
    fetchUserGoal,
    fetchDailyProgress,
  } = useGoals();
  const theme = useTheme<AppTheme>();
  const router = useRouter();

  // HealthKit Integration
  const {
    steps,
    distance,
    isLoading: isLoadingHealthData,
    error: healthError,
    hasPermissions: hasHealthKitPermissions,
    requestPermissions: requestHealthKitPermissions,
    fetchDailyHealthData,
  } = useHealthKit();

  // Screen Time Integration
  const {
    isLoading: isLoadingScreenTime,
    error: screenTimeError,
    hasAuthorization: hasScreenTimeAuthorization,
    installedApps,
    blockedApps,
    requestAuthorization: requestScreenTimeAuthorization,
    loadInstalledApps,
    blockSocialMediaApps,
    unblockAllApps,
    categorizedApps,
  } = useScreenTime();

  const [hasStreakSaver, setHasStreakSaver] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user's streak saver status
  const fetchStreakSaverStatus = useCallback(async () => {
    if (!user) return;

    try {
      const { data: userRewards, error: rewardsError } = await supabase
        .from("user_owned_rewards")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("reward_type", "streak_saver")
        .single();

      if (rewardsError && rewardsError.code !== "PGRST116") {
        console.error("Error fetching streak saver status:", rewardsError);
      }

      setHasStreakSaver(!!(userRewards && userRewards.quantity > 0));
    } catch (error) {
      console.error("Error checking streak saver status:", error);
      setHasStreakSaver(false);
    }
  }, [user]);

  // Initialize permissions and data on component mount
  useEffect(() => {
    const initializeServices = async () => {
      if (!hasHealthKitPermissions) {
        const healthGranted = await requestHealthKitPermissions();
        if (healthGranted) {
          await fetchDailyHealthData();
        }
      } else {
        await fetchDailyHealthData();
      }

      if (!hasScreenTimeAuthorization) {
        // Don't auto-request Screen Time permissions - let user trigger it
        console.log("Screen Time permissions not granted yet");
      } else {
        await loadInstalledApps();
      }
    };

    initializeServices();
  }, []);

  // Refresh all data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await Promise.all([
        fetchUserGoal(),
        fetchDailyProgress(today),
        fetchStreakSaverStatus(),
        hasHealthKitPermissions ? fetchDailyHealthData() : Promise.resolve(),
        hasScreenTimeAuthorization ? loadInstalledApps() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchUserGoal,
    fetchDailyProgress,
    fetchStreakSaverStatus,
    hasHealthKitPermissions,
    fetchDailyHealthData,
    hasScreenTimeAuthorization,
    loadInstalledApps,
  ]);

  // Handle Screen Time authorization
  const handleScreenTimeAuthorization = useCallback(async () => {
    try {
      const granted = await requestScreenTimeAuthorization();
      if (granted) {
        await loadInstalledApps();
        Alert.alert(
          "Screen Time Authorized",
          "You can now manage app blocking to help reach your goals!"
        );
      } else {
        Alert.alert(
          "Authorization Required",
          "Screen Time access is needed to block distracting apps when you haven't reached your goals."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to request Screen Time authorization");
    }
  }, [requestScreenTimeAuthorization, loadInstalledApps]);

  // Handle app blocking based on goal progress
  const handleAppBlocking = useCallback(async () => {
    if (!hasScreenTimeAuthorization) {
      Alert.alert(
        "Authorization Required",
        "Please authorize Screen Time access first"
      );
      return;
    }

    if (!userGoal) {
      Alert.alert("No Goal Set", "Please set a daily goal first");
      return;
    }

    const currentSteps = steps || 0;
    const targetSteps = userGoal.target_value || 0;
    const goalAchieved = currentSteps >= targetSteps;

    if (goalAchieved) {
      // Goal achieved - unblock apps
      const success = await unblockAllApps();
      if (success) {
        Alert.alert(
          "🎉 Congratulations!",
          "You've reached your goal! All apps are now unblocked."
        );
      }
    } else {
      // Goal not achieved - block distracting apps
      const success = await blockSocialMediaApps();
      if (success) {
        const remaining = targetSteps - currentSteps;
        Alert.alert(
          "🔒 Apps Blocked",
          `You need ${remaining} more steps to unlock your apps. Keep going!`
        );
      }
    }
  }, [
    hasScreenTimeAuthorization,
    userGoal,
    steps,
    unblockAllApps,
    blockSocialMediaApps,
  ]);

  // Calculate progress percentage
  const progressPercentage = userGoal?.target_value
    ? Math.min(((steps || 0) / userGoal.target_value) * 100, 100)
    : 0;

  const goalAchieved = userGoal?.target_value
    ? (steps || 0) >= userGoal.target_value
    : false;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StyledHeader title="Dashboard" showBackButton={false} />

      {/* Welcome Section */}
      <StyledCard style={styles.welcomeCard}>
        <Text style={[styles.welcomeText, { color: theme.colors.onSurface }]}>
          Welcome back, {profile?.username || "Goal Guardian"}! 👋
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {goalAchieved
            ? "🎉 Congratulations! You've achieved your goal today!"
            : "Let's crush your goals today!"}
        </Text>
      </StyledCard>

      {/* Goal Progress Section */}
      <StyledCard style={styles.progressCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Today's Progress
        </Text>

        {isLoadingGoal || isLoadingProgress || isLoadingHealthData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme.colors.primary}
            />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        ) : userGoal ? (
          <View style={styles.goalContainer}>
            <Text style={[styles.goalText, { color: theme.colors.onSurface }]}>
              Daily Goal: {userGoal.target_value} {userGoal.target_unit}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: goalAchieved
                        ? theme.colors.primary
                        : theme.colors.secondary,
                      width: `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.progressText, { color: theme.colors.onSurface }]}
              >
                {progressPercentage.toFixed(1)}%
              </Text>
            </View>

            {/* Current Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.primary }]}
                >
                  {steps || 0}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Steps
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.primary }]}
                >
                  {distance?.toFixed(1) || 0}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Kilometers
                </Text>
              </View>
            </View>

            {/* Health Error Display */}
            {healthError && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                HealthKit: {healthError.message}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.noGoalContainer}>
            <Text
              style={[
                styles.noGoalText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              No active goal set. Set your first goal to get started!
            </Text>
            <StyledButton
              onPress={() => router.push("/(tabs)/goals")}
              style={styles.setGoalButton}
            >
              Set Daily Goal
            </StyledButton>
          </View>
        )}
      </StyledCard>

      {/* HealthKit Permission Section */}
      {!hasHealthKitPermissions && (
        <StyledCard style={styles.permissionCard}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            📱 HealthKit Access
          </Text>
          <Text
            style={[
              styles.permissionText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Grant access to track your steps and distance automatically
          </Text>
          <StyledButton
            onPress={requestHealthKitPermissions}
            style={styles.permissionButton}
          >
            Enable HealthKit
          </StyledButton>
        </StyledCard>
      )}

      {/* Screen Time Section */}
      <StyledCard style={styles.screenTimeCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          🔒 Screen Time Controls
        </Text>

        {!hasScreenTimeAuthorization ? (
          <View>
            <Text
              style={[
                styles.permissionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Block distracting apps when you haven't reached your goals
            </Text>
            <StyledButton
              onPress={handleScreenTimeAuthorization}
              style={styles.permissionButton}
              loading={isLoadingScreenTime}
            >
              Enable App Blocking
            </StyledButton>
          </View>
        ) : (
          <View>
            <Text
              style={[
                styles.screenTimeText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {blockedApps.length > 0
                ? `${blockedApps.length} apps currently blocked`
                : "No apps currently blocked"}
            </Text>

            {installedApps.length > 0 && (
              <View style={styles.appStatsContainer}>
                <Text
                  style={[
                    styles.appStatsText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Social: {categorizedApps.Social?.length || 0} apps •
                  Entertainment: {categorizedApps.Entertainment?.length || 0}{" "}
                  apps
                </Text>
              </View>
            )}

            <View style={styles.screenTimeButtons}>
              <StyledButton
                onPress={handleAppBlocking}
                style={[
                  styles.screenTimeButton,
                  {
                    backgroundColor: goalAchieved
                      ? theme.colors.primary
                      : theme.colors.error,
                  },
                ]}
                loading={isLoadingScreenTime}
              >
                {goalAchieved ? "🎉 Unlock Apps" : "🔒 Block Apps"}
              </StyledButton>
            </View>

            {screenTimeError && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Screen Time: {screenTimeError.message}
              </Text>
            )}
          </View>
        )}
      </StyledCard>

      {/* Streak Saver Status */}
      {hasStreakSaver && (
        <StyledCard style={styles.streakCard}>
          <View style={styles.streakContainer}>
            <Text
              style={[styles.streakText, { color: theme.colors.onSurface }]}
            >
              🛡️ Streak Saver Active
            </Text>
            <Badge variant="success">Protected</Badge>
          </View>
          <Text
            style={[
              styles.streakSubtext,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Your streak is protected for today
          </Text>
        </StyledCard>
      )}

      {/* Quick Actions */}
      <StyledCard style={styles.actionsCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Quick Actions
        </Text>
        <View style={styles.actionButtons}>
          <StyledButton
            onPress={() => router.push("/(tabs)/goals")}
            variant="outline"
            style={styles.actionButton}
          >
            View Goals
          </StyledButton>
          <StyledButton
            onPress={() => router.push("/(tabs)/progress")}
            variant="outline"
            style={styles.actionButton}
          >
            Progress History
          </StyledButton>
          <StyledButton
            onPress={() => router.push("/(tabs)/rewards-store")}
            variant="outline"
            style={styles.actionButton}
          >
            Rewards Store
          </StyledButton>
        </View>
      </StyledCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  progressCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  goalContainer: {
    alignItems: "center",
  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  progressBarContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 50,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  noGoalContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noGoalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  setGoalButton: {
    paddingHorizontal: 24,
  },
  permissionCard: {
    marginBottom: 16,
    padding: 20,
  },
  permissionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionButton: {
    alignSelf: "flex-start",
  },
  screenTimeCard: {
    marginBottom: 16,
    padding: 20,
  },
  screenTimeText: {
    fontSize: 14,
    marginBottom: 12,
  },
  appStatsContainer: {
    marginBottom: 16,
  },
  appStatsText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  screenTimeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  screenTimeButton: {
    flex: 1,
  },
  streakCard: {
    marginBottom: 16,
    padding: 20,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: "600",
  },
  streakSubtext: {
    fontSize: 14,
  },
  actionsCard: {
    marginBottom: 32,
    padding: 20,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
});
