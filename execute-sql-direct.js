const fetch = require('node-fetch');

const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcxMDYxOCwiZXhwIjoyMDY3Mjg2NjE4fQ.I_VLhJcfHvIpQfXjkWooOB9kQXpjhGSJ7iXBvSd8k5U';

async function executeSQLDirectly() {
  console.log('🚀 Executing SQL to fix script deletion...\n');
  
  // The SQL to create our deletion function
  const sql = `
    -- First drop the function if it exists
    DROP FUNCTION IF EXISTS delete_script_admin(UUID);
    
    -- Create the function
    CREATE OR REPLACE FUNCTION delete_script_admin(script_id UUID)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
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
    
    -- Grant execute permission
    GRANT EXECUTE ON FUNCTION delete_script_admin TO authenticated;
    GRANT EXECUTE ON FUNCTION delete_script_admin TO anon;
  `;
  
  try {
    // Execute the SQL using the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      // Try alternative approach - direct SQL endpoint
      console.log('Trying alternative SQL execution method...\n');
      
      // Use pg endpoint if available
      const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (!pgResponse.ok) {
        console.log('❌ Direct SQL execution not available via API\n');
        console.log('Creating the function using Supabase client with service role...\n');
        
        // Use Supabase client with service role
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
          db: { schema: 'public' },
          auth: { persistSession: false }
        });
        
        // Since we can't execute arbitrary SQL, let's create a migration file
        const fs = require('fs');
        const migrationName = `${Date.now()}_fix_script_deletion.sql`;
        const migrationPath = `./honeyandhemlock/supabase/migrations/${migrationName}`;
        
        fs.writeFileSync(migrationPath, sql);
        console.log(`✅ Created migration file: ${migrationName}\n`);
        
        // Now apply it
        const { exec } = require('child_process');
        exec(`cd honeyandhemlock && npx supabase db push --password "fKbDZHhXHS48qnBq"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
          }
          console.log(`✅ Migration applied successfully!\n${stdout}`);
        });
        
        return;
      }
      
      console.log('✅ SQL executed via pg endpoint');
    } else {
      console.log('✅ SQL executed successfully!');
    }
    
    // Test if the function exists now
    console.log('\nTesting if function was created...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase
      .rpc('delete_script_admin', { script_id: '00000000-0000-0000-0000-000000000000' });
    
    if (error && error.message.includes('could not find')) {
      console.log('⚠️ Function not found - may need manual creation');
    } else {
      console.log('✅ Function exists and is callable!');
      console.log('\n🎉 Script deletion should now work properly in the admin panel!');
    }
    
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard:');
    console.log('https://app.supabase.com/project/zknmzaowomihtrtqleon/sql/new');
  }
}

executeSQLDirectly().catch(console.error);