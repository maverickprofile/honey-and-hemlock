-- Create function to submit script review
-- This function updates the review status and the associated script status

CREATE OR REPLACE FUNCTION submit_script_review(
  p_review_id UUID,
  p_recommendation TEXT,
  p_feedback TEXT,
  p_overall_notes TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_script_id UUID;
  v_judge_id UUID;
BEGIN
  -- Get the script_id and judge_id from the review
  SELECT script_id, judge_id INTO v_script_id, v_judge_id
  FROM public.script_reviews
  WHERE id = p_review_id;

  -- If review not found, return false
  IF v_script_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update the review with the submission data
  UPDATE public.script_reviews
  SET
    status = 'completed',
    recommendation = p_recommendation,
    feedback = p_feedback,
    overall_notes = p_overall_notes,
    submitted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_review_id;

  -- Update the script status to 'reviewed' (not 'completed' to match admin dashboard)
  UPDATE public.scripts
  SET
    status = 'reviewed',
    reviewed_at = NOW()
  WHERE id = v_script_id;

  -- Log the activity
  INSERT INTO public.activity_log (activity_type, description, metadata, created_at)
  VALUES (
    'review_submitted',
    'Script review submitted',
    jsonb_build_object(
      'script_id', v_script_id,
      'review_id', p_review_id,
      'judge_id', v_judge_id
    ),
    NOW()
  );

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail completely
    RAISE NOTICE 'Error in submit_script_review: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION submit_script_review TO authenticated;
GRANT EXECUTE ON FUNCTION submit_script_review TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION submit_script_review IS 'Submits a completed script review and updates the associated script status';