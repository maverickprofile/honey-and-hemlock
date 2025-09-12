-- Create function to assign scripts to judges
-- This bypasses RLS for admin operations
CREATE OR REPLACE FUNCTION assign_script_to_judge(
  p_script_id UUID,
  p_judge_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the script with the new judge assignment
  UPDATE scripts
  SET 
    assigned_judge_id = p_judge_id,
    status = CASE 
      WHEN p_judge_id IS NULL THEN 'pending'
      ELSE 'assigned'
    END,
    updated_at = NOW()
  WHERE id = p_script_id;
  
  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION assign_script_to_judge TO authenticated;

-- Also create a function to get scripts for admin (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_scripts_admin()
RETURNS SETOF scripts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM scripts
  ORDER BY created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_scripts_admin TO authenticated;

-- Create a function to get scripts assigned to a specific judge
CREATE OR REPLACE FUNCTION get_assigned_scripts(p_judge_id UUID)
RETURNS SETOF scripts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM scripts
  WHERE assigned_judge_id = p_judge_id
  ORDER BY created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_assigned_scripts TO authenticated;