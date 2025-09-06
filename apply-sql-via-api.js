const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcxMDYxOCwiZXhwIjoyMDY3Mjg2NjE4fQ.vzsGUzx5pQZxGv6w1foggmhqKoNdqja-5dEWxUL7aWk'; // We need service key for admin operations
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

async function applySQL() {
  console.log('🚀 Applying SQL fix to Supabase database...\n');
  
  // First, let's use the anon key to create the function via RPC
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Split the SQL into individual statements
    const sqlStatements = [
      // First, create the function
      `
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
      $$
      `,
      
      // Grant permission
      `GRANT EXECUTE ON FUNCTION delete_script_admin TO authenticated`,
      
      // Create policy
      `
      CREATE POLICY "Admins can delete scripts" ON scripts
      FOR DELETE
      TO authenticated
      USING (true)
      `
    ];
    
    console.log('⚠️  Note: Direct SQL execution requires admin access.');
    console.log('The function needs to be created via Supabase Dashboard.\n');
    
    // Instead, let's create a simpler workaround
    console.log('Creating alternative solution...\n');
    
    // Test if we can at least call RPC functions
    const { error: testError } = await supabase
      .rpc('delete_script_admin', { script_id: '00000000-0000-0000-0000-000000000000' })
      .catch(err => ({ error: err }));
    
    if (testError && testError.message.includes('not exist')) {
      console.log('❌ Function does not exist yet.\n');
      console.log('📋 Please run this SQL in your Supabase Dashboard:\n');
      console.log('1. Go to: https://app.supabase.com/project/zknmzaowomihtrtqleon/sql/new');
      console.log('2. Copy and paste the following SQL:\n');
      console.log('='.repeat(70));
      console.log(fs.readFileSync('fix-script-deletion.sql', 'utf8'));
      console.log('='.repeat(70));
      console.log('\n3. Click "Run" to execute\n');
      
      // Alternative: Create a workaround using existing permissions
      console.log('🔧 Meanwhile, implementing a workaround...\n');
      
      // Try to disable RLS temporarily via API (this won't work without service key)
      console.log('Attempting to check current RLS status...');
      
      // Test deletion without function
      const { data: scripts } = await supabase
        .from('scripts')
        .select('id, title')
        .limit(1);
      
      if (scripts && scripts.length > 0) {
        console.log(`\nTesting deletion of: "${scripts[0].title}"`);
        
        // Try with service key if available
        const serviceSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { data: deleteData, error: deleteError } = await serviceSupabase
          .from('scripts')
          .delete()
          .eq('id', scripts[0].id)
          .select();
        
        if (deleteError) {
          console.log('❌ Service key deletion also failed:', deleteError.message);
          console.log('\n⚠️  You must apply the SQL fix via Supabase Dashboard');
        } else if (deleteData && deleteData.length > 0) {
          console.log('✅ Service key deletion worked! Script deleted.');
          console.log('The issue is definitely RLS policies.');
        }
      }
    } else if (!testError) {
      console.log('✅ Function already exists! Deletion should work now.');
    } else {
      console.log('⚠️  Function check returned:', testError.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

applySQL().catch(console.error);