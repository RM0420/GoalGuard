-- Migration: Create set_user_goal function
-- This function allows setting a single persistent goal per user
-- instead of creating new goals each time.

-- Create a function that manages setting a user's goal
CREATE OR REPLACE FUNCTION set_user_goal(
  p_user_id UUID,
  p_goal_type TEXT,
  p_target_value INTEGER,
  p_target_unit TEXT,
  p_apps_to_block JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  v_goal_id UUID;
BEGIN
  -- Check if user already has a goal
  SELECT id INTO v_goal_id FROM goals WHERE user_id = p_user_id LIMIT 1;
  
  IF v_goal_id IS NULL THEN
    -- Create a new goal for the user (first time)
    INSERT INTO goals (
      user_id,
      goal_type,
      target_value,
      target_unit,
      apps_to_block,
      is_active
    ) VALUES (
      p_user_id,
      p_goal_type,
      p_target_value,
      p_target_unit,
      p_apps_to_block,
      TRUE
    );
  ELSE
    -- Update the existing goal
    UPDATE goals
    SET 
      goal_type = p_goal_type,
      target_value = p_target_value,
      target_unit = p_target_unit,
      apps_to_block = p_apps_to_block,
      updated_at = NOW()
    WHERE id = v_goal_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 