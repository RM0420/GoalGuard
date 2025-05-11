import { supabase } from "../lib/supabaseClient";
import { User } from "@supabase/supabase-js";

/**
 * @file userApi.ts
 * This file contains functions for interacting with user-related data in the Supabase backend,
 * specifically the `public.users` and `public.user_profile_and_stats` tables.
 */

/**
 * `updateUsername`
 * Updates the username for a given user in the `public.users` table.
 * Note: This assumes you have a `username` column in your `public.users` table
 * and appropriate RLS policies allowing the authenticated user to update their own record.
 *
 * @param {User} user - The authenticated user object from Supabase Auth.
 * @param {string} newUsername - The new username to set.
 * @returns {Promise<{ success: boolean; error?: any }>} An object indicating success or failure.
 */
export const updateUsername = async (
  user: User,
  newUsername: string
): Promise<{ success: boolean; error?: any }> => {
  if (!user) {
    console.error("User object is required to update username.");
    return { success: false, error: { message: "User not authenticated." } };
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({ username: newUsername })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating username:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * `getUserProfile`
 * Fetches the combined profile data for a given user ID from `public.users`
 * and `public.user_profile_and_stats`.
 * This is similar to what UserProfileContext does but can be used for more direct API calls
 * if needed outside the context, or for fetching other users' public profiles (with RLS permitting).
 *
 * @param {string} userId - The ID of the user whose profile is to be fetched.
 * @returns {Promise<{ data?: any; error?: any }>} The user profile data or an error.
 */
export const getUserProfile = async (
  userId: string
): Promise<{ data?: any; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from("users") // Start with users table to get username
      .select(
        `
        id,
        username,
        user_profile_and_stats (
          coin_balance,
          current_streak_length
        )
      `
      )
      .eq("id", userId)
      .single(); // Assuming one-to-one relationship based on primary key

    if (error && error.code !== "PGRST116") {
      // PGRST116: row not found
      console.error("Error fetching user profile:", error);
      throw error;
    }

    // The result from Supabase with a join like this will nest user_profile_and_stats.
    // We can destructure it to match the UserProfile interface more closely if needed,
    // or the calling component can handle the nested structure.
    // For now, returning the Supabase structure directly.
    return { data, error: error?.code === "PGRST116" ? null : error }; // Treat 'not found' as null data, not an error for the caller
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return { error };
  }
};

// Add other user-related API functions here as the app grows:
// - مثلاً: function to update specific profile settings
// - مثلاً: function to fetch public profile of another user (if feature exists)
