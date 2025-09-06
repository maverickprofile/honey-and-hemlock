const https = require('https');

const projectRef = 'zknmzaowomihtrtqleon';
const accessToken = 'sbp_8c6d3ea9a52b8c6cd63524b261dcca4978376e72';

const sql = `
-- Fix script deletion issue
DROP FUNCTION IF EXISTS delete_script_admin(UUID);

CREATE OR REPLACE FUNCTION delete_script_admin(script_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM script_page_notes WHERE script_review_id IN (
    SELECT id FROM script_reviews WHERE script_id = delete_script_admin.script_id
  );
  DELETE FROM script_page_rubrics WHERE script_review_id IN (
    SELECT id FROM script_reviews WHERE script_id = delete_script_admin.script_id
  );
  DELETE FROM script_reviews WHERE script_id = delete_script_admin.script_id;
  DELETE FROM scripts WHERE id = delete_script_admin.script_id;
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

console.log('🚀 Applying SQL fix via Supabase Management API...\n');

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    
    try {
      const result = JSON.parse(responseData);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ SQL executed successfully!');
        console.log('\n🎉 The delete_script_admin function has been created.');
        console.log('Script deletion should now work properly in the admin panel!');
      } else {
        console.log('Response:', result);
        
        if (result.error) {
          console.log('\n❌ Error:', result.error);
        }
        
        console.log('\n📋 If this didn\'t work, please apply the SQL manually:');
        console.log('1. Go to: https://app.supabase.com/project/zknmzaowomihtrtqleon/sql/new');
        console.log('2. Paste the SQL from fix-script-deletion.sql');
        console.log('3. Click "Run"');
      }
    } catch (e) {
      console.log('Raw response:', responseData);
      console.log('\n⚠️ Unexpected response format');
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e);
});

req.write(data);
req.end();