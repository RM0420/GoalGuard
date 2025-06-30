-- Migration: Fix date timezone issues in daily progress entries
-- This migration corrects any issues where daily progress entries were created with incorrect dates
-- due to timezone differences between the server and users.

-- Function to check for and fix missing daily progress entries
CREATE OR REPLACE FUNCTION fix_daily_progress_timezone_issues() RETURNS void AS $$
DECLARE
  user_id_var UUID;
  current_date_var DATE := CURRENT_DATE; -- Server's current date
  yesterday_date_var DATE := CURRENT_DATE - INTERVAL '1 day';
  active_goal_id_var UUID;
BEGIN
  -- Loop through all users
  FOR user_id_var IN SELECT id FROM users LOOP
    -- Get user's active goal
    SELECT id INTO active_goal_id_var
    FROM goals
    WHERE user_id = user_id_var AND is_active = TRUE
    LIMIT 1;
    
    -- Only proceed if user has an active goal
    IF active_goal_id_var IS NOT NULL THEN
      -- Check if today's entry exists, create if missing
      IF NOT EXISTS (
        SELECT 1 FROM daily_progress 
        WHERE user_id = user_id_var AND date = current_date_var
      ) THEN
        INSERT INTO daily_progress (
          user_id, goal_id, date, status, progress_data
        ) VALUES (
          user_id_var, active_goal_id_var, current_date_var, 'pending', '{}'::jsonb
        );
        RAISE NOTICE 'Created missing entry for user % on %', user_id_var, current_date_var;
      END IF;
      
      -- Check if yesterday's entry exists, create if missing
      IF NOT EXISTS (
        SELECT 1 FROM daily_progress 
        WHERE user_id = user_id_var AND date = yesterday_date_var
      ) THEN
        INSERT INTO daily_progress (
          user_id, goal_id, date, status, progress_data
        ) VALUES (
          user_id_var, active_goal_id_var, yesterday_date_var, 'missed', '{}'::jsonb
        );
        RAISE NOTICE 'Created missing entry for user % on %', user_id_var, yesterday_date_var;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to fix any issues
SELECT fix_daily_progress_timezone_issues();

-- Drop the function after use
DROP FUNCTION fix_daily_progress_timezone_issues();

-- Create a helper function that can be called directly when needed
CREATE OR REPLACE FUNCTION create_missing_daily_progress(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS void AS $$
DECLARE
  active_goal_id_var UUID;
BEGIN
  -- Get user's active goal
  SELECT id INTO active_goal_id_var
  FROM goals
  WHERE user_id = p_user_id AND is_active = TRUE
  LIMIT 1;
  
  -- Only proceed if user has an active goal
  IF active_goal_id_var IS NOT NULL THEN
    -- Check if entry exists, create if missing
    IF NOT EXISTS (
      SELECT 1 FROM daily_progress 
      WHERE user_id = p_user_id AND date = p_date
    ) THEN
      INSERT INTO daily_progress (
        user_id, goal_id, date, status, progress_data
      ) VALUES (
        p_user_id, active_goal_id_var, p_date, 'pending', '{}'::jsonb
      );
      RAISE NOTICE 'Created missing entry for user % on %', p_user_id, p_date;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 