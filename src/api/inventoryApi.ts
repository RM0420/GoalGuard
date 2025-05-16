import { supabase } from "../lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { UserOwnedReward } from "../types/inventory.types";

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

// TODO: Implement function to use/activate a reward from the inventory
// This might involve:
// 1. Calling an RPC to decrement quantity or delete the item.
// 2. Applying the reward's effect (e.g., marking a goal as skipped, activating a streak saver for the next failure check).
/*
export const useInventoryItem = async (itemId: string, rewardType: ActiveRewardType, quantityToUse: number = 1) => {
  // ... logic to call an RPC e.g., 'use_reward'
  // The RPC would handle decrementing quantity in user_owned_rewards
  // and potentially trigger other game logic based on rewardType
};
*/
