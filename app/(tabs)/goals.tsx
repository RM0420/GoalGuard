import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  ActivityIndicator,
  RadioButton,
  Divider,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { getActiveGoal, setGoal, SetGoalData } from "../../src/api/goalsApi";
import { Database } from "../../src/types/database.types"; // For Goal type
import {
  StyledCard,
  CardContent,
  CardTitle,
} from "../../src/components/common/StyledCard";
import { StyledButton } from "../../src/components/common/StyledButton";
import { AppTheme } from "../../src/constants/theme";
import StyledHeader from "../../src/components/common/StyledHeader";

// Define Goal type based on Supabase schema
type Goal = Database["public"]["Tables"]["goals"]["Row"];

/**
 * `GoalsScreen` - Allows users to set or update their daily physical goal.
 * @returns {JSX.Element}
 */

// Define available goal types and their units
const GOAL_TYPES = {
  steps: { label: "Steps", units: ["steps"] },
  run_distance: { label: "Running Distance", units: ["km", "miles"] },
  // Add more types as needed
};

export default function GoalsScreen() {
  const { user } = useAuth();
  const theme = useTheme<AppTheme>();

  // State for the active goal and loading/submitting states
  const [activeGoal, setActiveGoal] = useState<Goal | null | undefined>(
    undefined
  ); // undefined: not yet loaded, null: loaded and no active goal
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  const [selectedGoalTypeKey, setSelectedGoalTypeKey] =
    useState<keyof typeof GOAL_TYPES>("steps");
  const [targetValue, setTargetValue] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>(
    GOAL_TYPES.steps.units[0]
  );
  const [appsToBlockInput, setAppsToBlockInput] = useState<string>(""); // Comma-separated string

  // Determine form mode based on whether an active goal exists
  const formMode = activeGoal ? "edit" : "create";

  // Effect to fetch active goal on load or user change
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getActiveGoal(user)
        .then(({ data, error }) => {
          if (error) {
            Alert.alert("Error", "Could not fetch your active goal.");
            console.error("Error fetching active goal:", error);
            setActiveGoal(null); // Assume no goal if error
          } else {
            setActiveGoal(data); // data can be Goal or null
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setActiveGoal(null); // No user, no goal
      setIsLoading(false);
    }
  }, [user]);

  // Effect to populate form when activeGoal state changes
  useEffect(() => {
    if (activeGoal) {
      const typeKey = Object.keys(GOAL_TYPES).find(
        (key) =>
          GOAL_TYPES[key as keyof typeof GOAL_TYPES].label
            .toLowerCase()
            .replace(/ /g, "_") === activeGoal.goal_type ||
          key === activeGoal.goal_type
      ) as keyof typeof GOAL_TYPES | undefined;

      if (typeKey) setSelectedGoalTypeKey(typeKey);
      else setSelectedGoalTypeKey("steps"); // Default if type not found

      setTargetValue(activeGoal.target_value?.toString() || "");
      setSelectedUnit(
        activeGoal.target_unit || GOAL_TYPES[selectedGoalTypeKey].units[0]
      );
      // Ensure apps_to_block is an array before joining, default to empty string
      const apps = Array.isArray(activeGoal.apps_to_block)
        ? activeGoal.apps_to_block.join(", ")
        : "";
      setAppsToBlockInput(apps);
    } else {
      // Reset form for new goal entry if no active goal
      setSelectedGoalTypeKey("steps");
      setTargetValue("");
      setSelectedUnit(GOAL_TYPES.steps.units[0]);
      setAppsToBlockInput("");
    }
  }, [activeGoal, selectedGoalTypeKey]); // Added selectedGoalTypeKey to deps for unit reset on type change with no activeGoal

  // Update available units when goal type changes
  useEffect(() => {
    // Only reset if not driven by activeGoal's initial population
    if (!activeGoal || selectedGoalTypeKey !== activeGoal.goal_type) {
      setSelectedUnit(GOAL_TYPES[selectedGoalTypeKey].units[0]);
    }
  }, [selectedGoalTypeKey, activeGoal]);

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

    // Prepare payload for setGoal (persistent goal, no date)
    const goalPayload: SetGoalData = {
      goal_type: selectedGoalTypeKey,
      target_value: parseInt(targetValue, 10),
      target_unit: selectedUnit,
      apps_to_block: appsArray.length > 0 ? appsArray : null,
      // Removed date field
    };

    const { data: newGoal, error } = await setGoal(user, goalPayload);

    if (error) {
      Alert.alert(
        "Error",
        `Failed to ${formMode === "edit" ? "update" : "set"} goal. ${
          error.message || ""
        }`
      );
      console.error(
        `Error ${formMode === "edit" ? "updating" : "setting"} goal:`,
        error
      );
    } else if (newGoal) {
      Alert.alert(
        "Success",
        `Goal successfully ${formMode === "edit" ? "updated" : "set"}!`
      );
      setActiveGoal(newGoal); // Update local state with the new/updated goal
      // Optionally, could re-fetch with getActiveGoal(user) for absolute certainty
    } else {
      Alert.alert(
        "Error",
        `Failed to ${
          formMode === "edit" ? "update" : "set"
        } goal. No data returned.`
      );
    }

    setIsSubmitting(false);
  };

  if (isLoading || activeGoal === undefined) {
    // Show loading if fetching or activeGoal is not yet determined
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          animating={true}
          size="large"
          color={theme.colors.purple700}
        />
        <Text style={{ color: theme.colors.onSurface, marginTop: 16 }}>
          Loading your goal...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { backgroundColor: theme.colors.customBackground },
      ]}
    >
      {/* Header */}
      <StyledHeader title="Goals" />

      <StyledCard withShadow style={styles.card}>
        <CardTitle>
          {formMode === "edit" ? "Edit Daily Goal" : "Set Daily Goal"}
        </CardTitle>
        <CardContent>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Select Goal Type:
          </Text>
          <RadioButton.Group
            onValueChange={(newValue) =>
              setSelectedGoalTypeKey(newValue as keyof typeof GOAL_TYPES)
            }
            value={selectedGoalTypeKey}
          >
            {Object.entries(GOAL_TYPES).map(([key, { label }]) => (
              <View
                key={key}
                style={[
                  styles.radioButtonItem,
                  {
                    backgroundColor:
                      key === selectedGoalTypeKey
                        ? theme.colors.purple50
                        : theme.colors.surface,
                    borderColor:
                      key === selectedGoalTypeKey
                        ? theme.colors.purple300
                        : theme.colors.customBorder,
                  },
                ]}
              >
                <RadioButton
                  value={key}
                  disabled={isSubmitting}
                  color={theme.colors.purple700}
                />
                <Text
                  style={[
                    styles.radioButtonLabel,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </RadioButton.Group>

          <Divider style={styles.divider} />

          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {`Target ${GOAL_TYPES[selectedGoalTypeKey].label}`}
          </Text>
          <TextInput
            value={targetValue}
            onChangeText={setTargetValue}
            keyboardType="numeric"
            style={styles.input}
            disabled={isSubmitting}
            placeholder={`Enter target ${GOAL_TYPES[
              selectedGoalTypeKey
            ].label.toLowerCase()}`}
            placeholderTextColor={theme.colors.customMutedForeground}
            mode="outlined"
            outlineColor={theme.colors.customBorder}
            activeOutlineColor={theme.colors.purple600}
          />

          {GOAL_TYPES[selectedGoalTypeKey].units.length > 1 && (
            <>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Select Unit:
              </Text>
              <RadioButton.Group
                onValueChange={(newValue) => setSelectedUnit(newValue)}
                value={selectedUnit}
              >
                {GOAL_TYPES[selectedGoalTypeKey].units.map((unit) => (
                  <View
                    key={unit}
                    style={[
                      styles.radioButtonItem,
                      {
                        backgroundColor:
                          unit === selectedUnit
                            ? theme.colors.purple50
                            : theme.colors.surface,
                        borderColor:
                          unit === selectedUnit
                            ? theme.colors.purple300
                            : theme.colors.customBorder,
                      },
                    ]}
                  >
                    <RadioButton
                      value={unit}
                      disabled={isSubmitting}
                      color={theme.colors.purple700}
                    />
                    <Text
                      style={[
                        styles.radioButtonLabel,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {unit}
                    </Text>
                  </View>
                ))}
              </RadioButton.Group>
              <Divider style={styles.divider} />
            </>
          )}

          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            Apps to Block
          </Text>
          <TextInput
            value={appsToBlockInput}
            onChangeText={setAppsToBlockInput}
            style={styles.input}
            disabled={isSubmitting}
            placeholder="Instagram, TikTok, YouTube"
            placeholderTextColor={theme.colors.customMutedForeground}
            mode="outlined"
            outlineColor={theme.colors.customBorder}
            activeOutlineColor={theme.colors.purple600}
          />

          <StyledButton
            variant="default"
            size="lg"
            onPress={handleSaveGoal}
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
            style={styles.button}
          >
            {formMode === "edit" ? "Update Goal" : "Set Goal"}
          </StyledButton>
        </CardContent>
      </StyledCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 16,
  },
  input: {
    marginBottom: 20,
    fontSize: 16,
    height: 56,
  },
  button: {
    marginTop: 24,
  },
  radioButtonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  radioButtonLabel: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
  divider: {
    marginVertical: 16,
  },
});
