import { supabase } from "../lib/supabaseClient";
import { Database } from "../types/database.types";
import { User } from "@supabase/supabase-js";

// Define Goal type based on Supabase schema
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type DailyProgress =
  Database["public"]["Tables"]["daily_progress"]["Row"];

/**
 * @file goalsApi.ts
 * Contains functions for interacting with the `goals` table in the Supabase backend.
 * Manages a user's persistent goal.
 */

/**
 * `CreateGoalData` type for creating a user's goal.
 * Omits fields that are auto-generated or derived (id, user_id, is_active, created_at, updated_at).
 */
export type CreateGoalData = Omit<
  Goal,
  "id" | "user_id" | "is_active" | "created_at" | "updated_at"
>;

/**
 * `UpdateGoalData` type for updating a user's goal.
 * Similar to CreateGoalData but with all fields optional.
 */
export type UpdateGoalData = Partial<CreateGoalData>;

/**
 * `createGoal`
 * Creates or updates the user's goal using the set_user_goal function.
 * If the user already has a goal, it will be updated rather than creating a new one.
 * @param {User} user - The authenticated Supabase user object.
 * @param {CreateGoalData} goalData - The data for the goal.
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The created/updated goal data or an error.
 */
export const createGoal = async (
  user: User,
  goalData: CreateGoalData
): Promise<{ data?: Goal | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    // Call the set_user_goal RPC function to create or update the user's goal
    const { data, error } = await supabase.rpc("set_user_goal", {
      p_user_id: user.id,
      p_goal_type: goalData.goal_type,
      p_target_value: goalData.target_value,
      p_target_unit: goalData.target_unit,
      p_apps_to_block: goalData.apps_to_block,
    });

    if (error) {
      console.error("Error setting user goal via RPC:", error);
      throw error;
    }

    // After successfully creating/updating the goal, fetch the complete goal data
    if (data) {
      return await getUserGoal(user);
    }
    return { data: null };
  } catch (error) {
    return { error };
  }
};

/**
 * `getUserGoal`
 * Fetches the user's goal.
 * @param {User} user - The authenticated Supabase user object.
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The user's goal data or an error.
 */
export const getUserGoal = async (
  user: User
): Promise<{ data?: Goal | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle(); // Get only the active goal, there should be at most one

    if (error) {
      console.error("Error fetching user goal:", error);
      throw error;
    }
    return { data };
  } catch (error) {
    return { error };
  }
};

/**
 * `updateGoal`
 * Updates a user's goal.
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} goalId - The ID of the goal to update.
 * @param {UpdateGoalData} updates - An object containing the fields to update.
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The updated goal data or an error.
 */
export const updateGoal = async (
  user: User,
  goalId: string,
  updates: UpdateGoalData
): Promise<{ data?: Goal | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    // Ensure user_id cannot be changed
    const { user_id, ...safeUpdates } = updates as any;

    const { data, error } = await supabase
      .from("goals")
      .update(safeUpdates)
      .eq("id", goalId)
      .eq("user_id", user.id) // Ensure user owns this goal
      .select()
      .single();

    if (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
    return { data };
  } catch (error) {
    return { error };
  }
};

/**
 * `getDailyProgress`
 * Fetches the daily progress for a specific date.
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<{ data?: DailyProgress | null; error?: any }>} The daily progress data or an error.
 */
export const getDailyProgress = async (
  user: User,
  date: string
): Promise<{ data?: DailyProgress | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    const { data, error } = await supabase
      .from("daily_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching daily progress for date ${date}:`, error);
      throw error;
    }
    return { data };
  } catch (error) {
    return { error };
  }
};

/**
 * `getGoalWithProgress`
 * Fetches the user's goal along with progress for a specific date.
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<{ goalData?: Goal | null; progressData?: DailyProgress | null; error?: any }>}
 */
export const getGoalWithProgress = async (
  user: User,
  date: string
): Promise<{
  goalData?: Goal | null;
  progressData?: DailyProgress | null;
  error?: any;
}> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }

  // First get the user's goal
  const { data: goalData, error: goalError } = await getUserGoal(user);

  if (goalError) {
    return { error: goalError };
  }

  // Then get the progress for the specified date
  const { data: progressData, error: progressError } = await getDailyProgress(
    user,
    date
  );

  if (progressError) {
    return { error: progressError };
  }

  return { goalData, progressData };
};

/**
 * `createOrUpdateDailyProgress`
 * Creates or updates the daily progress for a specific date.
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @param {Partial<DailyProgress>} progressData - The progress data to update.
 * @returns {Promise<{ data?: DailyProgress | null; error?: any }>}
 */
export const createOrUpdateDailyProgress = async (
  user: User,
  date: string,
  progressData: Partial<Omit<DailyProgress, "id" | "user_id" | "date">>
): Promise<{ data?: DailyProgress | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }

  try {
    // First check if an entry exists for this date
    const { data: existingProgress } = await getDailyProgress(user, date);

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from("daily_progress")
        .update(progressData)
        .eq("id", existingProgress.id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating daily progress for date ${date}:`, error);
        throw error;
      }
      return { data };
    } else {
      // Get the user's goal ID
      const { data: goalData } = await getUserGoal(user);

      // Create new progress entry
      const { data, error } = await supabase
        .from("daily_progress")
        .insert({
          user_id: user.id,
          date,
          goal_id: goalData?.id || null,
          ...progressData,
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating daily progress for date ${date}:`, error);
        throw error;
      }
      return { data };
    }
  } catch (error) {
    return { error };
  }
};
