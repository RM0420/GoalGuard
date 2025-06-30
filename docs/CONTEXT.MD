# GoalGaurd - A Daily Goal Tracker App - Project Requirements Document

## 1. Introduction

The GoalGuard App is an iOS application designed to help users set and achieve daily physical goals—such as reaching 10,000 steps or running a specific distance—while motivating them through a gamified experience. If users do not complete their daily goal, pre-selected apps on their iOS device will be blocked using the Screen Time API until the goal is met. Conversely, users earn rewards and virtual currency (coins) for meeting their goals, building streaks, and tackling bonus challenges. The app leverages HealthKit for automated progress tracking and uses Supabase for backend services.

With the updated tech stack, the app is developed using **React Native with TypeScript, Expo, and Expo Router** for the frontend and **React Native Paper** for UI components. This stack supports a cross-platform approach, though initial focus remains on iOS with deep integrations via native modules when required.

---

## 2. Features

### 2.1 User Authentication

- **Description:** Users sign up and log in securely to access their personalized experience.
- **Details:**
  - Authentication is handled using **Supabase Auth** integrated with React Native.
  - Each user is assigned a unique ID linking their app data to backend records in Supabase.
- **Key Screens/Components:**
  - **Login/Registration:** Using Supabase Auth for secure authentication.
  - **Dashboard:** Displays current goal status, progress (from HealthKit), streak, and coin balance.

### 2.2 Goal Setting

- **Description:** Users define a single daily physical goal (e.g., 10,000 steps, run 5 kilometers) to complete by the end of each day.
- **Details:**
  - A simple, intuitive UI (built with React Native Paper) allows users to input their daily goal.
  - Only physical goals are supported at launch.
  - Users set a daily physical goal that persists day-to-day. They can modify this goal at any time, and the new goal will become their active daily target.
  - Users can select which apps to block via the Screen Time API if the goal is not met.

### 2.3 Progress Tracking

- **Description:** The app monitors progress toward the daily physical goal using HealthKit.
- **Details:**
  - Integration with **HealthKit** is achieved through a combination of Expo modules and custom native modules as necessary.
  - HealthKit permissions are requested upon first use.
  - Real-time progress data (steps, running distance) is displayed on the dashboard.

### 2.4 Blocking Mechanism

- **Description:** If a user fails to meet their daily goal by midnight, the app blocks pre-selected applications on their iOS device the following day until the goal is achieved.
- **Details:**
  - The **Screen Time API** (available on iOS 12+) is used to enforce app blocking.
  - Blocking is activated at 12:00 AM if the previous day's goal is unmet and is lifted once the current day's goal is completed.
  - The app provides clear instructions for users to grant the necessary Screen Time permissions.

### 2.5 Gamification

- **Description:** A gamified system motivates users with rewards, streaks, and (future) social features.
- **Details:**
  - **Currency System:**
    - Users earn coins for completing daily goals (e.g., 10 coins per day).
    - **Streak Bonus:** Additional coins (e.g., +5 coins per day after a 3-day streak).
  - **Rewards Store:**
    - Users can spend coins to purchase various rewards. Purchased rewards are added to their inventory for later use.
    - **Skip Day:** 200 coins – Skip the current day's goal. The goal is marked as 'skipped', the user's streak is maintained (it neither increments nor resets). This item is actively used by the user from their inventory.
    - **Streak Saver:** 450 coins – Passively protects a user's streak. If a user fails to meet their daily goal and would normally lose their streak, this item is automatically consumed in the background. The streak is maintained for that instance (it neither increments nor resets), and the 'Streak Saver' item is removed from inventory. Only one 'Streak Saver' can be used per potential streak break.
    - **Goal Reduction:** 100 coins – Temporarily lowers the daily goal target for the current day by 25% when actively used by the user from their inventory. Goal reductions can be stacked
  - **User Inventory:** Users can view their purchased and currently held rewards (e.g., "Skip Day" items) in a dedicated inventory section. Items like "Skip Day" and "Goal Reduction" can be activated or used at a later time. "Streak Saver" items are passive and consumed automatically.
  - **Bonus Challenges:**
    - Randomly triggered challenges (e.g., "Run 7 km instead of 5 km") awarding extra coins (e.g., +20 coins).
  - **Future Social Features:**
    - A friend system to compare streaks and a leaderboard for competitive motivation.
- **Key Screens/Components:**
  - **Login/Registration:** Using Supabase Auth for secure authentication.
  - **Dashboard:** Displays current goal status, progress (from HealthKit), streak, and coin balance.
  - **Goal Setting:** Interface for defining daily goals and selecting apps to block.
  - **Progress Tracking:** Visual representation of HealthKit data.
  - **Rewards Store:** UI for purchasing rewards with coins.
  - **Inventory Screen:** Displays rewards currently owned by the user.
  - **Screen Time Setup:** Instructions to help users grant the required permissions.

---

## 3. Technical Architecture

### 3.1 Frontend

- **Technology:**
  - **React Native with TypeScript** for robust, type-safe cross-platform development.
  - **Expo & Expo Router** streamline project setup, development, and over-the-air updates.
- **UI Framework:**
  - **React Native Paper** provides consistent Material Design-based components that can be customized to achieve a polished UI.
- **Key Screens/Components:**
  - **Login/Registration:** Using Supabase Auth for secure authentication.
  - **Dashboard:** Displays current goal status, progress (from HealthKit), streak, and coin balance.
  - **Goal Setting:** Interface for defining daily goals and selecting apps to block.
  - **Progress Tracking:** Visual representation of HealthKit data.
  - **Rewards Store:** UI for purchasing rewards with coins.
  - **Inventory Screen:** Displays rewards currently owned by the user.
  - **Screen Time Setup:** Instructions to help users grant the required permissions.

### 3.2 Authentication

- **Technology:** Supabase Auth integrated into the React Native environment.
- **Details:**
  - Supabase Auth manages user registration, login, and session management.
  - A unique user ID is generated by Supabase Auth and is directly available for all data-related operations within Supabase.

### 3.3 Database

- **Technology:** Supabase (PostgreSQL)
- **Schema:**
  - **Users:**
    - Fields: ID (from Supabase Auth `auth.users` table, usually `uuid`), username, email, etc.
  - **Goals:**
    - Fields: User ID, goal type (e.g., steps), target (e.g., 10,000), date, and status (completed/pending).
  - **Progress:**
    - Fields: User ID, date, and progress data (e.g., steps, running distance).
  - **Rewards/Transactions:**
    - Fields: User ID, coin balance, records of reward redemptions, and bonus challenge outcomes.
  - **Streaks:**
    - Fields: User ID and current streak length.
  - **Friends:** (For future social features)
    - Fields: User ID and friend IDs.
- **Security:**
  - **Row Level Security (RLS):** Ensures each user only accesses their own data.
  - Data encryption in transit and at rest.

### 3.4 Backend Logic

- **Technology:** Supabase Edge Functions (serverless)
- **Core Functions:**
  - **Goal Validation:**
    - Validates if the daily physical goal is met using HealthKit data.
  - **Blocking Status:**
    - A scheduled Edge Function (`daily-goal-check`) runs at 12:00 AM to check the previous day's goal status.
    - It determines if the goal was completed, skipped (via 'Skip Day' reward), or failed.
    - If failed, it checks for an available 'Streak Saver' reward. If present, the saver is consumed, and the streak is maintained. Otherwise, the streak resets.
    - It updates the user's streak length and coin balance (awarding coins for completion and streak bonuses).
    - If the goal was ultimately unmet (failed and not saved by a streak saver), it triggers the Screen Time API to block selected apps.
  - **Reward Updates:**
    - The `use-reward` Edge Function processes direct reward redemptions initiated by the user (e.g., 'Skip Day', 'Goal Reduction'), updating inventory and applying immediate effects like modifying `daily_progress`.
    - The `daily-goal-check` Edge Function handles automatic consumption of 'Streak Saver' rewards, calculates coin earnings for goal completions and streak bonuses, and updates user streaks and coin balances accordingly. It logs all relevant transactions.
  - **Friend System:**
    - (Future feature) Manages friend requests and streak comparisons.

### 3.5 Data Flow

1. **User Authentication:**
   - Users register or log in via Supabase Auth; a unique user ID is available within the Supabase session.
2. **Goal Setting:**
   - Users define their persistent daily physical goal and choose apps to block. This goal remains active until explicitly changed.
   - Goal data, including its active status, is stored in Supabase.
3. **Progress Tracking:**
   - HealthKit collects physical activity data.
   - Data is sent to Supabase for real-time progress display and validation.
4. **Daily Check at 12:00 AM:**
   - An Edge Function checks if the previous day's daily target (based on the user's active persistent goal) was met.
   - If the goal is unmet, the Screen Time API is activated to block the chosen apps.
5. **Gamification:**
   - Upon successful goal completion, coins are awarded and streaks are updated.
   - Reward redemptions and bonus challenges are processed via Edge Functions.

---

## 4. Development Plan

### 4.1 Milestones & Step-by-Step Instructions

#### Step 1: Authentication & User Profiles

1. **Set Up Supabase Auth Integration:**
   - Integrate Supabase Auth into your React Native project.
   - Develop login and registration screens using Expo Router.
   - Ensure unique user IDs from Supabase Auth are correctly utilized within the application and for Supabase database interactions.
2. **Implement Basic User Profile Management:**
   - Create a dashboard that displays user profile data.
   - Store user profiles in Supabase with RLS enabled.

#### Step 2: Goal Setting & HealthKit Integration

1. **Design the Goal Setting UI:**
   - Build a simple interface using React Native Paper for goal input.
   - Enable users to select apps for blocking via a clear, guided UI.
2. **Integrate HealthKit:**
   - Use Expo and custom native modules to request HealthKit permissions and retrieve physical activity data.
   - Display real-time progress (steps, distance) on the dashboard.
3. **Store Goals in Supabase:**
   - Create a Goals table in Supabase.
   - Develop endpoints to save and update goal data.

#### Step 3: Blocking Mechanism (Screen Time API)

1. **Set Up Screen Time API Integration:**
   - Guide users through the process of granting Screen Time permissions.
   - Develop a UI flow explaining how the app blocking mechanism functions.
2. **Develop the Blocking Logic:**
   - Implement a Supabase Edge Function scheduled to run at 12:00 AM.
   - Validate the previous day's goal and trigger the Screen Time API if the goal was unmet.
3. **Test the Blocking Mechanism:**
   - Verify that blocking activates correctly and lifts when the current day's goal is met.

#### Step 4: Gamification (Coins, Rewards, Bonus Challenges)

1. **Implement the Currency System:**
   - Define coin earnings for goal completions and streak bonuses.
   - Update the user's coin balance upon successful goal completion.
2. **Develop the Rewards Store:**
   - Use React Native Paper to create a rewards UI displaying:
     - **Skip Day (200 coins)**
     - **Streak Saver (450 coins)**
     - **Goal Reduction (100 coins)**
   - Process reward purchases and update streak data in Supabase.
3. **Create Bonus Challenge Logic:**
   - Randomly trigger bonus challenges and process extra coin awards.

#### Step 5: Future Enhancements (Friend System & Social Features)

1. **Plan the Friend System Architecture:**
   - Design database tables for managing friend connections and streak comparisons.
   - Develop endpoints for friend requests and updates.
2. **Build Social UI Elements:**
   - Create screens for viewing friend streaks and (in future) leaderboards.
   - Integrate these features once core functionalities are stable.

#### Step 6: Testing & Refinement

1. **Unit and Integration Testing:**
   - Write tests for authentication, goal validation, reward logic, and HealthKit data integration.
   - Ensure cross-platform consistency using Expo's debugging tools.
2. **User Acceptance Testing:**
   - Test the complete flow, including Screen Time permission flows and native integrations.
3. **Bug Fixes and Refinements:**
   - Address any issues and optimize UI/UX performance.

---

## 5. Assumptions & Dependencies

- **HealthKit:**
  - Users must grant permission for HealthKit access to track physical activity.
- **Screen Time API:**
  - Users must provide the necessary permissions; the app will include guided setup instructions.
- **iOS Version:**
  - The app supports iOS 12 and above.
- **Physical Goals Only:**
  - The initial release supports physical goals exclusively.

---

## 6. Future Considerations

- **Leaderboard:**
  - Develop a global or friend-based leaderboard for competitive streak tracking.
- **Non-Physical Goals:**
  - Expand functionality to include additional goal types (e.g., study time) via manual inputs or other integrations.
- **Enhanced Social Features:**
  - Further develop the friend system, including messaging and shared challenges.
- **Desktop Integration:**
  - Evaluate companion apps for desktop environments (beyond the initial scope).

---

## 7. Conclusion

The Daily Goal Tracker App, built using React Native with TypeScript, Expo, and React Native Paper, offers a robust and flexible platform for achieving daily physical goals. By integrating HealthKit for activity tracking and the Screen Time API for enforcing accountability, the app delivers a seamless and engaging user experience. The gamification system—with coins, streaks, and reward redemptions—ensures that users remain motivated. With a clear step-by-step development plan and defined milestones, this project is designed to be both impactful and scalable, laying the groundwork for future enhancements and cross-platform expansion.

---

## 8. Detailed Database Schema (Supabase/PostgreSQL)

This schema expands on the information in section 3.3, providing more detail on table structures, types, and relationships.

### 8.1 `users` Table

Stores basic user information, primarily linking to Supabase Auth. This table can be used for public user profiles or additional app-specific user data not suitable for `auth.user_metadata` or `auth.app_metadata`.

- `id`: `UUID` (Primary Key, Foreign Key to `auth.users(id)` ON DELETE CASCADE)
- `username`: `TEXT` (Optional, if storing username separate from Supabase Auth profile)
- `email`: `TEXT` (Optional, if storing email separate from Supabase Auth profile)
- `created_at`: `TIMESTAMPTZ` (Default: `NOW()`)

### 8.2 `user_profile_and_stats` Table

Stores app-specific user data, including gamification elements.

- `user_id`: `UUID` (Primary Key, Foreign Key to `users(id)` ON DELETE CASCADE)
- `coin_balance`: `INTEGER` (Default: 0) - Current number of coins the user has.
- `current_streak_length`: `INTEGER` (Default: 0) - Number of consecutive days the user has met their goal.
- `updated_at`: `TIMESTAMPTZ` (Default: `NOW()`) - Last time this record was updated.

### 8.3 `goals` Table

Stores information about the daily goals set by users.

- `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
- `user_id`: `UUID` (Foreign Key to `users(id)` ON DELETE CASCADE)
- `goal_type`: `TEXT` (e.g., 'steps', 'run_distance') - Type of physical activity.
- `target_value`: `INTEGER` - The numeric target for the goal (e.g., 10000 for steps).
- `target_unit`: `TEXT` (e.g., 'steps', 'km') - Unit for the target value.
- `apps_to_block`: `JSONB` (Array of strings, e.g., `["com.instagram.ios", "com.facebook.Facebook"]`) - List of app bundle identifiers to be blocked if the goal is not met.
- `is_active`: `BOOLEAN` (Default: `true`) - Indicates if this is the user's current active goal.
- `created_at`: `TIMESTAMPTZ` (Default: `NOW()`)
- `updated_at`: `TIMESTAMPTZ` (Default: `NOW()`)
- **Constraint**: A user can only have one active goal. This can be enforced by application logic or a partial unique index (e.g., in PostgreSQL: `CREATE UNIQUE INDEX one_active_goal_per_user ON goals (user_id) WHERE is_active IS TRUE;`). When a new goal is set, previous active goals for the user should be marked as `is_active = false`.

### 8.4 `daily_progress` Table

Tracks the user's progress towards their daily goal, typically synced from HealthKit.

- `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
- `user_id`: `UUID` (Foreign Key to `users(id)` ON DELETE CASCADE)
- `goal_id`: `UUID` (Foreign Key to `goals(id)` ON DELETE CASCADE, Nullable) - Links to the `goals` record that was active for the user on this specific `date`. Can be null if a day is skipped without an active goal.
- `date`: `DATE` - The specific day this progress entry is for.
- `progress_data`: `JSONB` (e.g., `{"steps_count": 7500, "distance_ran_km": 4.5}`) - Flexible field to store various progress metrics achieved on this `date`.
- `status`: `TEXT` (ENUM: 'pending', 'completed', 'failed', 'skipped', 'failed_streak_saved', Default: 'pending') - Status of the goal's completion for this specific `date`.
- `effective_target_value`: `INTEGER` (Nullable) - If 'Goal Reduction' reward is used, this stores the temporarily reduced target value for the day.
- `effective_target_unit`: `TEXT` (Nullable) - Unit for the `effective_target_value`.
- `last_fetched_from_healthkit`: `TIMESTAMPTZ` - Timestamp of the last sync with HealthKit.
- `created_at`: `TIMESTAMPTZ` (Default: `NOW()`)
- **Constraint**: `UNIQUE (user_id, date)` - Ensures one progress entry per user per day.

### 8.5 `coin_transactions` Table

Logs all changes to a user's coin balance, including earnings and spending.

- `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
- `user_id`: `UUID` (Foreign Key to `users(id)` ON DELETE CASCADE)
- `type`: `TEXT` (ENUM: 'goal_completion_reward', 'streak_bonus', 'reward_redemption_skip_day', 'reward_redemption_streak_saver', 'reward_redemption_goal_reduction', 'bonus_challenge_reward', 'manual_adjustment') - Type of transaction.
- `description`: `TEXT` (e.g., "Completed daily goal: 10,000 steps", "3-day streak bonus", "Redeemed 'Skip Day' reward") - Human-readable description of the transaction.
- `coin_change`: `INTEGER` - The amount of coins added (positive) or removed (negative).
- `related_goal_id`: `UUID` (Nullable, Foreign Key to `goals(id)` ON DELETE SET NULL) - Links transaction to a specific goal if applicable.
- `reward_details`: `JSONB` (Nullable, e.g. `{"reward_type": "skip_day"}` or `{"challenge_name": "Extra Mile Challenge"}`) - Additional details about the transaction.
- `created_at`: `TIMESTAMPTZ` (Default: `NOW()`)

### 8.6 `user_owned_rewards` Table (Previously 8.7, renumbered for flow)

Stores the rewards currently owned by a user and available for use.

- `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
- `user_id`: `UUID` (Foreign Key to `users(id)` ON DELETE CASCADE, NOT NULL)
- `reward_type`: `TEXT` (ENUM: 'skip_day', 'streak_saver', 'goal_reduction', NOT NULL) - Type of reward owned.
- `quantity`: `INTEGER` (NOT NULL, Default: 1, CHECK (`quantity` > 0)) - Number of this reward type owned.
- `acquired_at`: `TIMESTAMPTZ` (NOT NULL, Default: `NOW()`) - Timestamp of when the first instance of this reward type was acquired or quantity was last incremented.
- `updated_at`: `TIMESTAMPTZ` (NOT NULL, Default: `NOW()`) - Timestamp of the last update to this record.
- **Constraint**: `UNIQUE (user_id, reward_type)` - Ensures one row per unique reward type per user, quantity is managed within that row.
- **RLS**: Enabled, users can only select/update their own owned rewards. (Note: `use-reward` and `daily-goal-check` functions operate with elevated privileges for decrements).

### 8.7 `streak_savers_applied` Table (New Table)

Logs instances where a streak saver was automatically consumed to protect a user's streak.

- `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
- `user_id`: `UUID` (Foreign Key to `users(id)` ON DELETE CASCADE, NOT NULL)
- `date_saved`: `DATE` (NOT NULL) - The date for which the streak was saved.
- `created_at`: `TIMESTAMPTZ` (NOT NULL, Default: `NOW()`) - Timestamp of when the saver was applied.
- **Constraint**: `UNIQUE (user_id, date_saved)` - Ensures a streak saver can only be applied once per user per day.
- **RLS**: Typically, users might only have read access to their own records if direct access is granted. Insertions are handled by the `daily-goal-check` Edge Function.

### 8.8 `friends` Table (Future Feature, previously 8.6)

Manages relationships between users for social features.

- `user_id_1`: `UUID` (Foreign Key to `users(id)` ON DELETE CASCADE)
- `user_id_2`: `UUID` (Foreign Key to `users(id)` ON DELETE CASCADE)
- `status`: `TEXT` (ENUM: 'pending', 'accepted', 'declined', 'blocked') - Status of the friend request/relationship.
- `requested_by`: `UUID` (Foreign Key to `users(id)`) - User who initiated the friend request.
- `created_at`: `TIMESTAMPTZ` (Default: `NOW()`) - Timestamp of when the request was made or relationship formed.
- `updated_at`: `TIMESTAMPTZ` (Default: `NOW()`)
- **Primary Key**: `(user_id_1, user_id_2)`
- **Check Constraint**: `user_id_1 < user_id_2` - Ensures canonical representation of pairs.

---

## 9. Proposed Project Folder Structure (React Native with Expo & TypeScript)

This structure aims for modularity and scalability, following common best practices for React Native/Expo projects.

\`\`\`
GoalGuard/
├── app/ # Expo Router: Screens, layouts, and navigation
│ ├── (auth)/ # Auth-related screens (e.g., sign-in, sign-up)
│ │ ├── \_layout.tsx
│ │ ├── sign-in.tsx
│ │ └── sign-up.tsx
│ ├── (tabs)/ # Main app screens post-authentication (tab-based navigation)
│ │ ├── \_layout.tsx # Tab navigator setup
│ │ ├── dashboard.tsx
│ │ ├── goals.tsx # Goal setting and viewing
│ │ ├── progress.tsx # Detailed progress display
│ │ ├── rewards-store.tsx
│ │ ├── inventory.tsx # Screen to display user's owned rewards
│ │ └── profile.tsx # User profile, settings
│ ├── modal/ # For modal screens
│ │ └── screen-time-setup.tsx
│ ├── \_layout.tsx # Root layout (handles Supabase Auth state, global context)
│ └── index.tsx # App entry point or redirect logic
│
├── assets/ # Static assets
│ ├── fonts/
│ ├── images/
│ └── icons/
│
├── src/ # Core application logic and components
│ ├── api/ # Functions for interacting with Supabase backend
│ │ ├── goalsApi.ts
│ │ ├── userApi.ts
│ │ ├── transactionsApi.ts
│ │ └── inventoryApi.ts
│ ├── components/ # Reusable UI components (built with React Native Paper)
│ │ ├── common/ # Generic components (buttons, cards, etc.)
│ │ ├── auth/ # Auth-specific components
│ │ ├── goals/ # Goal-related components
│ │ ├── gamification/ # Gamification-related components (e.g., streak display)
│ │ └── inventory/ # Components specific to the inventory screen
│ ├── constants/ # Global constants
│ │ ├── colors.ts
│ │ ├── enums.ts # TypeScript enums (GoalType, RewardType, etc.)
│ │ ├── index.ts
│ │ └── theme.ts # React Native Paper theme configuration
│ ├── contexts/ # React Context for global state management
│ │ ├── AuthContext.tsx # Potentially for Supabase Auth state extensions or custom logic
│ │ └── UserProfileContext.tsx # For user stats like coin balance, streak
│ ├── hooks/ # Custom React hooks
│ │ ├── useHealthKit.ts
│ │ ├── useScreenTime.ts
│ │ └── useSupabase.ts # Hook for simplified Supabase interactions (including Auth)
│ ├── lib/ # External library configurations and initializations
│ │ └── supabaseClient.ts# Supabase client instance (handles Auth initialization)
│ ├── services/ # Business logic and service integrations
│ │ ├── HealthKitService.ts # Abstraction for HealthKit interactions
│ │ └── ScreenTimeService.ts# Abstraction for Screen Time API
│ ├── types/ # Global TypeScript type definitions
│ │ ├── database.types.ts# Types generated from Supabase schema (or manually defined)
│ │ ├── navigation.types.ts# Types for React Navigation/Expo Router
│ │ └── index.ts # Exports all types
│ └── utils/ # Utility functions (date formatting, validation, etc.)
│ └── index.ts
│
├── supabase/ # Supabase project files (managed by Supabase CLI)
│ ├── migrations/ # Database schema migrations
│ └── functions/ # Supabase Edge Functions
│ ├── daily-goal-check/ # Checks goal completion, triggers blocking
│ │ └── index.ts
│ └── process-rewards/ # Handles coin updates, streak bonuses
│ └── index.ts
│
├── native-modules/ # Custom native modules (if not using Expo equivalents)
│ ├── HealthKitModule/
│ └── ScreenTimeModule/
│
├── docs/ # Project documentation (CONTEXT.MD is here)
│ └── CONTEXT.MD
│
├── .env # Environment variables (gitignored)
├── .env.example # Example environment variables
├── .gitignore
├── app.config.ts # Expo app configuration (or app.json)
├── babel.config.js
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

---

_End of Document_
