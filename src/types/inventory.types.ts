import { Database } from "./database.types";

/**
 * @type ActiveRewardType
 * Represents the possible types of rewards a user can own, aligning with the `active_reward_type_enum` in the database.
 */
export type ActiveRewardType = "skip_day" | "streak_saver" | "goal_reduction";

/**
 * @interface UserOwnedReward
 * Represents a reward item owned by the user, as stored in the `user_owned_rewards` table.
 */
export interface UserOwnedReward {
  id: string; // UUID
  user_id: string; // UUID, Foreign Key to users(id)
  reward_type: ActiveRewardType;
  quantity: number;
  acquired_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

/**
 * @interface MappedUserOwnedReward
 * A version of UserOwnedReward that can include additional display-friendly properties, like title and description.
 */
export type MappedUserOwnedReward = UserOwnedReward & {
  title: string;
  description: string;
  cost: number;
  icon?: string;
  color?: "primary" | "success" | "warning" | "muted";
};
