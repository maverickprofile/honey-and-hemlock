const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

async function forceDeleteAllScripts() {
  console.log('🔥 Force deleting ALL scripts...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Get all script IDs first
    const { data: scripts, error: fetchError } = await supabase
      .from('scripts')
      .select('id, title');
    
    if (fetchError) {
      console.error('Error fetching scripts:', fetchError);
      return;
    }
    
    console.log(`Found ${scripts?.length || 0} scripts to delete:`);
    scripts?.forEach(s => console.log(`  - ${s.title} (${s.id})`));
    
    if (scripts && scripts.length > 0) {
      // Delete each script individually
      console.log('\nDeleting scripts one by one...');
      
      for (const script of scripts) {
        // First delete related reviews
        const { error: reviewDeleteError } = await supabase
          .from('script_reviews')
          .delete()
          .eq('script_id', script.id);
        
        if (reviewDeleteError) {
          console.log(`  Review delete error for ${script.title}:`, reviewDeleteError.message);
        }
        
        // Then delete the script
        const { error: scriptDeleteError } = await supabase
          .from('scripts')
          .delete()
          .eq('id', script.id);
        
        if (scriptDeleteError) {
          console.log(`  ❌ Failed to delete "${script.title}": ${scriptDeleteError.message}`);
        } else {
          console.log(`  ✓ Deleted "${script.title}"`);
        }
      }
    }
    
    // Final verification
    console.log('\nFinal verification...');
    const { data: remaining, error: verifyError } = await supabase
      .from('scripts')
      .select('id, title');
    
    if (verifyError) {
      console.error('Verification error:', verifyError);
    } else if (remaining && remaining.length > 0) {
      console.log(`⚠️ ${remaining.length} scripts still remain:`);
      remaining.forEach(s => console.log(`  - ${s.title}`));
      console.log('\nThese scripts might have RLS policies preventing deletion.');
      console.log('You may need to delete them through the Supabase dashboard.');
    } else {
      console.log('✅ All scripts successfully deleted!');
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the force deletion
forceDeleteAllScripts().catch(console.error);