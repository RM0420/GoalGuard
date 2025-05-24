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
import {
  getUserGoal,
  createGoal,
  CreateGoalData,
  updateGoal,
  UpdateGoalData,
  getDailyProgress,
  createOrUpdateDailyProgress,
  Goal,
  DailyProgress,
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
  userGoal: Goal | null;
  isLoadingGoal: boolean;
  todayProgress: DailyProgress | null;
  isLoadingProgress: boolean;
  fetchUserGoal: () => Promise<void>;
  setUserGoal: (goalData: CreateGoalData) => Promise<Goal | null>;
  updateUserGoal: (
    goalId: string,
    updates: UpdateGoalData
  ) => Promise<Goal | null>;
  fetchDailyProgress: (date: string) => Promise<DailyProgress | null>;
  updateDailyProgress: (
    date: string,
    progressData: Partial<
      Omit<DailyProgress, "id" | "user_id" | "date" | "goal_id">
    >
  ) => Promise<DailyProgress | null>;
  clearUserGoal: () => void;
}

/**
 * @interface GoalsProviderProps
 * Props for the GoalsProvider component.
 */
interface GoalsProviderProps {
  children: ReactNode;
}

// Create the context with a default value
const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

/**
 * `GoalsProvider` fetches and manages the user's goal.
 * @param {GoalsProviderProps} props - The props for the component.
 * @returns {JSX.Element} The provider component.
 */
export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const { user, session } = useAuth();
  const { awardCoinsForGoalCompletion, processStreakUpdateAndBonus } =
    useUserProfile();
  const [userGoal, setUserGoal_state] = useState<Goal | null>(null);
  const [isLoadingGoal, setIsLoadingGoal] = useState<boolean>(true);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(
    null
  );
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(true);

  const fetchUserGoal = useCallback(async () => {
    if (!user) {
      setUserGoal_state(null);
      setIsLoadingGoal(false);
      return;
    }
    setIsLoadingGoal(true);
    const { data, error } = await getUserGoal(user);
    if (error) {
      Alert.alert(
        "Error Fetching Goal",
        "Could not fetch your goal. You might need to set one."
      );
      setUserGoal_state(null);
    } else {
      setUserGoal_state(data); // data can be null if no goal exists, which is fine
    }
    setIsLoadingGoal(false);
  }, [user]);

  const fetchDailyProgress = useCallback(
    async (date: string): Promise<DailyProgress | null> => {
      if (!user) {
        setIsLoadingProgress(false);
        return null;
      }
      setIsLoadingProgress(true);
      const { data, error } = await getDailyProgress(user, date);
      setIsLoadingProgress(false);
      if (error) {
        console.error("Error fetching daily progress:", error);
        return null;
      }
      if (date === getTodayDateString()) {
        setTodayProgress(data);
      }
      return data || null;
    },
    [user]
  );

  // Fetch user goal and today's progress on mount or when user/session changes
  useEffect(() => {
    if (user && session) {
      fetchUserGoal();
      const todayStr = getTodayDateString();
      fetchDailyProgress(todayStr);
    }
    if (!session) {
      // User logged out
      setUserGoal_state(null);
      setTodayProgress(null);
      setIsLoadingGoal(true); // Reset loading state for next login
      setIsLoadingProgress(true);
    }
  }, [user, session, fetchUserGoal, fetchDailyProgress]);

  const setUserGoal = async (
    goalData: CreateGoalData
  ): Promise<Goal | null> => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to set a goal.");
      return null;
    }
    setIsLoadingGoal(true);
    const { data, error } = await createGoal(user, goalData);
    if (error) {
      Alert.alert(
        "Error Setting Goal",
        error.message || "Could not save your goal."
      );
      setIsLoadingGoal(false);
      return null;
    } else {
      setUserGoal_state(data || null);
      setIsLoadingGoal(false);
      Alert.alert("Success", "Goal set successfully!");
      return data || null;
    }
  };

  const updateUserGoal = async (
    goalId: string,
    updates: UpdateGoalData
  ): Promise<Goal | null> => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to update a goal.");
      return null;
    }
    setIsLoadingGoal(true);
    const { data: updatedGoalData, error } = await updateGoal(
      user,
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

    setUserGoal_state(updatedGoalData || null);
    Alert.alert("Success", "Goal updated successfully!");
    return updatedGoalData || null;
  };

  const updateDailyProgress = async (
    date: string,
    progressData: Partial<
      Omit<DailyProgress, "id" | "user_id" | "date" | "goal_id">
    >
  ): Promise<DailyProgress | null> => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to update progress.");
      return null;
    }
    setIsLoadingProgress(true);
    const { data, error } = await createOrUpdateDailyProgress(
      user,
      date,
      progressData
    );
    setIsLoadingProgress(false);

    if (error) {
      Alert.alert(
        "Error Updating Progress",
        error.message || "Could not update your progress."
      );
      return null;
    }

    if (date === getTodayDateString()) {
      setTodayProgress(data || null);
    }

    return data || null;
  };

  const clearUserGoal = () => {
    setUserGoal_state(null);
  };

  return (
    <GoalsContext.Provider
      value={{
        userGoal,
        isLoadingGoal,
        todayProgress,
        isLoadingProgress,
        fetchUserGoal,
        setUserGoal,
        updateUserGoal,
        fetchDailyProgress,
        updateDailyProgress,
        clearUserGoal,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
};

/**
 * `useGoals` hook for consuming the GoalsContext.
 * @returns {GoalsContextType} The goals context.
 * @throws {Error} If used outside of a GoalsProvider.
 */
export const useGoals = (): GoalsContextType => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error("useGoals must be used within a GoalsProvider");
  }
  return context;
};
