const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

async function checkAndFixRLS() {
  console.log('🔍 Checking RLS policies for scripts table\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Test deletion with anon key (what the frontend uses)
    console.log('1. Testing deletion with frontend credentials...');
    
    // First, get a script ID to test with
    const { data: scripts, error: fetchError } = await supabase
      .from('scripts')
      .select('id, title')
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching scripts:', fetchError);
      return;
    }
    
    if (scripts && scripts.length > 0) {
      const testScript = scripts[0];
      console.log(`   Testing deletion of: "${testScript.title}"`);
      
      // Try to delete
      const { data: deleteData, error: deleteError } = await supabase
        .from('scripts')
        .delete()
        .eq('id', testScript.id)
        .select(); // Add select to see what was deleted
      
      if (deleteError) {
        console.log(`   ❌ Deletion failed: ${deleteError.message}`);
        console.log(`   Error code: ${deleteError.code}`);
        
        if (deleteError.code === '42501') {
          console.log('\n   ⚠️ This is an RLS policy violation!');
          console.log('   The current user role does not have DELETE permission.');
        }
      } else if (deleteData && deleteData.length > 0) {
        console.log(`   ✅ Successfully deleted: "${testScript.title}"`);
      } else {
        console.log('   ⚠️ Delete operation returned no error but also no data.');
        console.log('   This usually means RLS blocked the operation silently.');
      }
    }
    
    console.log('\n2. Checking current RLS policies...');
    console.log('   RLS policies must be checked/modified in Supabase dashboard.');
    console.log('   Go to: Authentication > Policies > scripts table');
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SOLUTION');
    console.log('='.repeat(60));
    console.log('\nTo fix the deletion issue, you need to:');
    console.log('\n1. Go to Supabase Dashboard');
    console.log('2. Navigate to Authentication > Policies');
    console.log('3. Find the "scripts" table');
    console.log('4. Add or modify the DELETE policy to allow:');
    console.log('   - Admins to delete any script');
    console.log('   - OR disable RLS temporarily for testing');
    console.log('\nAlternatively, create a database function that bypasses RLS:');
    console.log('   - Create a function with SECURITY DEFINER');
    console.log('   - Call it from the frontend instead of direct delete');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the check
checkAndFixRLS().catch(console.error);