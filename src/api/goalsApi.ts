import { supabase } from "../lib/supabaseClient";
import { Database } from "../types/database.types"; // Ensure Database is imported
import { User } from "@supabase/supabase-js";

// Define Goal type based on Supabase schema
type Goal = Database["public"]["Tables"]["goals"]["Row"];

/**
 * @file goalsApi.ts
 * Contains functions for interacting with the `goals` table in the Supabase backend.
 * Manages a user's active daily goal.
 */

/**
 * `SetGoalData` type for setting a user's active goal.
 * Omits fields that are auto-generated or derived (id, user_id, is_active, created_at, updated_at).
 */
export type SetGoalData = Omit<
  Goal,
  "id" | "user_id" | "is_active" | "created_at" | "updated_at"
>;

/**
 * `UpdateGoalData` type for updating an existing active goal.
 * Makes most fields optional for partial updates.
 */
export type UpdateGoalData = Partial<
  Omit<Goal, "id" | "user_id" | "is_active" | "created_at" | "updated_at">
>;

/**
 * `setGoal`
 * Sets or replaces the active goal for the currently authenticated user using an RPC call.
 * This function will deactivate any existing active goals for the user and create a new active one.
 * @param {User} user - The authenticated Supabase user object.
 * @param {SetGoalData} goalData - The data for the new active goal.
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The newly set active goal data or an error.
 */
export const setGoal = async (
  user: User,
  goalData: SetGoalData
): Promise<{ data?: Goal | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    const { data, error } = await supabase
      .rpc("set_active_goal", {
        p_user_id: user.id,
        p_goal_type: goalData.goal_type,
        p_target_value: goalData.target_value,
        p_target_unit: goalData.target_unit,
        p_apps_to_block: goalData.apps_to_block,
      })
      .single(); // RPC returns a single record which is the new goal

    if (error) {
      console.error("Error setting active goal via RPC:", error);
      throw error;
    }
    // The RPC function returns a single row which is the new/updated goal.
    // The structure should match the 'goals' table, so casting to Goal should be safe
    // if the RPC's RETURN TABLE definition is correct.
    return { data: data as Goal | null };
  } catch (error) {
    return { error };
  }
};

/**
 * `getActiveGoal`
 * Fetches the currently active goal for the authenticated user.
 * @param {User} user - The authenticated Supabase user object.
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The active goal data or an error.
 */
export const getActiveGoal = async (
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
      .maybeSingle(); // A user might not have an active goal set yet

    if (error) {
      console.error("Error fetching active goal:", error);
      throw error;
    }
    return { data };
  } catch (error) {
    return { error };
  }
};

/**
 * `updateActiveGoal`
 * Updates properties of the currently active goal for the authenticated user.
 * Note: To change the goal fundamentally (e.g. type), consider using `setGoal`.
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} activeGoalId - The ID of the active goal to update.
 * @param {UpdateGoalData} updates - An object containing the fields to update.
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The updated goal data or an error.
 */
export const updateActiveGoal = async (
  user: User,
  activeGoalId: string,
  updates: UpdateGoalData
): Promise<{ data?: Goal | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    // Ensure user_id, is_active etc. are not part of the update payload directly.
    // RLS should enforce that the user can only update their own active goal.
    const { user_id, is_active, ...safeUpdates } = updates as any;

    const { data, error } = await supabase
      .from("goals")
      .update(safeUpdates)
      .eq("id", activeGoalId)
      .eq("user_id", user.id) // Ensure user owns this goal
      .eq("is_active", true) // Ensure it's the active goal they are updating
      .select()
      .single();

    if (error) {
      console.error("Error updating active goal:", error);
      // If the goal was not found or not active (e.g., RLS or .eq("is_active", true) failed)
      // Supabase might return a PostgREST error P0002 (no_data_found) or similar if .single() expects a row.
      if (error.code === "PGRST204") {
        // PGRST204: No rows found for "single" select
        return {
          error: {
            message: "Active goal not found or permission denied.",
            code: "PGRST204",
          },
        };
      }
      throw error;
    }
    return { data };
  } catch (error) {
    return { error };
  }
};

/**
 * `getAllGoalsForUser`
 * Fetches all goals (active and inactive) for the authenticated user,
 * ordered by when they were last updated (most recent first).
 * Useful for a history view.
 * @param {User} user - The authenticated Supabase user object.
 * @returns {Promise<{ data?: Goal[]; error?: any }>} An array of goals or an error.
 */
export const getAllGoalsForUser = async (
  user: User
): Promise<{ data?: Goal[]; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }); // Order by last updated

    if (error) {
      console.error("Error fetching all goals for user:", error);
      throw error;
    }
    return { data: data || [] };
  } catch (error) {
    return { error };
  }
};

/**
 * `deleteGoal`
 * Deletes a specific goal. Typically, users would just set a new active goal
 * rather than deleting, but this function is provided for completeness.
 * If deleting an active goal, the user will be left with no active goal.
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} goalId - The ID of the goal to delete.
 * @returns {Promise<{ data?: { id: string } | null; error?: any }>} Confirmation or an error.
 */
export const deleteGoal = async (
  user: User,
  goalId: string
): Promise<{ data?: { id: string } | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.id); // Ensure user owns the goal

    if (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
    return { data: { id: goalId } }; // Return id of deleted goal on success
  } catch (error) {
    return { error };
  }
};
