import { supabase } from "../lib/supabaseClient";
import { User } from "@supabase/supabase-js";

/**
 * @interface PurchaseRewardResponse
 * Defines the expected response structure from the `purchase_reward` RPC.
 */
export interface PurchaseRewardResponse {
  success: boolean;
  new_balance?: number;
  message: string;
}

/**
 * `callPurchaseRewardRPC`
 * Calls the Supabase RPC function to process a reward purchase.
 *
 * @param {User} user - The authenticated Supabase user object.
 * @param {string} rewardType - The type of reward being purchased (e.g., 'skip_day').
 * @param {number} coinCost - The cost of the reward in coins.
 * @param {string} rewardDescription - A human-readable description for the transaction log.
 * @param {object | null} [rewardDetails=null] - Optional JSONB details about the reward.
 * @returns {Promise<PurchaseRewardResponse>} The result of the purchase attempt.
 */
export const callPurchaseRewardRPC = async (
  user: User,
  rewardType: string,
  coinCost: number,
  rewardDescription: string,
  rewardDetails: object | null = null
): Promise<PurchaseRewardResponse> => {
  if (!user) {
    return {
      success: false,
      message: "User not authenticated for purchase.",
    };
  }

  try {
    const { data, error } = await supabase.rpc("purchase_reward", {
      user_id_input: user.id,
      reward_type_input: rewardType,
      coin_cost_input: coinCost,
      reward_description_input: rewardDescription,
      reward_details_input: rewardDetails,
    });

    if (error) {
      console.error("Error calling purchase_reward RPC:", error);
      return {
        success: false,
        message: error.message || "Failed to call purchase_reward RPC.",
      };
    }

    // The data returned from RPC is the JSONB object directly
    // For type safety, we assert the structure based on PurchaseRewardResponse
    // but ensure it has at least success and message fields.
    const response = data as PurchaseRewardResponse;
    if (
      typeof response.success !== "boolean" ||
      typeof response.message !== "string"
    ) {
      console.error(
        "Invalid response structure from purchase_reward RPC:",
        response
      );
      return {
        success: false,
        message: "Invalid response from server processing purchase.",
      };
    }

    return response;
  } catch (err) {
    console.error("Unexpected error calling purchase_reward RPC:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return {
      success: false,
      message,
    };
  }
};
