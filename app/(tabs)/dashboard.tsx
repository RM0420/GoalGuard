import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  Text,
  ActivityIndicator,
  Button,
  Snackbar,
  Badge,
  useTheme,
  Divider,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { useUserProfile } from "../../src/contexts/UserProfileContext";
import { getActiveGoal } from "../../src/api/goalsApi";
import { getTodaysDailyProgress } from "../../src/api/progressApi";
import useHealthKit from "../../src/hooks/useHealthKit";
import { Database } from "../../src/types/database.types";
import {
  upsertDailyProgress,
  UpsertDailyProgressData,
} from "../../src/api/progressApi";
import { UserOwnedReward } from "../../src/api/inventoryApi";
import StyledHeader from "../../src/components/common/StyledHeader";
import {
  StyledCard,
  CardContent,
  CardTitle,
} from "../../src/components/common/StyledCard";
import StyledButton from "../../src/components/common/StyledButton";
import { AppTheme } from "../../src/constants/theme";
import { useRouter } from "expo-router";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type DailyProgress = Database["public"]["Tables"]["daily_progress"]["Row"];
type DailyProgressStatus =
  Database["public"]["Tables"]["daily_progress"]["Row"]["status"];

/**
 * `DashboardScreen` is the main screen users see after logging in.
 * It displays a summary of their active goal, daily progress, streaks, and coin balance.
 * @returns {JSX.Element} The dashboard screen component.
 */
export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { profile, loadingProfile, refreshUserProfile } = useUserProfile();
  const theme = useTheme<AppTheme>();
  const router = useRouter();

  const [activeGoal, setActiveGoal] = useState<Goal | null | undefined>(
    undefined
  );
  const [isLoadingActiveGoal, setIsLoadingActiveGoal] = useState<boolean>(true);
  const [todaysProgress, setTodaysProgress] = useState<
    DailyProgress | null | undefined
  >(undefined);
  const [isLoadingTodaysProgress, setIsLoadingTodaysProgress] =
    useState<boolean>(true);

  const {
    steps,
    distance,
    isLoading: isLoadingHealthData,
    error: healthError,
    hasPermissions,
    requestPermissions,
    fetchDailyHealthData,
  } = useHealthKit();

  const [dailyProgressText, setDailyProgressText] = useState<string>("");
  const [isTodayGoalMet, setIsTodayGoalMet] = useState<boolean>(false);
  const [currentDailyStatus, setCurrentDailyStatus] =
    useState<DailyProgressStatus>("pending");
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const lastSavedSteps = useRef<number | undefined>(undefined);
  const lastSavedDistance = useRef<number | undefined>(undefined);
  const lastSavedStatus = useRef<DailyProgressStatus | undefined>(undefined);

  const getTodayDateString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const hasStreakSaver = profile?.ownedRewards?.some(
    (reward: UserOwnedReward) =>
      reward.reward_type === "streak_saver" && reward.quantity > 0
  );

  const saveDailyProgressToSupabase = useCallback(async () => {
    if (
      !user ||
      !activeGoal ||
      steps === undefined ||
      distance === undefined ||
      isLoadingActiveGoal ||
      isLoadingTodaysProgress
    ) {
      return;
    }

    // Skip saving if nothing has changed
    if (
      steps === lastSavedSteps.current &&
      distance === lastSavedDistance.current &&
      currentDailyStatus === lastSavedStatus.current
    ) {
      return;
    }

    // Prepare progress data
    const progressData: UpsertDailyProgressData = {
      user_id: user.id,
      goal_id: activeGoal.id,
      date: getTodayDateString(),
      progress_data: {
        steps_count: steps,
        distance_ran_km: distance,
      },
      status: currentDailyStatus,
    };

    try {
      const result = await upsertDailyProgress(progressData);
      if (result) {
        console.log("Progress saved:", result);
        // Update refs to track what we've saved
        lastSavedSteps.current = steps;
        lastSavedDistance.current = distance;
        lastSavedStatus.current = currentDailyStatus;
      } else {
        console.error("Error saving progress");
      }
    } catch (err) {
      console.error("Exception saving progress:", err);
    }
  }, [
    user,
    activeGoal,
    steps,
    distance,
    currentDailyStatus,
    isLoadingActiveGoal,
    isLoadingTodaysProgress,
  ]);

  useEffect(() => {
    if (user) {
      setIsLoadingActiveGoal(true);
      getActiveGoal(user)
        .then(({ data, error }) => {
          if (error) {
            setSnackbarMessage("Error fetching your active goal.");
            setSnackbarVisible(true);
            console.error("Error fetching active goal:", error);
            setActiveGoal(null);
          } else {
            setActiveGoal(data);
          }
        })
        .finally(() => {
          setIsLoadingActiveGoal(false);
        });
    } else {
      setActiveGoal(null);
      setIsLoadingActiveGoal(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setIsLoadingTodaysProgress(true);
      getTodaysDailyProgress(user.id)
        .then(({ data, error }) => {
          if (error) {
            console.warn(
              "Could not fetch today's progress (may not exist yet):",
              error
            );
            setTodaysProgress(null);
          } else {
            setTodaysProgress(data);
            if (data?.status) {
              setCurrentDailyStatus(data.status);
            }
          }
        })
        .finally(() => {
          setIsLoadingTodaysProgress(false);
        });
    } else {
      setTodaysProgress(null);
      setIsLoadingTodaysProgress(false);
    }
  }, [user, refreshUserProfile]);

  useEffect(() => {
    if (!hasPermissions) {
      requestPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasPermissions) {
      fetchDailyHealthData();
    }
  }, [hasPermissions, fetchDailyHealthData]);

  useEffect(() => {
    if (healthError) {
      setSnackbarMessage(`Health Data Error: ${healthError.message}`);
      setSnackbarVisible(true);
    }
  }, [healthError]);

  useEffect(() => {
    if (isLoadingActiveGoal || isLoadingTodaysProgress || isLoadingHealthData) {
      setDailyProgressText("Loading goal and health data...");
      setIsTodayGoalMet(false);
      return;
    }

    if (!activeGoal) {
      setDailyProgressText(
        "No active goal set. Please set one in the Goals tab."
      );
      setIsTodayGoalMet(false);
      setCurrentDailyStatus("pending");
      return;
    }

    const currentTargetValue =
      todaysProgress?.effective_target_value !== null &&
      todaysProgress?.effective_target_value !== undefined
        ? todaysProgress.effective_target_value
        : activeGoal.target_value;

    const currentTargetUnit =
      todaysProgress?.effective_target_unit !== null &&
      todaysProgress?.effective_target_unit !== undefined
        ? todaysProgress.effective_target_unit
        : activeGoal.target_unit;

    let progressText = "";
    let currentTargetMet = false;
    let percentage = 0;
    let determinedStatus: DailyProgressStatus =
      todaysProgress?.status || "pending";

    if (todaysProgress?.status === "skipped") {
      progressText = "Goal for today has been skipped!";
      currentTargetMet = true;
      determinedStatus = "skipped";
    } else if (
      activeGoal.goal_type === "steps" &&
      steps !== undefined &&
      currentTargetValue !== null &&
      currentTargetValue > 0
    ) {
      currentTargetMet = steps >= currentTargetValue;
      percentage = Math.min(
        100,
        Math.floor((steps / currentTargetValue) * 100)
      );
      progressText = `${steps} / ${currentTargetValue} steps`;
      determinedStatus = currentTargetMet ? "completed" : "pending";
    } else if (
      activeGoal.goal_type === "run_distance" &&
      distance !== undefined &&
      currentTargetValue !== null &&
      currentTargetUnit &&
      currentTargetValue > 0
    ) {
      if (currentTargetUnit === "km") {
        currentTargetMet = distance >= currentTargetValue;
        percentage = Math.min(
          100,
          Math.floor((distance / currentTargetValue) * 100)
        );
        progressText = `${distance.toFixed(
          2
        )} / ${currentTargetValue} ${currentTargetUnit}`;
        determinedStatus = currentTargetMet ? "completed" : "pending";
      } else if (currentTargetUnit === "miles") {
        const distanceInMiles = distance * 0.621371;
        currentTargetMet = distanceInMiles >= currentTargetValue;
        percentage = Math.min(
          100,
          Math.floor((distanceInMiles / currentTargetValue) * 100)
        );
        progressText = `${distanceInMiles.toFixed(
          2
        )} / ${currentTargetValue} ${currentTargetUnit}`;
        determinedStatus = currentTargetMet ? "completed" : "pending";
      } else {
        progressText = `(Target unit ${currentTargetUnit} not fully supported for direct comparison)`;
        determinedStatus = "pending";
      }
    } else {
      progressText =
        "Goal type or target not properly set, or health data unavailable.";
      determinedStatus = "pending";
    }

    setDailyProgressText(progressText);
    setIsTodayGoalMet(currentTargetMet);
    setProgressPercentage(percentage);
    if (todaysProgress?.status !== "skipped") {
      setCurrentDailyStatus(determinedStatus);
    }
  }, [
    activeGoal,
    steps,
    distance,
    isLoadingHealthData,
    todaysProgress,
    isLoadingActiveGoal,
    isLoadingTodaysProgress,
  ]);

  useEffect(() => {
    if (
      steps !== undefined &&
      distance !== undefined &&
      currentDailyStatus !== "skipped"
    ) {
      const timerId = setTimeout(saveDailyProgressToSupabase, 3000);
      return () => clearTimeout(timerId);
    }
  }, [
    steps,
    distance,
    currentDailyStatus,
    saveDailyProgressToSupabase,
    isLoadingActiveGoal,
    isLoadingTodaysProgress,
  ]);

  const handleRefreshData = () => {
    if (hasPermissions) {
      fetchDailyHealthData();
      refreshUserProfile();
      setSnackbarMessage("Refreshing health data...");
      setSnackbarVisible(true);
    } else {
      requestPermissions();
      setSnackbarMessage("Please grant health permissions to continue.");
      setSnackbarVisible(true);
    }
  };

  // Get status badge color and text
  const getStatusBadge = () => {
    switch (currentDailyStatus) {
      case "completed":
        return {
          color: theme.colors.success500,
          backgroundColor: theme.colors.success50,
          text: "Completed",
          icon: "check-circle" as keyof typeof MaterialCommunityIcons.glyphMap,
        };
      case "skipped":
        return {
          color: theme.colors.warning500,
          backgroundColor: theme.colors.warning50,
          text: "Skipped",
          icon: "skip-next-circle" as keyof typeof MaterialCommunityIcons.glyphMap,
        };
      case "failed":
        return {
          color: theme.colors.customDestructive,
          backgroundColor: "#FEF2F2", // Light red
          text: "Failed",
          icon: "close-circle" as keyof typeof MaterialCommunityIcons.glyphMap,
        };
      case "failed_streak_saved":
        return {
          color: theme.colors.warning500,
          backgroundColor: theme.colors.warning50,
          text: "Failed (Streak Saved)",
          icon: "shield-check" as keyof typeof MaterialCommunityIcons.glyphMap,
        };
      default:
        return {
          color: theme.colors.warning500,
          backgroundColor: theme.colors.warning50,
          text: "Pending",
          icon: "help-circle" as keyof typeof MaterialCommunityIcons.glyphMap,
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <View style={styles.container}>
      <StyledHeader title="Dashboard" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCardContainer}>
          <StyledCard style={styles.profileCard}>
            <CardContent>
              <View
                style={[
                  styles.profileContent,
                  { backgroundColor: theme.colors.purple700 },
                ]}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileIconContainer}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color="white"
                    />
                  </View>
                  <Text style={styles.welcomeText}>
                    Welcome,{" "}
                    {user?.user_metadata?.name || user?.email || "User"}
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View style={styles.statIconLabel}>
                      <MaterialCommunityIcons
                        name="cash"
                        size={20}
                        color="#FFD700"
                      />
                      <Text style={styles.statLabel}>Coins</Text>
                    </View>
                    <Text style={styles.statValue}>
                      {profile?.coin_balance || 0}
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <View style={styles.statIconLabel}>
                      <MaterialCommunityIcons
                        name="lightning-bolt"
                        size={20}
                        color="#FFA500"
                      />
                      <Text style={styles.statLabel}>Streak</Text>
                    </View>
                    <Text style={styles.statValue}>
                      {profile?.current_streak_length || 0} days
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </StyledCard>
        </View>

        {/* Today's Goal Card */}
        <StyledCard style={styles.goalCard}>
          <CardContent>
            <View style={styles.goalCardHeader}>
              <View style={styles.goalTitleContainer}>
                <MaterialCommunityIcons
                  name="target"
                  size={20}
                  color={theme.colors.purple700}
                />
                <Text style={styles.goalTitle}>Today's Goal</Text>
              </View>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefreshData}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={16}
                  color={theme.colors.purple700}
                />
                <Text style={styles.refreshText}>Refresh Data</Text>
              </TouchableOpacity>
            </View>

            {isLoadingActiveGoal ||
            isLoadingTodaysProgress ||
            isLoadingHealthData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.purple700}
                />
                <Text style={styles.loadingText}>Loading goal data...</Text>
              </View>
            ) : !activeGoal ? (
              <View style={styles.noGoalContainer}>
                <Text style={styles.noGoalText}>No active goal set.</Text>
                <StyledButton
                  variant="default"
                  onPress={() => router.push("/(tabs)/goals")}
                  style={styles.setGoalButton}
                >
                  Set a Goal
                </StyledButton>
              </View>
            ) : (
              <View style={styles.goalContent}>
                <Text style={styles.goalDescription}>
                  {activeGoal.goal_type === "steps"
                    ? `Walk/Run ${activeGoal.target_value} steps`
                    : activeGoal.goal_type === "run_distance"
                    ? `Run ${activeGoal.target_value} ${activeGoal.target_unit}`
                    : "Goal details unavailable"}
                </Text>

                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressNumber}>
                    {activeGoal.goal_type === "steps" && steps !== undefined
                      ? steps.toLocaleString()
                      : activeGoal.goal_type === "run_distance" &&
                        distance !== undefined
                      ? distance.toFixed(2)
                      : "0"}
                  </Text>
                  <Text style={styles.progressTarget}>
                    / {activeGoal.target_value.toLocaleString()}{" "}
                    {activeGoal.target_unit}
                  </Text>
                </View>

                <View style={styles.progressBarContainer}>
                  <View
                    style={{
                      width: `${progressPercentage}%`,
                      height: "100%",
                      borderRadius: 6,
                      backgroundColor: theme.colors.purple700,
                    }}
                  />
                </View>

                <View style={styles.progressFooter}>
                  <Text style={styles.progressPercentage}>
                    {progressPercentage}% complete
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "transparent",
                      backgroundColor: statusBadge.backgroundColor,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={statusBadge.icon}
                      size={12}
                      color={statusBadge.color}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        marginLeft: 4,
                        fontWeight: "500",
                        color: statusBadge.color,
                      }}
                    >
                      Status: {statusBadge.text}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </CardContent>
        </StyledCard>

        {/* Active Rewards Card */}
        {hasStreakSaver && (
          <StyledCard style={styles.rewardsCard}>
            <CardContent>
              <View style={styles.rewardsHeader}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={20}
                  color={theme.colors.success500}
                />
                <Text style={styles.rewardsTitle}>Active Rewards</Text>
              </View>

              <View style={styles.rewardBadgeContainer}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: theme.colors.success50,
                  }}
                >
                  <View style={styles.rewardIndicator} />
                  <Text style={styles.rewardText}>Streak Saver is ACTIVE</Text>
                </View>
              </View>
            </CardContent>
          </StyledCard>
        )}

        {/* Sign Out Button */}
        <StyledCard style={styles.signOutCard}>
          <CardContent>
            <StyledButton
              variant="destructive"
              onPress={() => signOut()}
              style={styles.signOutButton}
            >
              Sign Out
            </StyledButton>
          </CardContent>
        </StyledCard>

        {/* Bottom padding for tab navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Light background with slight purple tint
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCardContainer: {
    marginBottom: 16,
  },
  profileCard: {
    marginBottom: 0,
  },
  profileContent: {
    padding: 16,
    borderRadius: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  statIconLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  statLabel: {
    marginLeft: 8,
    color: "white",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  goalCard: {
    marginBottom: 16,
  },
  goalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  goalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  refreshText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#7C3AED", // purple700
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B", // slate-500
  },
  noGoalContainer: {
    padding: 24,
    alignItems: "center",
  },
  noGoalText: {
    marginBottom: 16,
    fontSize: 16,
    color: "#64748B", // slate-500
  },
  setGoalButton: {
    marginTop: 8,
  },
  goalContent: {
    paddingVertical: 8,
  },
  goalDescription: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#334155", // slate-700
  },
  progressTextContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7C3AED", // purple700
  },
  progressTarget: {
    fontSize: 16,
    color: "#64748B", // slate-500
    marginLeft: 4,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#F1F5F9", // slate-100
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPercentage: {
    fontSize: 14,
    color: "#64748B", // slate-500
  },
  rewardsCard: {
    marginBottom: 16,
  },
  rewardsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  rewardBadgeContainer: {
    alignItems: "center",
  },
  rewardIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981", // success500
    marginRight: 8,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#059669", // success600
  },
  signOutCard: {
    marginBottom: 16,
  },
  signOutButton: {
    width: "100%",
  },
  bottomPadding: {
    height: 80,
  },
  snackbar: {
    marginBottom: 80,
  },
});
