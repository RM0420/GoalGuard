import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers directly to avoid import issues
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or your specific frontend URL for better security
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

// Define types from database.types.ts manually for clarity in function
// In a real setup, you might share these types or generate them for functions too.
interface UserProfileAndStats {
  user_id: string;
  coin_balance: number;
  current_streak_length: number;
  updated_at: string;
}

interface DailyProgress {
  id?: string;
  user_id: string;
  goal_id: string | null; // Goal might not be set, or skipped day has no active goal link initially
  date: string;
  progress_data?: any; // JSONB
  status:
    | "pending"
    | "completed"
    | "missed"
    | "skipped"
    | "failed_streak_saved";
  effective_target_value?: number | null;
  effective_target_unit?: string | null;
  last_fetched_from_healthkit?: string;
}

interface Goal {
  id: string;
  user_id: string;
  goal_type: string;
  target_value: number;
  target_unit: string;
  is_active: boolean;
}

interface UserOwnedReward {
  id: string;
  user_id: string;
  reward_type: string;
  quantity: number;
}

const logCoinTransaction = async (
  supabase: SupabaseClient,
  userId: string,
  coinChange: number,
  type: string,
  description: string,
  relatedGoalId?: string | null
) => {
  const { error } = await supabase.from("coin_transactions").insert({
    user_id: userId,
    coin_change: coinChange,
    type: type,
    description: description,
    related_goal_id: relatedGoalId,
  });
  if (error) {
    console.error(
      `Error logging coin transaction (${type}) for user ${userId}:`,
      error
    );
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // This function should be triggered by a schedule, not a direct request with a body.
  // For Supabase, invocation is via internal mechanisms or a CRON job hitting an endpoint.
  // We'll assume it gets the necessary Supabase service role key for broad access.

  try {
    const supabaseAdminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use Service Role Key for admin tasks
    );

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateString = yesterday.toISOString().split("T")[0];

    console.log(`Daily goal check running for date: ${yesterdayDateString}`);

    const { data: usersWithProfiles, error: fetchUsersError } =
      await supabaseAdminClient
        .from("user_profile_and_stats")
        .select("user_id, current_streak_length, coin_balance");

    if (fetchUsersError) {
      console.error("Error fetching users with profiles:", fetchUsersError);
      return new Response(JSON.stringify({ error: "Failed to fetch users." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!usersWithProfiles || usersWithProfiles.length === 0) {
      console.log("No users with profiles found to process.");
      return new Response(JSON.stringify({ message: "No users to process." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    for (const userProfile of usersWithProfiles as UserProfileAndStats[]) {
      const userId = userProfile.user_id;
      let currentStreak = userProfile.current_streak_length || 0;
      let newCoinBalance = userProfile.coin_balance || 0;
      let goalMet = false;
      let goalSkipped = false;
      let activeGoalForDay: Goal | null = null;

      // 1. Fetch active goal for the user for yesterday
      const { data: activeGoals, error: fetchGoalError } =
        await supabaseAdminClient
          .from("goals")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true) // This assumes only one truly active goal, or picks first
          .limit(1);

      if (fetchGoalError) {
        console.error(
          `Error fetching active goal for user ${userId}:`,
          fetchGoalError
        );
        continue; // Process next user
      }
      activeGoalForDay =
        activeGoals && activeGoals.length > 0 ? (activeGoals[0] as Goal) : null;

      // 2. Fetch daily_progress for yesterday
      let { data: dailyProgressData, error: fetchProgressError } =
        await supabaseAdminClient
          .from("daily_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("date", yesterdayDateString)
          .single();

      let dailyProgressEntry = dailyProgressData as DailyProgress | null;

      if (fetchProgressError && fetchProgressError.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error(
          `Error fetching daily progress for user ${userId}, date ${yesterdayDateString}:`,
          fetchProgressError
        );
        continue; // Process next user
      }

      let finalGoalStatusToday: DailyProgress["status"] =
        dailyProgressEntry?.status || "pending";
      const goalIdToLog = activeGoalForDay?.id || dailyProgressEntry?.goal_id;

      if (dailyProgressEntry?.status === "skipped") {
        goalSkipped = true;
        finalGoalStatusToday = "skipped";
        console.log(
          `User ${userId} skipped goal on ${yesterdayDateString}. Streak maintained at ${currentStreak}.`
        );
      }
      // Assume HealthKit data pushed and evaluated into 'completed' or 'missed' if not 'skipped'/'pending'
      // Or, this function *is* the evaluator.
      // For now, let's assume if it's not skipped, we check completion based on target.
      else if (activeGoalForDay && dailyProgressEntry?.progress_data) {
        // Simplified check: assume progress_data.steps_count vs target_value
        // This needs to be robust based on goal_type and progress_data structure
        const target =
          dailyProgressEntry.effective_target_value ??
          activeGoalForDay.target_value;
        // This is a placeholder for actual progress evaluation logic
        const achieved =
          (dailyProgressEntry.progress_data as any)?.steps_count || 0;

        if (achieved >= target) {
          goalMet = true;
          finalGoalStatusToday = "completed";
        } else {
          goalMet = false; // Explicitly false
          finalGoalStatusToday = "missed";
        }
      } else if (activeGoalForDay && !dailyProgressEntry?.progress_data) {
        // Active goal, but no progress data (and not skipped)
        goalMet = false;
        finalGoalStatusToday = "missed";
        console.log(
          `User ${userId} had active goal but no progress data for ${yesterdayDateString}.`
        );
      } else if (!activeGoalForDay) {
        // No active goal defined for the day, and not explicitly skipped
        // Consider this as neither met nor failed in a way that affects streaks negatively by default,
        // unless specific product decision says otherwise (e.g. must have active goal).
        console.log(
          `User ${userId} had no active goal for ${yesterdayDateString}. No streak action.`
        );
        continue; // Skip streak processing for this user for this day
      }

      // 3. Streak and Reward Logic
      if (goalSkipped) {
        // Streak maintained, no increment
      } else if (goalMet) {
        currentStreak++;
        console.log(
          `User ${userId} met goal on ${yesterdayDateString}. New streak: ${currentStreak}.`
        );
        // Award coins for goal completion (e.g., 10 coins)
        const goalCompletionCoins = 10;
        newCoinBalance += goalCompletionCoins;
        await logCoinTransaction(
          supabaseAdminClient,
          userId,
          goalCompletionCoins,
          "goal_completion_reward",
          `Completed goal on ${yesterdayDateString}`,
          goalIdToLog
        );

        // Streak Bonus (e.g., +5 coins per day after a 3-day streak)
        if (currentStreak >= 3) {
          // Assuming bonus kicks in at 3 days
          const streakBonusCoins = 5;
          newCoinBalance += streakBonusCoins;
          await logCoinTransaction(
            supabaseAdminClient,
            userId,
            streakBonusCoins,
            "streak_bonus",
            `${currentStreak}-day streak bonus on ${yesterdayDateString}`,
            goalIdToLog
          );
        }
      } else {
        // Goal not met and not skipped
        console.log(
          `User ${userId} did NOT meet goal on ${yesterdayDateString}. Current streak: ${currentStreak}.`
        );
        // Try to use Streak Saver
        const { data: streakSavers, error: fetchSaverError } =
          await supabaseAdminClient
            .from("user_owned_rewards")
            .select("id, quantity")
            .eq("user_id", userId)
            .eq("reward_type", "streak_saver")
            .gt("quantity", 0)
            .limit(1);

        if (fetchSaverError) {
          console.error(
            `Error fetching streak saver for user ${userId}:`,
            fetchSaverError
          );
          // Proceed to reset streak if saver check fails
          console.log(
            `Resetting streak for user ${userId} due to missed goal and saver check error.`
          );
          currentStreak = 0;
          finalGoalStatusToday = "missed";
        } else if (streakSavers && streakSavers.length > 0) {
          const saver = streakSavers[0] as UserOwnedReward;
          console.log(
            `User ${userId} using streak saver. Streak maintained at ${currentStreak}.`
          );
          finalGoalStatusToday = "failed_streak_saved";

          // Consume streak saver
          if (saver.quantity === 1) {
            await supabaseAdminClient
              .from("user_owned_rewards")
              .delete()
              .match({ id: saver.id });
          } else {
            await supabaseAdminClient
              .from("user_owned_rewards")
              .update({ quantity: saver.quantity - 1 })
              .match({ id: saver.id });
          }
          // Log its use
          await supabaseAdminClient
            .from("streak_savers_applied")
            .insert({ user_id: userId, date_saved: yesterdayDateString });
          await logCoinTransaction(
            supabaseAdminClient,
            userId,
            0,
            "streak_saver_auto_used",
            `Streak saver automatically used for ${yesterdayDateString}`
          );
        } else {
          console.log(
            `Resetting streak for user ${userId} due to missed goal and no saver.`
          );
          currentStreak = 0;
          finalGoalStatusToday = "missed";
        }
      }

      // 4. Update user_profile_and_stats
      const { error: updateUserProfileError } = await supabaseAdminClient
        .from("user_profile_and_stats")
        .update({
          current_streak_length: currentStreak,
          coin_balance: newCoinBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateUserProfileError) {
        console.error(
          `Error updating user profile for ${userId}:`,
          updateUserProfileError
        );
      }

      // 5. Upsert daily_progress with final status
      if (dailyProgressEntry) {
        const { error: updateProgressError } = await supabaseAdminClient
          .from("daily_progress")
          .update({ status: finalGoalStatusToday })
          .eq("id", dailyProgressEntry.id);
        if (updateProgressError)
          console.error(
            `Error updating daily_progress for user ${userId}: ${updateProgressError.message}`
          );
      } else if (activeGoalForDay || goalSkipped) {
        // Create entry if one didn't exist but should (e.g. goal was active, or explicitly skipped)
        const { error: insertProgressError } = await supabaseAdminClient
          .from("daily_progress")
          .insert({
            user_id: userId,
            goal_id: activeGoalForDay?.id || null,
            date: yesterdayDateString,
            status: finalGoalStatusToday,
          });
        if (insertProgressError)
          console.error(
            `Error inserting daily_progress for user ${userId}: ${insertProgressError.message}`
          );
      }
      console.log(
        `Finished processing for user ${userId}. New streak: ${currentStreak}, New coins: ${newCoinBalance}`
      );
    } // end for loop over users

    console.log("Daily goal check finished successfully.");
    return new Response(
      JSON.stringify({ message: "Daily goal check finished." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in daily-goal-check function:", error);
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
