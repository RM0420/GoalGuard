import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { User } from "@supabase/supabase-js";
import * as userApi from "../api/userApi";
import {
  COINS_FOR_DAILY_GOAL_COMPLETION,
  STREAK_BONUS_COINS_PER_DAY,
  STREAK_BONUS_THRESHOLD_DAYS,
} from "../constants/gamification";

/**
 * @interface UserProfile
 * Defines the shape of the user's profile data.
 */
export interface UserProfile {
  user_id: string;
  coin_balance: number;
  current_streak_length: number;
  username?: string | null; // From public.users table
  // Add other fields from user_profile_and_stats or users table as needed
}

/**
 * @interface UserProfileContextType
 * Defines the shape of the UserProfileContext.
 */
interface UserProfileContextType {
  profile: UserProfile | null;
  loadingProfile: boolean;
  fetchUserProfile: (currentUser: User) => Promise<void>;
  refreshUserProfile: () => Promise<void>; // To re-fetch after updates
  awardCoinsForGoalCompletion: (
    userId: string,
    goalId: string
  ) => Promise<boolean>;
  processStreakUpdateAndBonus: (
    userId: string,
    goalDate: string,
    goalId: string
  ) => Promise<boolean>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

/**
 * @interface UserProfileProviderProps
 * Defines props for UserProfileProvider.
 */
interface UserProfileProviderProps {
  children: ReactNode;
}

/**
 * `UserProfileProvider` fetches and manages the user's profile data.
 * It relies on `AuthContext` to get the current authenticated user.
 * @param {UserProfileProviderProps} props - The props for the component.
 * @returns {JSX.Element} The provider component.
 */
export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({
  children,
}) => {
  const { user, session } = useAuth(); // Get user from AuthContext
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  /**
   * Fetches the user profile data from Supabase `user_profile_and_stats` and `users` table.
   * It expects the `currentUser` object from `AuthContext`.
   * @param {User} currentUser - The authenticated user object from Supabase.
   */
  const fetchUserProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    try {
      // Fetch from user_profile_and_stats
      const { data: profileStats, error: profileStatsError } = await supabase
        .from("user_profile_and_stats")
        .select("coin_balance, current_streak_length")
        .eq("user_id", currentUser.id)
        .single();

      if (profileStatsError && profileStatsError.code !== "PGRST116") {
        // PGRST116: row not found
        // If the error is NOT "row not found", then it's a real error
        console.error("Error fetching user profile stats:", profileStatsError);
        throw profileStatsError;
      }

      // Fetch username from public.users table
      const { data: publicUser, error: publicUserError } = await supabase
        .from("users")
        .select("username")
        .eq("id", currentUser.id)
        .single();

      if (publicUserError && publicUserError.code !== "PGRST116") {
        console.error("Error fetching public user data:", publicUserError);
        throw publicUserError;
      }

      if (profileStats) {
        // If profileStats exists, construct the profile
        setProfile({
          user_id: currentUser.id,
          coin_balance: profileStats.coin_balance,
          current_streak_length: profileStats.current_streak_length,
          username: publicUser?.username,
        });
      } else {
        // This case should ideally be handled by the trigger that creates a profile on sign-up.
        // If trigger didn't run or this is an old user, profile might be null.
        console.warn("User profile stats not found for user:", currentUser.id);
        // We can set a default or partial profile, or leave it null
        setProfile({
          user_id: currentUser.id,
          coin_balance: 0, // Default value
          current_streak_length: 0, // Default value
          username: publicUser?.username,
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile logic:", error);
      setProfile(null); // Set profile to null on error
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  /**
   * Effect to fetch user profile when the authenticated user changes or session is available.
   */
  useEffect(() => {
    if (user && session) {
      // Check for session as well, indicating auth is fully resolved
      fetchUserProfile(user);
    }
    if (!session) {
      // If user logs out (no session)
      setProfile(null);
      setLoadingProfile(false);
    }
  }, [user, session, fetchUserProfile]);

  /**
   * `refreshUserProfile` allows components to trigger a re-fetch of the profile data.
   * Useful after an update operation (e.g., spending coins, completing a goal).
   */
  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  }, [user, fetchUserProfile]);

  /**
   * `awardCoinsForGoalCompletion` awards a predefined number of coins to the user
   * for completing their daily goal.
   * @param {string} userId - The ID of the user to award coins to.
   * @param {string} goalId - The ID of the goal associated with the completion.
   * @returns {Promise<boolean>} True if coins were awarded successfully, false otherwise.
   */
  const awardCoinsForGoalCompletion = useCallback(
    async (userId: string, goalId: string): Promise<boolean> => {
      if (!userId || !goalId) {
        console.error(
          "awardCoinsForGoalCompletion: userId and goalId are required."
        );
        return false;
      }
      try {
        const { success, error } = await userApi.awardCoins(
          userId,
          COINS_FOR_DAILY_GOAL_COMPLETION,
          "goal_completion_reward",
          `Awarded for completing daily goal.`,
          goalId
        );
        if (success) {
          console.log(
            `Base coins API call successful for user \${userId} for goal \${goalId}.`
          );
          return true;
        } else {
          console.error(
            "Failed to award base coins for goal completion:",
            error || "Unknown error from userApi.awardCoins"
          );
          return false;
        }
      } catch (apiError) {
        console.error(
          "Exception in awardCoinsForGoalCompletion (base coins only):",
          apiError
        );
        return false;
      }
    },
    []
  );

  /**
   * `processStreakUpdateAndBonus` calls the API to update the user's streak and award bonus coins if applicable.
   * It then refreshes the user profile to reflect any changes in streak length or coin balance.
   * @param {string} userId - The ID of the user.
   * @param {string} goalDate - The date of the completed goal (YYYY-MM-DD).
   * @param {string} goalId - The ID of the goal associated with the completion.
   * @returns {Promise<boolean>} True if streak processing was successful (even if no bonus was awarded), false on error.
   */
  const processStreakUpdateAndBonus = useCallback(
    async (
      userId: string,
      goalDate: string,
      goalId: string
    ): Promise<boolean> => {
      if (!userId || !goalDate || !goalId) {
        console.error(
          "processStreakUpdateAndBonus: userId, goalDate, and goalId are required."
        );
        return false;
      }
      try {
        const { newStreakLength, error } =
          await userApi.updateStreakAndAwardBonus(
            userId,
            goalDate,
            goalId,
            STREAK_BONUS_THRESHOLD_DAYS,
            STREAK_BONUS_COINS_PER_DAY
          );

        if (error) {
          console.error("Failed to process streak update and bonus:", error);
          // Don't necessarily refresh if this specific part fails, as base coins might have been awarded.
          // Or, decide if a refresh is always wanted.
          return false;
        }

        console.log(
          `Streak updated for user \${userId}. New streak: \${newStreakLength}. Bonus coins may have been awarded if threshold met.`
        );
        // Crucially, refresh the profile to get updated streak AND any bonus coins.
        await refreshUserProfile();
        return true;
      } catch (apiError) {
        console.error("Exception in processStreakUpdateAndBonus:", apiError);
        return false;
      }
    },
    [refreshUserProfile]
  );

  const value = {
    profile,
    loadingProfile,
    fetchUserProfile,
    refreshUserProfile,
    awardCoinsForGoalCompletion,
    processStreakUpdateAndBonus,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

/**
 * `useUserProfile` is a custom hook to easily access the `UserProfileContext`.
 * Throws an error if used outside of a `UserProfileProvider`.
 * @returns {UserProfileContextType} The user profile context.
 */
export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
