import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Button,
  Snackbar,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { useUserProfile } from "../../src/contexts/UserProfileContext";
import { useGoals } from "../../src/contexts/GoalsContext";
import useHealthKit from "../../src/hooks/useHealthKit";
import { Goal } from "../../src/types/database.types";
import { upsertDailyProgress } from "../../src/api/progressApi";

/**
 * `DashboardScreen` is the main screen users see after logging in.
 * It displays a summary of their goal progress, streaks, and coin balance.
 * @returns {JSX.Element} The dashboard screen component.
 */
export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { profile, loadingProfile, refreshUserProfile } = useUserProfile();
  const { currentDailyGoal, isLoadingGoal, updateCurrentDailyGoal } =
    useGoals();

  const {
    steps,
    distance,
    isLoading: isLoadingHealthData,
    error: healthError,
    hasPermissions,
    requestPermissions,
    fetchDailyHealthData,
  } = useHealthKit();

  const [mockGoalProgressText, setMockGoalProgressText] = useState<string>("");
  const [isMockGoalMet, setIsMockGoalMet] = useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const lastSavedSteps = useRef<number | undefined>(undefined);
  const lastSavedDistance = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!hasPermissions) {
      console.log(
        "Dashboard: Attempting to request HealthKit permissions on mount."
      );
      requestPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasPermissions) {
      console.log("Dashboard: Permissions are present, fetching health data.");
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
    if (!currentDailyGoal || isLoadingHealthData) {
      setMockGoalProgressText("");
      setIsMockGoalMet(false);
      return;
    }

    let progressText = "";
    let currentTargetMet = false;
    let percentage = 0;

    if (currentDailyGoal.goal_type === "steps" && steps !== undefined) {
      if (currentDailyGoal.target_value > 0) {
        currentTargetMet = steps >= currentDailyGoal.target_value;
        percentage = Math.min(
          100,
          Math.floor((steps / currentDailyGoal.target_value) * 100)
        );
        progressText = currentTargetMet
          ? "Goal Met (Health Data)!"
          : `${percentage}% of target (Health Data).`;
      }
    } else if (
      currentDailyGoal.goal_type === "run_distance" &&
      distance !== undefined
    ) {
      if (
        currentDailyGoal.target_unit === "km" &&
        currentDailyGoal.target_value > 0
      ) {
        currentTargetMet = distance >= currentDailyGoal.target_value;
        percentage = Math.min(
          100,
          Math.floor((distance / currentDailyGoal.target_value) * 100)
        );
        progressText = currentTargetMet
          ? "Goal Met (Health Data)!"
          : `${percentage}% of target (Health Data).`;
      } else if (currentDailyGoal.target_unit !== "km") {
        progressText = `(Target unit ${currentDailyGoal.target_unit} not yet fully supported for distance progress text)`;
      }
    }

    setMockGoalProgressText(progressText);
    setIsMockGoalMet(currentTargetMet);
  }, [currentDailyGoal, steps, distance, isLoadingHealthData]);

  useEffect(() => {
    const saveProgress = async () => {
      if (user?.id && currentDailyGoal?.id && currentDailyGoal.date) {
        const WiggleRoomSteps = 10;
        const WiggleRoomDistance = 0.1;

        const stepsChanged =
          steps !== undefined &&
          (lastSavedSteps.current === undefined ||
            Math.abs(steps - (lastSavedSteps.current || 0)) > WiggleRoomSteps);
        const distanceChanged =
          distance !== undefined &&
          (lastSavedDistance.current === undefined ||
            Math.abs(distance - (lastSavedDistance.current || 0)) >
              WiggleRoomDistance);

        if (
          (steps !== undefined || distance !== undefined) &&
          (stepsChanged || distanceChanged)
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

          if (Object.keys(progressDataPayload).length > 0) {
            console.log(
              "Dashboard: Attempting to save daily progress to Supabase:",
              progressDataPayload
            );
            const result = await upsertDailyProgress({
              user_id: user.id,
              goal_id: currentDailyGoal.id,
              date: currentDailyGoal.date,
              progress_data: progressDataPayload,
            });

            if (result) {
              console.log(
                "Dashboard: Successfully saved daily progress.",
                result
              );
              setSnackbarMessage("Health progress synced!");
              setSnackbarVisible(true);
              if (steps !== undefined) lastSavedSteps.current = steps;
              if (distance !== undefined) lastSavedDistance.current = distance;
            } else {
              console.error("Dashboard: Failed to save daily progress.");
              setSnackbarMessage(
                "Failed to sync health progress. Please try again."
              );
              setSnackbarVisible(true);
            }
          }
        }
      }
    };

    saveProgress();
  }, [user, currentDailyGoal, steps, distance]);

  const handleMarkGoalCompleted = async () => {
    if (currentDailyGoal && currentDailyGoal.id && user?.id) {
      await updateCurrentDailyGoal(currentDailyGoal.id, {
        status: "completed",
      });
    }
  };

  const handleRequestPermissionsAndFetchData = useCallback(async () => {
    console.log(
      "Dashboard: Manually requesting permissions and fetching data."
    );
    const granted = await requestPermissions();
    if (!granted) {
      setSnackbarMessage(
        "Health permissions are required to track progress automatically."
      );
      setSnackbarVisible(true);
    }
  }, [requestPermissions]);

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
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Today's Goal & Progress" />
        <Card.Content>
          {isLoadingGoal && !currentDailyGoal ? (
            <ActivityIndicator animating={true} />
          ) : currentDailyGoal ? (
            <>
              <Text variant="bodyLarge">
                Type: {currentDailyGoal.goal_type}
              </Text>
              <Text variant="bodyLarge">
                Target: {currentDailyGoal.target_value}{" "}
                {currentDailyGoal.target_unit}
              </Text>
              <Text variant="bodyLarge">Status: {currentDailyGoal.status}</Text>

              <Text variant="bodyMedium" style={styles.progressTitle}>
                Today's Progress (Health Data):
              </Text>
              {isLoadingHealthData ? (
                <ActivityIndicator animating={true} size="small" />
              ) : (
                <>
                  <Text variant="bodySmall">
                    Steps: {steps !== undefined ? steps : "N/A"}
                  </Text>
                  <Text variant="bodySmall">
                    Distance:{" "}
                    {distance !== undefined ? `${distance} km` : "N/A"}
                  </Text>
                  {healthError && (
                    <Text style={{ color: "red" }}>
                      Error: {healthError.message}
                    </Text>
                  )}
                  {mockGoalProgressText ? (
                    <Text
                      variant="labelLarge"
                      style={
                        isMockGoalMet
                          ? styles.goalMetText
                          : styles.goalProgressText
                      }
                    >
                      {mockGoalProgressText}
                    </Text>
                  ) : (
                    !isLoadingHealthData &&
                    !healthError &&
                    currentDailyGoal && <Text>Calculating progress...</Text>
                  )}
                </>
              )}
              {!hasPermissions && (
                <Button
                  mode="outlined"
                  onPress={handleRequestPermissionsAndFetchData}
                  style={styles.button}
                  icon="heart-pulse"
                >
                  Connect to Health Data
                </Button>
              )}
            </>
          ) : (
            <Text>No goal set for today. Go to the Goals tab to set one!</Text>
          )}
        </Card.Content>
      </Card>

      {currentDailyGoal && currentDailyGoal.status === "pending" && (
        <Button
          mode="elevated"
          onPress={handleMarkGoalCompleted}
          style={styles.button}
          icon="check-circle"
          disabled={isLoadingGoal || isLoadingHealthData}
        >
          Mark Goal Completed (Test)
        </Button>
      )}

      <Button
        onPress={async () => {
          await refreshUserProfile();
          if (hasPermissions) await fetchDailyHealthData();
        }}
        style={styles.button}
        mode="outlined"
      >
        Refresh Dashboard
      </Button>

      <Button onPress={signOut} style={styles.button} mode="contained">
        Sign Out
      </Button>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_MEDIUM}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
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
  button: {
    marginTop: 15,
  },
  loadingText: {
    marginTop: 10,
  },
  progressTitle: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "bold",
  },
  goalMetText: {
    marginTop: 5,
    color: "green",
    fontWeight: "bold",
  },
  goalProgressText: {
    marginTop: 5,
    color: "#666",
  },
});
