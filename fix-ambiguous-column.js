const https = require('https');

const projectRef = 'zknmzaowomihtrtqleon';
const accessToken = 'sbp_8c6d3ea9a52b8c6cd63524b261dcca4978376e72';

// Fixed SQL with proper parameter reference
const sql = `
-- Drop and recreate the function with fixed parameter reference
DROP FUNCTION IF EXISTS delete_script_admin(UUID);

CREATE OR REPLACE FUNCTION delete_script_admin(p_script_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete related page notes first
  DELETE FROM script_page_notes 
  WHERE script_review_id IN (
    SELECT id FROM script_reviews WHERE script_reviews.script_id = p_script_id
  );
  
  -- Delete related page rubrics
  DELETE FROM script_page_rubrics 
  WHERE script_review_id IN (
    SELECT id FROM script_reviews WHERE script_reviews.script_id = p_script_id
  );
  
  -- Delete script reviews
  DELETE FROM script_reviews WHERE script_reviews.script_id = p_script_id;
  
  -- Finally delete the script itself
  DELETE FROM scripts WHERE scripts.id = p_script_id;
  
  -- Return true if the script was deleted
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_script_admin TO authenticated;
GRANT EXECUTE ON FUNCTION delete_script_admin TO anon;
`;

const data = JSON.stringify({
  query: sql
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔧 Fixing the delete_script_admin function...\n');

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Function fixed successfully!');
      console.log('\nThe ambiguous column reference has been resolved.');
      console.log('Script deletion should now work properly!');
    } else {
      console.log('Response status:', res.statusCode);
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e);
});

req.write(data);
req.end();