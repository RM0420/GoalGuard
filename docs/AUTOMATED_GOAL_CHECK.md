# Automated Daily Goal Check

## Overview

GoalGuard includes an automated daily goal check system that runs at midnight (00:00) every day. This system processes all users' goal progress for the previous day, updates their streaks and coin balances, and creates new progress entries for the current day.

## How It Works

### PostgreSQL Cron Job

The automated goal check is implemented using PostgreSQL's `pg_cron` extension, which allows scheduling SQL functions to run at specific times. The cron job is scheduled to run every day at midnight (00:00) and executes the `run_daily_goal_check()` function.

### The Goal Check Process

For each user, the system:

1. **Evaluates Yesterday's Goal Progress:**

   - Checks if the goal was completed, skipped, or missed
   - For completed goals:
     - Increases the user's streak count
     - Awards coins for goal completion (10 coins)
     - Awards streak bonus coins if applicable (5 additional coins for streaks of 3+ days)
   - For missed goals:
     - Checks if the user has a "Streak Saver" reward available
     - If a Streak Saver is available, it's automatically consumed and the streak is maintained
     - If no Streak Saver is available, the streak is reset to 0
   - For skipped goals (via "Skip Day" reward):
     - The streak is maintained without increment

2. **Updates User Statistics:**

   - Updates the user's streak length
   - Updates the user's coin balance
   - Records all transactions in the coin_transactions table

3. **Creates a New Progress Entry for Today:**
   - Automatically creates a new daily_progress entry for the current day
   - Sets the initial status to "pending"
   - Initializes with empty progress data to be filled as the user makes progress

## Testing and Manual Triggering

For testing purposes, two functions are available:

1. `trigger_daily_goal_check()`: A SQL function that can be called to manually trigger the daily goal check process
2. `http_trigger_daily_goal_check()`: An HTTP-accessible endpoint that can be called to trigger the process via an API call

## Database Objects

The automated goal check system involves the following database objects:

- `run_daily_goal_check()`: The main function that processes all users' goals
- `cron.job`: The cron job schedule entry (runs at 00:00 daily)
- `daily_progress`: Table for storing users' daily goal progress
- `user_profile_and_stats`: Table for user streak and coin information
- `coin_transactions`: Table for recording coin earnings and expenditures
- `streak_savers_applied`: Table for tracking when streak savers are used

## Security Considerations

The automatic goal check runs with elevated database privileges (service_role) to access and modify user data. Row Level Security (RLS) policies are in place to ensure that regular user access is properly restricted, while allowing the system processes to function.

## Troubleshooting

If the automated goal check is not working as expected:

1. Check the PostgreSQL logs for any errors in the cron job execution
2. Verify that the `pg_cron` extension is properly installed and running
3. Check that the cron job is scheduled and active using `SELECT * FROM cron.job;`
4. Test the process manually using `SELECT trigger_daily_goal_check();`

## Implementation Details

The system is implemented entirely within the Supabase PostgreSQL database using:

- SQL functions
- PostgreSQL cron jobs
- Row Level Security policies
- Database triggers and constraints
