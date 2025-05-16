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
import { getActiveGoal } from "../../src/api/goalsApi";
import useHealthKit from "../../src/hooks/useHealthKit";
import { Database } from "../../src/types/database.types";
import {
  upsertDailyProgress,
  UpsertDailyProgressData,
} from "../../src/api/progressApi";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type DailyProgressStatus = "pending" | "completed" | "failed" | "skipped";

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
    if (!activeGoal || isLoadingHealthData) {
      setDailyProgressText(
        activeGoal ? "Loading health data..." : "No active goal set."
      );
      setIsTodayGoalMet(false);
      setCurrentDailyStatus("pending");
      return;
    }

    let progressText = "";
    let currentTargetMet = false;
    let percentage = 0;
    let determinedStatus: DailyProgressStatus = "pending";

    if (
      activeGoal.goal_type === "steps" &&
      steps !== undefined &&
      activeGoal.target_value !== null &&
      activeGoal.target_value > 0
    ) {
      currentTargetMet = steps >= activeGoal.target_value;
      percentage = Math.min(
        100,
        Math.floor((steps / activeGoal.target_value) * 100)
      );
      progressText = `${steps} / ${activeGoal.target_value} steps (${percentage}%)`;
      determinedStatus = currentTargetMet ? "completed" : "pending";
    } else if (
      activeGoal.goal_type === "run_distance" &&
      distance !== undefined &&
      activeGoal.target_value !== null &&
      activeGoal.target_unit &&
      activeGoal.target_value > 0
    ) {
      if (activeGoal.target_unit === "km") {
        currentTargetMet = distance >= activeGoal.target_value;
        percentage = Math.min(
          100,
          Math.floor((distance / activeGoal.target_value) * 100)
        );
        progressText = `${distance.toFixed(2)} / ${
          activeGoal.target_value
        } km (${percentage}%)`;
        determinedStatus = currentTargetMet ? "completed" : "pending";
      } else if (activeGoal.target_unit === "miles") {
        const distanceInMiles = distance * 0.621371;
        currentTargetMet = distanceInMiles >= activeGoal.target_value;
        percentage = Math.min(
          100,
          Math.floor((distanceInMiles / activeGoal.target_value) * 100)
        );
        progressText = `${distanceInMiles.toFixed(2)} / ${
          activeGoal.target_value
        } miles (${percentage}%) (Health data in km, converted)`;
        determinedStatus = currentTargetMet ? "completed" : "pending";
      } else {
        progressText = `(Target unit ${activeGoal.target_unit} not fully supported for direct comparison)`;
        determinedStatus = "pending";
      }
    } else {
      progressText =
        "Goal type or target not properly set, or health data unavailable.";
      determinedStatus = "pending";
    }

    setDailyProgressText(progressText);
    setIsTodayGoalMet(currentTargetMet);
    setCurrentDailyStatus(determinedStatus);
  }, [activeGoal, steps, distance, isLoadingHealthData]);

  useEffect(() => {
    const saveDailyProgressToSupabase = async () => {
      if (
        !user?.id ||
        !activeGoal?.id ||
        (steps === undefined && distance === undefined)
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

        if (Object.keys(progressDataPayload).length === 0 && !statusChanged) {
          if (!statusChanged) return;
        }

        const upsertPayload: UpsertDailyProgressData = {
          user_id: user.id,
          goal_id: activeGoal.id,
          date: today,
          progress_data: progressDataPayload,
          status: currentStatusToSave,
        };

        console.log(
          "Dashboard: PRE-CALL upsertPayload:",
          JSON.stringify(upsertPayload)
        );
        console.log(
          "Dashboard: PRE-CALL currentStatusToSave value:",
          currentStatusToSave
        );

        const result = await upsertDailyProgress(upsertPayload);

        if (result) {
          console.log(
            "Dashboard: Successfully upserted daily progress.",
            result
          );
          setSnackbarMessage("Daily progress synced!");
          setSnackbarVisible(true);
          if (steps !== undefined) lastSavedSteps.current = steps;
          if (distance !== undefined) lastSavedDistance.current = distance;
          lastSavedStatus.current = currentStatusToSave;
        } else {
          console.error("Dashboard: Failed to upsert daily progress.");
          setSnackbarMessage(
            "Failed to sync daily progress. Please check connection."
          );
          setSnackbarVisible(true);
        }
      }
    };

    saveDailyProgressToSupabase();
  }, [user, activeGoal, steps, distance, currentDailyStatus]);

  const handleRequestPermissionsAndFetchData = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) {
      setSnackbarMessage(
        "Health permissions are required to track progress automatically."
      );
      setSnackbarVisible(true);
    } else {
      fetchDailyHealthData();
    }
  }, [requestPermissions, fetchDailyHealthData]);

  if (loadingProfile || isLoadingActiveGoal) {
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
        <Card.Title title="My Stats" />
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
        <Card.Title title="Active Goal & Today's Progress" />
        <Card.Content>
          {isLoadingActiveGoal && activeGoal === undefined ? (
            <ActivityIndicator animating={true} />
          ) : activeGoal ? (
            <>
              <Text variant="titleMedium" style={styles.goalTitle}>
                Your Goal:{" "}
                {activeGoal.goal_type === "steps" ? "Walk/Run" : "Run"}{" "}
                {activeGoal.target_value} {activeGoal.target_unit}
              </Text>
              <Text variant="bodyLarge" style={styles.progressHeader}>
                Today's Status:
                <Text
                  style={{
                    fontWeight: isTodayGoalMet ? "bold" : "normal",
                    color: isTodayGoalMet ? "green" : "orange",
                  }}
                >
                  {isTodayGoalMet
                    ? " Goal Met!"
                    : currentDailyStatus === "pending"
                    ? " In Progress"
                    : " Pending Data"}
                </Text>
              </Text>
              <Text variant="bodyMedium" style={styles.progressDetails}>
                Progress:{" "}
                {isLoadingHealthData
                  ? "Fetching health data..."
                  : dailyProgressText}
              </Text>
              {activeGoal.apps_to_block &&
                (activeGoal.apps_to_block as string[]).length > 0 && (
                  <Text variant="bodySmall" style={styles.appsBlockedText}>
                    Apps to block if goal not met:{" "}
                    {(activeGoal.apps_to_block as string[]).join(", ")}
                  </Text>
                )}
            </>
          ) : (
            <Text>
              No active daily goal set. Go to the Goals tab to set one!
            </Text>
          )}
        </Card.Content>
      </Card>

      {!hasPermissions && (
        <Card style={styles.cardWarning}>
          <Card.Content>
            <Text style={styles.warningText}>
              HealthKit permissions are not granted. Progress cannot be tracked
              automatically.
            </Text>
            <Button
              mode="contained"
              onPress={handleRequestPermissionsAndFetchData}
              style={styles.button}
            >
              Grant Permissions
            </Button>
          </Card.Content>
        </Card>
      )}

      <Button
        onPress={refreshUserProfile}
        style={styles.button}
        mode="outlined"
      >
        Refresh Stats
      </Button>
      <Button
        onPress={() => signOut()}
        style={styles.button}
        mode="outlined"
        textColor="red"
      >
        Sign Out
      </Button>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
  },
  cardWarning: {
    marginBottom: 16,
    backgroundColor: "#fff3e0",
  },
  warningText: {
    color: "#e65100",
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  goalTitle: {
    marginBottom: 8,
  },
  progressHeader: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "bold",
  },
  progressDetails: {
    marginBottom: 8,
    color: "#555",
  },
  appsBlockedText: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
  },
});
