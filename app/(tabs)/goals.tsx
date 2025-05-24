import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  TextInput,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../../src/contexts/AuthContext";
import { useGoals } from "../../src/contexts/GoalsContext";
import { CreateGoalData } from "../../src/api/goalsApi";
import {
  StyledCard,
  CardHeader,
  CardContent,
  CardTitle,
} from "../../src/components/common/StyledCard";
import { StyledButton } from "../../src/components/common/StyledButton";
import { AppTheme } from "../../src/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * `GoalsScreen` - Allows users to set or update their persistent goal.
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
  const { userGoal, isLoadingGoal, setUserGoal, updateUserGoal } = useGoals();
  const theme = useTheme<AppTheme>();

  // State for loading/submitting states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  const [selectedGoalTypeKey, setSelectedGoalTypeKey] =
    useState<keyof typeof GOAL_TYPES>("steps");
  const [targetValue, setTargetValue] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>(
    GOAL_TYPES.steps.units[0]
  );
  const [appsToBlockInput, setAppsToBlockInput] = useState<string>(""); // Comma-separated string

  // Determine form mode based on whether a goal exists
  const formMode = userGoal ? "edit" : "create";

  // Effect to populate form when userGoal state changes
  useEffect(() => {
    if (userGoal) {
      const typeKey = Object.keys(GOAL_TYPES).find(
        (key) =>
          GOAL_TYPES[key as keyof typeof GOAL_TYPES].label
            .toLowerCase()
            .replace(/ /g, "_") === userGoal.goal_type ||
          key === userGoal.goal_type
      ) as keyof typeof GOAL_TYPES | undefined;

      if (typeKey) setSelectedGoalTypeKey(typeKey);
      else setSelectedGoalTypeKey("steps"); // Default if type not found

      setTargetValue(userGoal.target_value?.toString() || "");
      setSelectedUnit(
        userGoal.target_unit || GOAL_TYPES[selectedGoalTypeKey].units[0]
      );
      // Ensure apps_to_block is an array before joining, default to empty string
      const apps = Array.isArray(userGoal.apps_to_block)
        ? userGoal.apps_to_block.join(", ")
        : "";
      setAppsToBlockInput(apps);
    } else {
      // Reset form for new goal entry if no goal
      setSelectedGoalTypeKey("steps");
      setTargetValue("");
      setSelectedUnit(GOAL_TYPES.steps.units[0]);
      setAppsToBlockInput("");
    }
  }, [userGoal, selectedGoalTypeKey]); // Added selectedGoalTypeKey to deps for unit reset on type change with no userGoal

  // Update available units when goal type changes
  useEffect(() => {
    // Only reset if not driven by userGoal's initial population
    if (!userGoal || selectedGoalTypeKey !== userGoal.goal_type) {
      setSelectedUnit(GOAL_TYPES[selectedGoalTypeKey].units[0]);
    }
  }, [selectedGoalTypeKey, userGoal]);

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

    // Prepare payload for persistent goal
    const goalPayload: CreateGoalData = {
      goal_type: selectedGoalTypeKey,
      target_value: parseInt(targetValue, 10),
      target_unit: selectedUnit,
      apps_to_block: appsArray.length > 0 ? appsArray : null,
    };

    if (formMode === "edit" && userGoal) {
      // Update existing goal
      await updateUserGoal(userGoal.id, goalPayload);
    } else {
      // Create new goal
      await setUserGoal(goalPayload);
    }

    setIsSubmitting(false);
  };

  if (isLoadingGoal) {
    // Show loading if fetching or userGoal is not yet determined
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

  const GoalTypeOption = ({
    goalType,
    label,
    isSelected,
    onSelect,
  }: {
    goalType: keyof typeof GOAL_TYPES;
    label: string;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.goalTypeOption,
        isSelected
          ? {
              backgroundColor: theme.colors.purple50,
              borderColor: theme.colors.purple200,
            }
          : {
              borderColor: theme.colors.customBorder,
            },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.goalTypeRadio}>
        {isSelected ? (
          <View style={styles.goalTypeRadioSelected}>
            <MaterialCommunityIcons name="check" size={14} color="white" />
          </View>
        ) : (
          <View style={styles.goalTypeRadioUnselected} />
        )}
      </View>
      <View style={styles.goalTypeContent}>
        <Text style={styles.goalTypeLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { backgroundColor: theme.colors.customBackground },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Goals</Text>
        <Text style={styles.headerSubtitle}>Set your daily targets</Text>
      </View>

      {/* Goal Setting Card */}
      <StyledCard withShadow style={styles.card}>
        <CardHeader>
          <View style={styles.cardHeaderContent}>
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={theme.colors.purple700}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>
              {formMode === "edit" ? "Edit Daily Goal" : "Set Daily Goal"}
            </Text>
          </View>
        </CardHeader>
        <CardContent>
          {/* Goal Type Selection */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Select Goal Type:</Text>

            <View style={styles.goalTypeContainer}>
              <GoalTypeOption
                goalType="steps"
                label="Steps"
                isSelected={selectedGoalTypeKey === "steps"}
                onSelect={() => setSelectedGoalTypeKey("steps")}
              />

              <GoalTypeOption
                goalType="run_distance"
                label="Running Distance"
                isSelected={selectedGoalTypeKey === "run_distance"}
                onSelect={() => setSelectedGoalTypeKey("run_distance")}
              />
            </View>
          </View>

          {/* Target Value Input */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>
              Target {selectedGoalTypeKey === "steps" ? "Steps" : "Distance"}:
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={targetValue}
              onChangeText={setTargetValue}
              placeholder={
                selectedGoalTypeKey === "steps" ? "e.g., 10000" : "e.g., 5"
              }
              mode="outlined"
              outlineColor={theme.colors.customBorder}
              activeOutlineColor={theme.colors.purple700}
            />

            {/* Unit Selection (only for distance) */}
            {selectedGoalTypeKey === "run_distance" && (
              <View style={styles.unitContainer}>
                {GOAL_TYPES.run_distance.units.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      selectedUnit === unit
                        ? {
                            backgroundColor: theme.colors.purple100,
                            borderColor: theme.colors.purple300,
                          }
                        : {
                            borderColor: theme.colors.customBorder,
                          },
                    ]}
                    onPress={() => setSelectedUnit(unit)}
                  >
                    <Text
                      style={[
                        styles.unitButtonText,
                        selectedUnit === unit
                          ? { color: theme.colors.purple800 }
                          : { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Apps to Block Input */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Apps to Block (Optional):</Text>
            <Text style={styles.helperText}>
              Enter app names separated by commas
            </Text>
            <TextInput
              style={styles.input}
              value={appsToBlockInput}
              onChangeText={setAppsToBlockInput}
              placeholder="Instagram, TikTok, YouTube"
              mode="outlined"
              multiline
              numberOfLines={2}
              outlineColor={theme.colors.customBorder}
              activeOutlineColor={theme.colors.purple700}
            />
          </View>

          {/* Update Button */}
          <StyledButton
            variant="default"
            onPress={handleSaveGoal}
            style={styles.updateButton}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {formMode === "edit" ? "Update Goal" : "Save Goal"}
          </StyledButton>
        </CardContent>
      </StyledCard>

      {/* Bottom padding for navigation */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937", // slate-800
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748B", // slate-500
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  cardHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937", // slate-800
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155", // slate-700
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    color: "#64748B", // slate-500
    marginBottom: 8,
  },
  goalTypeContainer: {
    gap: 12,
  },
  goalTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  goalTypeRadio: {
    marginRight: 12,
  },
  goalTypeRadioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7C3AED", // purple-700
    alignItems: "center",
    justifyContent: "center",
  },
  goalTypeRadioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1", // slate-300
  },
  goalTypeContent: {
    flex: 1,
  },
  goalTypeLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#334155", // slate-700
  },
  input: {
    backgroundColor: "white",
    fontSize: 16,
    padding: 4,
  },
  unitContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  unitButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  updateButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 80,
  },
});
