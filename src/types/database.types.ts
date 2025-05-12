/**
 * This file contains TypeScript type definitions that correspond to the shape of data
 * in the Supabase database tables. It helps ensure type safety when interacting
 * with data fetched from or sent to the backend.
 */

/**
 * Represents the structure of a goal object as stored in the `goals` table.
 */
export interface Goal {
  id: string; // UUID
  user_id: string; // UUID, Foreign Key to users(id)
  goal_type: string; // e.g., 'steps', 'run_distance_km'
  target_value: number;
  target_unit: string; // e.g., 'steps', 'km'
  date: string; // ISO date string (YYYY-MM-DD)
  status: "pending" | "completed" | "failed" | "skipped";
  apps_to_block?: string[] | null; // Array of app bundle identifiers
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

/**
 * Represents the structure of a user profile object as stored in the `user_profile_and_stats` table.
 * (Copied from UserProfileContext for now, ideally this becomes the single source of truth)
 */
export interface UserProfile {
  user_id: string; // UUID, Foreign Key to users(id)
  coin_balance: number;
  current_streak_length: number;
  username?: string | null; // From public.users table
  // `updated_at` is also in the table but might not always be fetched/used in profile context
}

/**
 * Represents the structure of a daily progress entry as stored in the `daily_progress` table.
 */
export interface DailyProgress {
  id: string; // UUID, Primary Key
  user_id: string; // UUID, Foreign Key to users(id)
  goal_id: string; // UUID, Foreign Key to goals(id)
  date: string; // ISO date string (YYYY-MM-DD)
  progress_data: {
    // JSONB field
    steps_count?: number;
    distance_ran_km?: number;
    // Add other relevant progress metrics as needed
  };
  last_fetched_from_healthkit: string; // ISO timestamp string
  created_at: string; // ISO timestamp string
}

// Add other table types here as your schema grows.
// For example, types for `users`, `daily_progress`, `coin_transactions` etc.
