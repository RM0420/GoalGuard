import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Define CORS headers inline to avoid import issues
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or your specific frontend URL for better security
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

// Define the expected request body structure
interface UseRewardRequestBody {
  reward_type: "skip_day" | "goal_reduction";
  // date_to_save is removed as streak_saver is no longer actively used here
}

// Define a more specific type for reward details if needed, matching enums.ts eventually
// For now, using the string literal union type from UseRewardRequestBody.

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const requestBody: UseRewardRequestBody = await req.json();
    const { reward_type } = requestBody; // date_to_save removed

    if (
      !reward_type ||
      !["skip_day", "goal_reduction"].includes(reward_type) // streak_saver removed from validation
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid reward_type specified" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Removed validation for date_to_save as streak_saver case is removed

    // 1. Fetch and decrement the reward from user_owned_rewards
    const { data: ownedReward, error: fetchError } = await supabaseClient
      .from("user_owned_rewards")
      .select("id, quantity") // Ensure quantity is selected
      .eq("user_id", user.id)
      .eq("reward_type", reward_type)
      .single();

    if (fetchError || !ownedReward) {
      return new Response(
        JSON.stringify({ error: "Reward not found or user does not own it." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    if (ownedReward.quantity <= 0) {
      return new Response(
        JSON.stringify({ error: "Reward quantity is zero." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Decrement or delete logic
    let updateInventoryError = null;
    if (ownedReward.quantity === 1) {
      const { error } = await supabaseClient
        .from("user_owned_rewards")
        .delete()
        .match({ id: ownedReward.id });
      updateInventoryError = error;
    } else {
      const { error } = await supabaseClient
        .from("user_owned_rewards")
        .update({ quantity: ownedReward.quantity - 1 })
        .match({ id: ownedReward.id });
      updateInventoryError = error;
    }

    if (updateInventoryError) {
      console.error("Error updating inventory:", updateInventoryError);
      // Attempt to roll back inventory change (best effort without full transaction) - This line might be problematic if the original quantity isn't readily available.
      // For simplicity, the rollback attempt is removed here. Proper transaction handling or a compensating transaction would be more robust.
      return new Response(
        JSON.stringify({ error: "Failed to update inventory." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // 2. Apply reward effect
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    switch (reward_type) {
      case "skip_day": {
        // Fetch the active goal ID to associate with this skip
        const { data: activeGoal, error: fetchGoalError } = await supabaseClient
          .from("goals")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (fetchGoalError) {
          console.error(
            "Error fetching active goal for skip day:",
            fetchGoalError
          );
          // Continue with the skip even if we can't associate a goal_id
        }

        const { error: skipError } = await supabaseClient
          .from("daily_progress")
          .upsert(
            {
              user_id: user.id,
              date: today,
              status: "skipped",
              goal_id: activeGoal?.id || null, // Use the goal ID if available, otherwise null
            },
            { onConflict: "user_id,date" }
          );
        if (skipError) {
          console.error("Error applying skip_day:", skipError);
          // Attempt to roll back inventory change (best effort)
          await supabaseClient
            .from("user_owned_rewards")
            .update({ quantity: ownedReward.quantity })
            .match({ id: ownedReward.id });
          return new Response(
            JSON.stringify({ error: "Failed to apply skip_day effect." }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
        break;
      }
      // STREAK_SAVER case is removed
      case "goal_reduction": {
        const { data: activeGoal, error: fetchGoalError } = await supabaseClient
          .from("goals")
          .select("id, target_value, target_unit")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (
          fetchGoalError ||
          !activeGoal ||
          typeof activeGoal.target_value !== "number"
        ) {
          console.error(
            "Error fetching active goal for reduction or invalid target_value:",
            fetchGoalError
          );
          await supabaseClient
            .from("user_owned_rewards")
            .update({ quantity: ownedReward.quantity })
            .match({ id: ownedReward.id });
          return new Response(
            JSON.stringify({
              error:
                "Could not find active goal or invalid target value to reduce.",
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
            }
          );
        }

        const reducedTarget = Math.max(
          0,
          Math.floor(activeGoal.target_value * 0.75) // Changed to 25% reduction
        );

        const { error: reduceError } = await supabaseClient
          .from("daily_progress")
          .upsert(
            {
              user_id: user.id,
              date: today,
              goal_id: activeGoal.id,
              effective_target_value: reducedTarget,
              effective_target_unit: activeGoal.target_unit,
              status: "pending", // Or current status if one exists
            },
            { onConflict: "user_id,date" }
          );

        if (reduceError) {
          console.error("Error applying goal_reduction:", reduceError);
          await supabaseClient
            .from("user_owned_rewards")
            .update({ quantity: ownedReward.quantity })
            .match({ id: ownedReward.id });
          return new Response(
            JSON.stringify({ error: "Failed to apply goal_reduction effect." }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
        break;
      }
      default:
        // This case should ideally not be reached if validation is correct.
        return new Response(
          JSON.stringify({ error: "Unknown or unsupported reward type." }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
    }

    return new Response(
      JSON.stringify({ message: `Reward '${reward_type}' used successfully.` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unexpected error in use-reward function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
