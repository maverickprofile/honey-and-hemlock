const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

async function applyDeletionFix() {
  console.log('🔧 Applying deletion fix to database\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Read the SQL file
  const sql = fs.readFileSync('fix-script-deletion.sql', 'utf8');
  
  console.log('📋 This fix will:');
  console.log('1. Create a delete_script_admin function that bypasses RLS');
  console.log('2. Add proper DELETE policies for admins');
  console.log('3. Allow admins to delete scripts and all related data\n');
  
  console.log('⚠️  IMPORTANT: This SQL needs to be run directly in Supabase Dashboard');
  console.log('Because it creates functions and policies.\n');
  
  console.log('Steps to apply:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste this SQL:');
  console.log('\n' + '='.repeat(60));
  console.log(sql);
  console.log('='.repeat(60) + '\n');
  
  console.log('4. Click "Run" to execute the SQL');
  console.log('5. The deletion should work properly after this\n');
  
  // Test if the function exists
  try {
    const { data, error } = await supabase
      .rpc('delete_script_admin', { script_id: '00000000-0000-0000-0000-000000000000' });
    
    if (error && error.code === '42883') {
      console.log('❌ Function does not exist yet - please run the SQL above');
    } else if (error) {
      console.log('⚠️ Function might exist but returned an error:', error.message);
    } else {
      console.log('✅ Function already exists and is callable!');
    }
  } catch (e) {
    console.log('❌ Cannot test function - please apply the SQL manually');
  }
  
  console.log('\n📝 Alternative Quick Fix:');
  console.log('If you just want to disable RLS temporarily for testing:');
  console.log('1. Go to Supabase Dashboard > Authentication > Policies');
  console.log('2. Find the "scripts" table');
  console.log('3. Toggle OFF "Enable RLS" temporarily');
  console.log('4. Test deletion');
  console.log('5. Toggle RLS back ON when done testing');
}

// Run the fix
applyDeletionFix().catch(console.error);