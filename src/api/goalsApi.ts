import { supabase } from "../lib/supabaseClient";
import { Goal } from "../types/database.types";
import { User } from "@supabase/supabase-js";

/**
 * @file goalsApi.ts
 * Contains functions for interacting with the `goals` table in the Supabase backend.
 */

/**
 * `CreateGoalData` type for creating a new goal.
 * Omits fields that are auto-generated or should not be set on creation by the client directly (e.g., id, user_id from session, created_at, updated_at, status).
 */
export type CreateGoalData = Omit<
  Goal,
  "id" | "user_id" | "created_at" | "updated_at" | "status"
> & {
  // status can be optionally set on creation, defaulting to 'pending' in DB if not provided
  status?: Goal["status"];
};

/**
 * `UpdateGoalData` type for updating an existing goal.
 * Makes most fields optional for partial updates. `id` is required to identify the goal.
 */
export type UpdateGoalData = Partial<
  Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">
> & {
  // No need to include id here as it's passed as a separate param to update function
};

/**
 * `createGoal`
 * Creates a new goal for the currently authenticated user.
 * @param {User} user - The authenticated Supabase user object.
 * @param {CreateGoalData} goalData - The data for the new goal.
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The created goal data or an error.
 */
export const createGoal = async (
  user: User,
  goalData: CreateGoalData
): Promise<{ data?: Goal | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    const { data, error } = await supabase
      .from("goals")
      .insert([
        {
          ...goalData,
          user_id: user.id, // Set user_id from the authenticated user
          // status will use DB default 'pending' if not in goalData
        },
      ])
      .select()
      .single(); // Assuming we want the created record back

    if (error) {
      console.error("Error creating goal:", error);
      // Check for unique constraint violation (user already has a goal for this date)
      if (
        error.code === "23505" &&
        error.message.includes("unique_user_goal_per_day")
      ) {
        return {
          error: {
            message: "A goal already exists for this date.",
            code: "23505",
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
 * `getGoalByDate`
 * Fetches a specific goal for the authenticated user by date.
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} date - The date of the goal to fetch (YYYY-MM-DD).
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The goal data or an error.
 */
export const getGoalByDate = async (
  user: User,
  date: string // YYYY-MM-DD format
): Promise<{ data?: Goal | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle(); // Use maybeSingle as a goal might not exist for the date

    if (error) {
      console.error("Error fetching goal by date:", error);
      throw error;
    }
    return { data };
  } catch (error) {
    return { error };
  }
};

/**
 * `updateGoal`
 * Updates an existing goal for the authenticated user.
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} goalId - The ID of the goal to update.
 * @param {UpdateGoalData} updates - An object containing the fields to update.
 * @returns {Promise<{ data?: Goal | null; error?: any }>} The updated goal data or an error.
 */
export const updateGoal = async (
  user: User, // For RLS and ensuring user owns the goal, though user_id in updates is ignored by RLS here
  goalId: string,
  updates: UpdateGoalData
): Promise<{ data?: Goal | null; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    // Ensure user_id is not part of the update payload directly if it's already handled by RLS
    // Or, if you wanted to be super sure, you could fetch the goal first to verify ownership
    // before updating, but RLS should cover this.
    const { user_id, ...safeUpdates } = updates as any; // Casting to any to remove user_id if present

    const { data, error } = await supabase
      .from("goals")
      .update(safeUpdates)
      .eq("id", goalId)
      .eq("user_id", user.id) // Double check ownership for update
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
 * `getGoalsForUser` (Example for fetching multiple goals, e.g., for a history view)
 * Fetches all goals for the authenticated user, ordered by date descending.
 * @param {User} user - The authenticated Supabase user object.
 * @returns {Promise<{ data?: Goal[]; error?: any }>} An array of goals or an error.
 */
export const getGoalsForUser = async (
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
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching goals for user:", error);
      throw error;
    }
    return { data: data || [] }; // Ensure data is always an array
  } catch (error) {
    return { error };
  }
};

// Consider adding deleteGoal if needed, following a similar pattern.
