import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, Image } from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Button,
  Snackbar,
  Chip,
  Divider,
  Icon,
} from "react-native-paper";
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
      progressText = `${steps} / ${currentTargetValue} steps (${percentage}%)`;
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
        )} / ${currentTargetValue} ${currentTargetUnit} (${percentage}%)`;
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
        )} / ${currentTargetValue} ${currentTargetUnit} (${percentage}%)`;
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
    const saveDailyProgressToSupabase = async () => {
      if (
        !user?.id ||
        !activeGoal?.id ||
        (steps === undefined && distance === undefined) ||
        todaysProgress?.status === "skipped"
      ) {
        return;
      }

      const today = getTodayDateString();
      const currentStatusToSave = currentDailyStatus;

      const WiggleRoomSteps = 10;
      const WiggleRoomDistance = 0.1;

      const stepsChangedSignificantly =
        steps !== undefined &&
        (lastSavedSteps.current === undefined ||
          Math.abs(steps - (lastSavedSteps.current || 0)) > WiggleRoomSteps);

      const distanceChangedSignificantly =
        distance !== undefined &&
        (lastSavedDistance.current === undefined ||
          Math.abs(distance - (lastSavedDistance.current || 0)) >
            WiggleRoomDistance);

      const statusChanged = currentStatusToSave !== lastSavedStatus.current;

      if (
        stepsChangedSignificantly ||
        distanceChangedSignificantly ||
        statusChanged
      ) {
        const progressDataPayload: {
          steps_count?: number;
          distance_ran_km?: number;
        } = {};
        if (steps !== undefined) {
          progressDataPayload.steps_count = steps;
        }
        if (distance !== undefined) {
          progressDataPayload.distance_ran_km = distance;
        }

        const upsertPayload: UpsertDailyProgressData = {
          user_id: user.id,
          goal_id: activeGoal.id,
          date: today,
          progress_data: progressDataPayload,
          status: currentStatusToSave,
        };

        if (
          todaysProgress?.effective_target_value !== null &&
          todaysProgress?.effective_target_value !== undefined
        ) {
          upsertPayload.effective_target_value =
            todaysProgress.effective_target_value;
          upsertPayload.effective_target_unit =
            todaysProgress.effective_target_unit;
        }

        console.log(
          "Dashboard: PRE-CALL upsertPayload:",
          JSON.stringify(upsertPayload)
        );

        const result = await upsertDailyProgress(upsertPayload);

        if (result) {
          console.log(
            "Dashboard: Successfully saved/updated daily progress:",
            result
          );
          lastSavedSteps.current = steps;
          lastSavedDistance.current = distance;
          lastSavedStatus.current = currentStatusToSave;
        } else {
          console.error("Dashboard: Failed to save/update daily progress.");
        }
      }
    };

    const timerId = setTimeout(saveDailyProgressToSupabase, 3000);
    return () => clearTimeout(timerId);
  }, [
    user,
    activeGoal,
    steps,
    distance,
    currentDailyStatus,
    refreshUserProfile,
    todaysProgress,
  ]);

  const handleRefresh = useCallback(async () => {
    if (user) {
      setIsLoadingActiveGoal(true);
      setIsLoadingTodaysProgress(true);
      if (hasPermissions) await fetchDailyHealthData();
      await refreshUserProfile();

      getActiveGoal(user)
        .then(({ data, error }) => {
          if (error) setActiveGoal(null);
          else setActiveGoal(data);
        })
        .finally(() => setIsLoadingActiveGoal(false));

      getTodaysDailyProgress(user.id)
        .then(({ data, error }) => {
          if (error) setTodaysProgress(null);
          else setTodaysProgress(data);
        })
        .finally(() => setIsLoadingTodaysProgress(false));
    }
  }, [user, refreshUserProfile, fetchDailyHealthData, hasPermissions]);

  if (
    loadingProfile ||
    isLoadingActiveGoal ||
    (isLoadingTodaysProgress && !todaysProgress)
  ) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Please log in to see your dashboard.</Text>
        <Button
          mode="contained"
          onPress={() => signOut()}
          style={styles.button}
        >
          Go to Login
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="User Profile" />
        <Card.Content>
          <Text variant="titleMedium">
            Welcome, {profile?.username || user.email}
          </Text>
          <Text>Coins: {profile?.coin_balance ?? "Loading..."}</Text>
          <Text>Streak: {profile?.current_streak_length ?? "0"} days</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Today's Goal" />
        <Card.Content>
          {isLoadingActiveGoal || isLoadingTodaysProgress ? (
            <ActivityIndicator animating={true} />
          ) : activeGoal ? (
            <>
              <Text variant="headlineSmall">
                {activeGoal.goal_type === "steps" ? "Walk/Run" : "Run"}{" "}
                {todaysProgress?.effective_target_value !== null &&
                todaysProgress?.effective_target_value !== undefined
                  ? todaysProgress.effective_target_value
                  : activeGoal.target_value}{" "}
                {todaysProgress?.effective_target_unit ||
                  activeGoal.target_unit}
              </Text>
              {todaysProgress?.effective_target_value !== null &&
                todaysProgress?.effective_target_value !== undefined && (
                  <Chip
                    icon="arrow-down-circle"
                    mode="outlined"
                    style={styles.chip}
                  >
                    Goal reduced by item! Original: {activeGoal.target_value}{" "}
                    {activeGoal.target_unit}
                  </Chip>
                )}
              {todaysProgress?.status === "skipped" && (
                <Chip
                  icon="calendar-check"
                  mode="outlined"
                  style={[styles.chip, styles.statusChipSkipped]}
                >
                  Skip Day Active
                </Chip>
              )}
              <Text style={styles.progressText}>{dailyProgressText}</Text>
              <Text>
                Status: {currentDailyStatus}
                {isTodayGoalMet &&
                  currentDailyStatus !== "skipped" &&
                  " (Completed!)"}
              </Text>
            </>
          ) : (
            <Text>No active goal set. Go to the Goals tab to set one!</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button
            icon="refresh"
            onPress={handleRefresh}
            loading={
              isLoadingActiveGoal ||
              isLoadingTodaysProgress ||
              isLoadingHealthData
            }
          >
            Refresh Data
          </Button>
        </Card.Actions>
      </Card>

      {(todaysProgress?.status === "skipped" ||
        hasStreakSaver ||
        (todaysProgress?.effective_target_value !== null &&
          todaysProgress?.effective_target_value !== undefined)) && (
        <Card style={styles.card}>
          <Card.Title title="Active Rewards Info" />
          <Card.Content>
            {todaysProgress?.status === "skipped" && (
              <Chip
                icon="skip-next"
                mode="flat"
                style={[styles.chip, styles.statusChipSkipped]}
              >
                Today's goal is SKIPPED
              </Chip>
            )}
            {todaysProgress?.effective_target_value !== null &&
              todaysProgress?.effective_target_value !== undefined && (
                <Chip
                  icon="arrow-down-circle"
                  mode="flat"
                  style={[styles.chip, { backgroundColor: "#bbdefb" }]}
                >
                  Goal reduced to {todaysProgress.effective_target_value}{" "}
                  {todaysProgress.effective_target_unit}
                </Chip>
              )}
            {hasStreakSaver && (
              <Chip
                icon="shield-check"
                mode="flat"
                style={[styles.chip, styles.statusChipStreakSaver]}
              >
                Streak Saver is ACTIVE
              </Chip>
            )}
          </Card.Content>
        </Card>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_MEDIUM}
      >
        {snackbarMessage}
      </Snackbar>
      <Button onPress={signOut} mode="outlined" style={styles.button}>
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
  },
  progressText: {
    fontSize: 18,
    marginVertical: 8,
    fontWeight: "bold",
  },
  chip: {
    marginVertical: 4,
    alignSelf: "flex-start",
  },
  statusChipSkipped: {
    backgroundColor: "#ffe0b2",
  },
  statusChipStreakSaver: {
    backgroundColor: "#c8e6c9",
  },
});
