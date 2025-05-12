import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
import { useAuth } from "./AuthContext";
import { useUserProfile } from "./UserProfileContext";
import { Goal } from "../types/database.types";
import {
  getGoalByDate,
  createGoal,
  CreateGoalData,
  updateGoal,
  UpdateGoalData,
} from "../api/goalsApi";
import { Alert } from "react-native";

// Utility to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

/**
 * @interface GoalsContextType
 * Defines the shape of the GoalsContext.
 */
interface GoalsContextType {
  currentDailyGoal: Goal | null;
  isLoadingGoal: boolean;
  fetchCurrentDailyGoal: (user: User, date: string) => Promise<void>; // Explicit user and date
  setCurrentDailyGoal: (goalData: CreateGoalData) => Promise<Goal | null>;
  updateCurrentDailyGoal: (
    goalId: string,
    updates: UpdateGoalData
  ) => Promise<Goal | null>;
  clearCurrentGoal: () => void;
  // Potentially add functions to fetch goal for a *specific* date if needed beyond today
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

/**
 * @interface GoalsProviderProps
 * Defines props for GoalsProvider.
 */
interface GoalsProviderProps {
  children: ReactNode;
}

/**
 * `GoalsProvider` fetches and manages the user's current daily goal.
 * @param {GoalsProviderProps} props - The props for the component.
 * @returns {JSX.Element} The provider component.
 */
export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const { user, session } = useAuth();
  const { awardCoinsForGoalCompletion, processStreakUpdateAndBonus } =
    useUserProfile();
  const [currentDailyGoal, setCurrentDailyGoal_state] = useState<Goal | null>(
    null
  );
  const [isLoadingGoal, setIsLoadingGoal] = useState<boolean>(true);

  const fetchCurrentDailyGoal = useCallback(
    async (currentUser: User, date: string) => {
      if (!currentUser) {
        setCurrentDailyGoal_state(null);
        setIsLoadingGoal(false);
        return;
      }
      setIsLoadingGoal(true);
      const { data, error } = await getGoalByDate(currentUser, date);
      if (error) {
        Alert.alert(
          "Error Fetching Goal",
          "Could not fetch your goal for today. You might need to set one."
        );
        setCurrentDailyGoal_state(null);
      } else {
        setCurrentDailyGoal_state(data); // data can be null if no goal exists, which is fine
      }
      setIsLoadingGoal(false);
    },
    []
  );

  useEffect(() => {
    if (user && session) {
      const todayStr = getTodayDateString();
      fetchCurrentDailyGoal(user, todayStr);
    }
    if (!session) {
      // User logged out
      setCurrentDailyGoal_state(null);
      setIsLoadingGoal(true); // Reset loading state for next login
    }
  }, [user, session, fetchCurrentDailyGoal]);

  const setCurrentDailyGoal = async (
    goalData: CreateGoalData
  ): Promise<Goal | null> => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to set a goal.");
      return null;
    }
    setIsLoadingGoal(true);
    const { data, error } = await createGoal(user, goalData);
    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        Alert.alert(
          "Goal Exists",
          "You already have a goal set for this date. You can edit it instead."
        );
      } else {
        Alert.alert(
          "Error Setting Goal",
          error.message || "Could not save your goal."
        );
      }
      setIsLoadingGoal(false);
      return null;
    } else {
      setCurrentDailyGoal_state(data || null);
      setIsLoadingGoal(false);
      Alert.alert("Success", "Daily goal set successfully!");
      return data || null;
    }
  };

  const updateCurrentDailyGoal = async (
    goalId: string,
    updates: UpdateGoalData
  ): Promise<Goal | null> => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to update a goal.");
      return null;
    }
    setIsLoadingGoal(true);
    const { data: updatedGoalData, error } = await updateGoal(
      user!, // Assuming user is checked above
      goalId,
      updates
    );
    setIsLoadingGoal(false);

    if (error) {
      Alert.alert(
        "Error Updating Goal",
        error.message || "Could not update your goal."
      );
      return null;
    }

    setCurrentDailyGoal_state(updatedGoalData || null);
    Alert.alert("Success", "Goal updated successfully!");

    console.log("[GoalsContext] Checking conditions for rewards...");
    console.log("[GoalsContext] updates.status:", updates.status);
    console.log("[GoalsContext] user?.id:", user?.id);
    console.log("[GoalsContext] updatedGoalData?.id:", updatedGoalData?.id);
    console.log("[GoalsContext] updatedGoalData?.date:", updatedGoalData?.date);

    if (
      updates.status === "completed" &&
      user?.id &&
      updatedGoalData?.id &&
      updatedGoalData?.date
    ) {
      console.log(
        "[GoalsContext] All conditions met. Proceeding with rewards..."
      );
      console.log(
        "[GoalsContext] Attempting to award base coins for goal ID:",
        updatedGoalData.id
      );
      const baseCoinsAwarded = await awardCoinsForGoalCompletion(
        user.id,
        updatedGoalData.id
      );
      console.log("[GoalsContext] baseCoinsAwarded result:", baseCoinsAwarded);
      if (baseCoinsAwarded) {
        console.log("[GoalsContext] Base coins logic successful.");
      } else {
        console.warn(
          "[GoalsContext] Failed to award base coins. Check UserProfileContext logs."
        );
      }

      console.log(
        "[GoalsContext] Attempting to process streak for goal ID:",
        updatedGoalData.id,
        "date:",
        updatedGoalData.date
      );
      const streakProcessed = await processStreakUpdateAndBonus(
        user.id,
        updatedGoalData.date,
        updatedGoalData.id
      );
      console.log("[GoalsContext] streakProcessed result:", streakProcessed);
      if (streakProcessed) {
        console.log(
          "[GoalsContext] Streak update and potential bonus processed successfully. Profile has been refreshed."
        );
      } else {
        console.warn(
          "[GoalsContext] Failed to process streak update/bonus. Check UserProfileContext logs."
        );
      }
    } else {
      console.log("[GoalsContext] Conditions for rewards NOT met.");
    }
    return updatedGoalData || null;
  };

  const clearCurrentGoal = () => {
    setCurrentDailyGoal_state(null);
  };

  const value = {
    currentDailyGoal,
    isLoadingGoal,
    fetchCurrentDailyGoal,
    setCurrentDailyGoal,
    updateCurrentDailyGoal,
    clearCurrentGoal,
  };

  return (
    <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>
  );
};

/**
 * `useGoals` is a custom hook to easily access the `GoalsContext`.
 */
export const useGoals = (): GoalsContextType => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error("useGoals must be used within a GoalsProvider");
  }
  return context;
};
