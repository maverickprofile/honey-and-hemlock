-- Fix script deletion issue by creating a function that bypasses RLS
-- This function will be called by admins to delete scripts

-- First drop the function if it exists
DROP FUNCTION IF EXISTS delete_script_admin(UUID);

-- Create the function to delete scripts and their related data
CREATE OR REPLACE FUNCTION delete_script_admin(script_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the owner, bypassing RLS
AS $$
BEGIN
  -- Delete related page notes first
  DELETE FROM script_page_notes WHERE script_review_id IN (
    SELECT id FROM script_reviews WHERE script_id = delete_script_admin.script_id
  );
  
  -- Delete related page rubrics
  DELETE FROM script_page_rubrics WHERE script_review_id IN (
    SELECT id FROM script_reviews WHERE script_id = delete_script_admin.script_id
  );
  
  -- Delete script reviews
  DELETE FROM script_reviews WHERE script_id = delete_script_admin.script_id;
  
  -- Finally delete the script itself
  DELETE FROM scripts WHERE id = delete_script_admin.script_id;
  
  -- Return true if the script was deleted
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users (admins will use this)
GRANT EXECUTE ON FUNCTION delete_script_admin TO authenticated;
GRANT EXECUTE ON FUNCTION delete_script_admin TO anon;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can delete scripts" ON scripts;

-- Create a new policy that allows authenticated users to delete scripts
-- You can make this more restrictive by checking for admin role
CREATE POLICY "Allow authenticated users to delete scripts" 
ON scripts
FOR DELETE
TO authenticated
USING (true); -- Allow all authenticated users for now

-- Also ensure admins can see all scripts
DROP POLICY IF EXISTS "Admins can view all scripts" ON scripts;
CREATE POLICY "Allow viewing all scripts" 
ON scripts
FOR SELECT
TO authenticated, anon
USING (true);