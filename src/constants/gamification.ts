/**
 * @file gamification.ts
 * This file contains constants related to the gamification aspects of the GoalGuard app,
 * such as coin values for rewards, streak bonuses, etc.
 */

/**
 * COINS_FOR_DAILY_GOAL_COMPLETION
 * The number of coins awarded to the user upon successful completion of their daily goal.
 */
export const COINS_FOR_DAILY_GOAL_COMPLETION = 10;

// Add other gamification constants here as needed, for example:
// export const STREAK_BONUS_COINS_PER_DAY = 5;
// export const STREAK_BONUS_THRESHOLD_DAYS = 3;

// Costs for items in the Rewards Store
export const REWARD_COST_SKIP_DAY = 200;
export const REWARD_COST_STREAK_SAVER = 450;
export const REWARD_COST_GOAL_REDUCTION = 100;

// Streak Bonus Constants
export const STREAK_BONUS_COINS_PER_DAY = 5;
export const STREAK_BONUS_THRESHOLD_DAYS = 3; // Streak must be this long or longer to get bonus
