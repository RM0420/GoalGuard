-- Migration: Update daily_progress for user-centric goals
-- This migration adds/modifies constraints in the daily_progress table
-- and creates a view for simplified queries

-- First ensure daily_progress has the right constraint
ALTER TABLE IF EXISTS daily_progress
DROP CONSTRAINT IF EXISTS daily_progress_user_id_date_key;

-- Re-add the constraint to ensure one progress entry per user per day
ALTER TABLE daily_progress
ADD CONSTRAINT daily_progress_user_id_date_key UNIQUE (user_id, date);

-- Create a view that combines goal and daily progress data
CREATE OR REPLACE VIEW user_goal_progress AS
SELECT 
    dp.id as progress_id,
    dp.user_id,
    dp.date,
    dp.progress_data,
    dp.status,
    dp.effective_target_value,
    dp.effective_target_unit,
    dp.last_fetched_from_healthkit,
    g.id as goal_id,
    g.goal_type,
    g.target_value,
    g.target_unit,
    g.apps_to_block,
    COALESCE(dp.effective_target_value, g.target_value) as current_target_value,
    COALESCE(dp.effective_target_unit, g.target_unit) as current_target_unit
FROM 
    daily_progress dp
JOIN 
    goals g ON dp.user_id = g.user_id
WHERE 
    g.is_active = TRUE;

-- Add function to check if user goal is complete for the day
CREATE OR REPLACE FUNCTION is_goal_complete(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS BOOLEAN AS $$
DECLARE
  v_goal_complete BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN dp.status = 'completed' THEN TRUE
      WHEN dp.status = 'skipped' THEN TRUE
      WHEN dp.status = 'failed_streak_saved' THEN FALSE
      WHEN dp.status = 'failed' THEN FALSE
      WHEN g.goal_type = 'steps' AND 
           (dp.progress_data->>'steps_count')::INTEGER >= COALESCE(dp.effective_target_value, g.target_value) THEN TRUE
      WHEN g.goal_type = 'run_distance' AND 
           (dp.progress_data->>'distance_ran_km')::FLOAT >= COALESCE(dp.effective_target_value, g.target_value) THEN TRUE
      ELSE FALSE
    END INTO v_goal_complete
  FROM 
    daily_progress dp
  JOIN 
    goals g ON dp.user_id = g.user_id
  WHERE 
    dp.user_id = p_user_id AND
    dp.date = p_date AND
    g.is_active = TRUE;
    
  RETURN COALESCE(v_goal_complete, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 