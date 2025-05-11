import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  RadioButton,
  Divider,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { useGoals } from "../../src/contexts/GoalsContext";
import { CreateGoalData, UpdateGoalData } from "../../src/api/goalsApi"; // Ensure this path is correct

/**
 * `GoalsScreen` - Placeholder for goal setting and viewing.
 * @returns {JSX.Element}
 */

// Utility to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

// Define available goal types and their units
const GOAL_TYPES = {
  steps: { label: "Steps", units: ["steps"] },
  run_distance: { label: "Running Distance", units: ["km", "miles"] },
  // Add more types as needed
};

export default function GoalsScreen() {
  const { user } = useAuth();
  const {
    currentDailyGoal,
    isLoadingGoal,
    setCurrentDailyGoal,
    updateCurrentDailyGoal,
    fetchCurrentDailyGoal, // Added to refresh if needed
  } = useGoals();

  // Form state
  const [selectedGoalTypeKey, setSelectedGoalTypeKey] =
    useState<keyof typeof GOAL_TYPES>("steps");
  const [targetValue, setTargetValue] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>(
    GOAL_TYPES.steps.units[0]
  );
  const [appsToBlockInput, setAppsToBlockInput] = useState<string>(""); // Comma-separated string

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    if (currentDailyGoal) {
      setFormMode("edit");
      const typeKey = Object.keys(GOAL_TYPES).find(
        (key) =>
          GOAL_TYPES[key as keyof typeof GOAL_TYPES].label
            .toLowerCase()
            .replace(/ /g, "_") === currentDailyGoal.goal_type || // Backward compatibility or direct match
          key === currentDailyGoal.goal_type // Direct key match
      ) as keyof typeof GOAL_TYPES | undefined;

      if (typeKey) setSelectedGoalTypeKey(typeKey);
      else setSelectedGoalTypeKey("steps"); // Default if type not found

      setTargetValue(currentDailyGoal.target_value.toString());
      setSelectedUnit(currentDailyGoal.target_unit);
      setAppsToBlockInput((currentDailyGoal.apps_to_block || []).join(", "));
    } else {
      setFormMode("create");
      // Reset form for new goal entry if no current goal
      setSelectedGoalTypeKey("steps");
      setTargetValue("");
      setSelectedUnit(GOAL_TYPES.steps.units[0]);
      setAppsToBlockInput("");
    }
  }, [currentDailyGoal]);

  // Update available units when goal type changes
  useEffect(() => {
    setSelectedUnit(GOAL_TYPES[selectedGoalTypeKey].units[0]);
  }, [selectedGoalTypeKey]);

  const handleSaveGoal = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }
    if (
      !targetValue ||
      isNaN(parseInt(targetValue)) ||
      parseInt(targetValue) <= 0
    ) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid target value greater than 0."
      );
      return;
    }

    setIsSubmitting(true);

    const appsArray = appsToBlockInput
      .split(",")
      .map((app) => app.trim())
      .filter((app) => app !== "");

    const goalPayload = {
      goal_type: selectedGoalTypeKey, // Store the key like 'steps' or 'run_distance'
      target_value: parseInt(targetValue, 10),
      target_unit: selectedUnit,
      date: getTodayDateString(), // Goal is always for today on this screen
      apps_to_block: appsArray.length > 0 ? appsArray : null,
    };

    let success = false;
    if (formMode === "create") {
      const createdGoal = await setCurrentDailyGoal(
        goalPayload as CreateGoalData
      );
      success = !!createdGoal;
    } else if (formMode === "edit" && currentDailyGoal?.id) {
      const updatedGoal = await updateCurrentDailyGoal(
        currentDailyGoal.id,
        goalPayload as UpdateGoalData
      );
      success = !!updatedGoal;
    }

    if (success && user) {
      // Optionally, refresh explicitly, though context should update state
      // await fetchCurrentDailyGoal(user, getTodayDateString());
    }
    setIsSubmitting(false);
  };

  if (isLoadingGoal && !currentDailyGoal) {
    // Show loading only if no goal is displayed yet
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Loading goal...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={styles.card}>
        <Card.Title
          title={formMode === "edit" ? "Edit Today's Goal" : "Set Today's Goal"}
        />
        <Card.Content>
          <Text variant="titleMedium" style={styles.label}>
            Select Goal Type:
          </Text>
          <RadioButton.Group
            onValueChange={(newValue) =>
              setSelectedGoalTypeKey(newValue as keyof typeof GOAL_TYPES)
            }
            value={selectedGoalTypeKey}
          >
            {Object.entries(GOAL_TYPES).map(([key, { label }]) => (
              <View key={key} style={styles.radioButtonItem}>
                <RadioButton value={key} disabled={isSubmitting} />
                <Text>{label}</Text>
              </View>
            ))}
          </RadioButton.Group>

          <Divider style={styles.divider} />

          <TextInput
            label={`Target ${GOAL_TYPES[selectedGoalTypeKey].label}`}
            value={targetValue}
            onChangeText={setTargetValue}
            keyboardType="numeric"
            style={styles.input}
            disabled={isSubmitting}
          />

          {GOAL_TYPES[selectedGoalTypeKey].units.length > 1 && (
            <>
              <Text variant="titleMedium" style={styles.label}>
                Select Unit:
              </Text>
              <RadioButton.Group
                onValueChange={(newValue) => setSelectedUnit(newValue)}
                value={selectedUnit}
              >
                {GOAL_TYPES[selectedGoalTypeKey].units.map((unit) => (
                  <View key={unit} style={styles.radioButtonItem}>
                    <RadioButton value={unit} disabled={isSubmitting} />
                    <Text>{unit}</Text>
                  </View>
                ))}
              </RadioButton.Group>
              <Divider style={styles.divider} />
            </>
          )}

          <TextInput
            label="Apps to Block (comma-separated, e.g., instagram,facebook)"
            value={appsToBlockInput}
            onChangeText={setAppsToBlockInput}
            style={styles.input}
            disabled={isSubmitting}
            placeholder="Optional: com.app.id1, com.app.id2"
          />

          <Button
            mode="contained"
            onPress={handleSaveGoal}
            loading={isSubmitting || isLoadingGoal} // Also show loading if context is still fetching
            disabled={isSubmitting || isLoadingGoal}
            style={styles.button}
          >
            {formMode === "edit" ? "Update Goal" : "Set Goal"}
          </Button>
          {formMode === "edit" && currentDailyGoal && (
            <Button
              mode="outlined"
              onPress={() => {
                /* TODO: Implement delete or clear goal */ Alert.alert(
                  "Not Implemented",
                  "Delete/clear goal functionality to be added."
                );
              }}
              disabled={isSubmitting || isLoadingGoal}
              style={styles.button}
              textColor="red"
            >
              Delete Goal (Not Implemented)
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  radioButtonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
  },
});
