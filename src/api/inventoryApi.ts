import { supabase } from "../lib/supabaseClient";
import { Database } from "../types/database.types";
import { User } from "@supabase/supabase-js";

// Define UserOwnedReward type based on CONTEXT.MD schema (section 8.6)
// This is a workaround if Database["public"]["Tables"]["user_owned_rewards"]["Row"] is incorrect
export type UserOwnedReward = {
  id: string; // UUID
  user_id: string; // UUID
  reward_type: "skip_day" | "streak_saver" | "goal_reduction"; // ENUM
  quantity: number; // INTEGER
  acquired_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
};

/**
 * @file inventoryApi.ts
 * Contains functions for interacting with the `user_owned_rewards` table in the Supabase backend.
 */

/**
 * @interface FetchInventoryResponse
 * Defines the response structure for fetching the user's inventory.
 */
export interface FetchInventoryResponse {
  success: boolean;
  data?: UserOwnedReward[];
  error?: string;
}

/**
 * `fetchUserInventory`
 * Fetches all owned rewards for the currently authenticated user.
 *
 * @returns {Promise<FetchInventoryResponse>} The user's inventory items or an error.
 */
export const fetchUserInventory = async (): Promise<FetchInventoryResponse> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error fetching user for inventory:", userError);
    return {
      success: false,
      error: userError?.message || "User not authenticated.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("user_owned_rewards")
      .select("*")
      .eq("user_id", user.id)
      .order("acquired_at", { ascending: false });

    if (error) {
      console.error("Error fetching user inventory:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as UserOwnedReward[] }; // Type assertion
  } catch (err) {
    console.error("Unexpected error fetching user inventory:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
};

// Type for the reward types that can be actively used by the user from inventory
export type ActiveRewardType = "skip_day" | "goal_reduction";

/**
 * @interface UseRewardPayload
 * Defines the payload for the useReward API call.
 */
export interface UseRewardPayload {
  reward_type: ActiveRewardType;
}

/**
 * @interface UseRewardResponse
 * Defines the response structure for using a reward.
 */
export interface UseRewardResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * `useInventoryItem`
 * Calls the 'use-reward' Supabase Edge Function to use an inventory item.
 *
 * @param {UseRewardPayload} payload - The details of the reward to use.
 * @returns {Promise<UseRewardResponse>} The result of the operation.
 */
export const useInventoryItem = async (
  payload: UseRewardPayload
): Promise<UseRewardResponse> => {
  const { error: functionError, data: functionData } =
    await supabase.functions.invoke(
      "use-reward", // Name of the Edge Function
      {
        body: payload,
        // method: 'POST', // Supabase client defaults to POST for invoke
      }
    );

  if (functionError) {
    console.error("Error invoking use-reward function:", functionError);
    return {
      success: false,
      error: functionError.message || "Failed to invoke use-reward function.",
    };
  }

  // Assuming the Edge Function returns a JSON with a message or error property
  const responseData = functionData as { message?: string; error?: string };

  if (responseData?.error) {
    console.error("Error from use-reward function:", responseData.error);
    return { success: false, error: responseData.error };
  }

  return {
    success: true,
    message: responseData?.message || "Reward used successfully.",
  };
};

/**
 * `getOwnedRewards`
 * Fetches all rewards currently owned by the authenticated user.
 * @param {User} user - The authenticated Supabase user object.
 * @returns {Promise<{ data?: UserOwnedReward[]; error?: any }>} An array of owned rewards or an error.
 */
export const getOwnedRewards = async (
  user: User
): Promise<{ data?: UserOwnedReward[]; error?: any }> => {
  if (!user) {
    return { error: { message: "User not authenticated." } };
  }
  try {
    const { data, error } = await supabase
      .from("user_owned_rewards")
      .select("*") // Select all fields
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching owned rewards:", error);
      throw error;
    }
    // Cast to UserOwnedReward[] to ensure the frontend gets the expected shape
    return { data: (data as UserOwnedReward[]) || [] };
  } catch (error) {
    return { error };
  }
};

// TODO: Add functions for purchasing rewards (if not handled by an Edge Function directly invoked from UI)
// and using rewards (though 'use-reward' Edge Function seems to be the primary way to consume them).
