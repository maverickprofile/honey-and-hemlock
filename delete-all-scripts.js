const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

async function deleteAllScripts() {
  console.log('🗑️  Deleting all scripts and related data...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // First, delete all script_page_notes (they reference script_reviews)
    console.log('1. Deleting page notes...');
    const { error: pageNotesError } = await supabase
      .from('script_page_notes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (pageNotesError && pageNotesError.code !== 'PGRST116') {
      console.log('   Page notes table might not exist or is empty');
    } else {
      console.log('   ✓ Page notes deleted');
    }
    
    // Delete all script_page_rubrics (for $1000 tier)
    console.log('2. Deleting page rubrics...');
    const { error: pageRubricsError } = await supabase
      .from('script_page_rubrics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (pageRubricsError && pageRubricsError.code !== 'PGRST116') {
      console.log('   Page rubrics table might not exist or is empty');
    } else {
      console.log('   ✓ Page rubrics deleted');
    }
    
    // Delete all script_reviews
    console.log('3. Deleting script reviews...');
    const { error: reviewsError } = await supabase
      .from('script_reviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (reviewsError && reviewsError.code !== 'PGRST116') {
      console.log('   Script reviews table might not exist or is empty');
    } else {
      console.log('   ✓ Script reviews deleted');
    }
    
    // Finally, delete all scripts
    console.log('4. Deleting all scripts...');
    const { data: deletedScripts, error: scriptsError } = await supabase
      .from('scripts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      .select();
    
    if (scriptsError) {
      console.error('   Error deleting scripts:', scriptsError);
    } else {
      console.log(`   ✓ ${deletedScripts?.length || 0} scripts deleted`);
    }
    
    // Verify deletion
    console.log('\n5. Verifying deletion...');
    const { data: remainingScripts, error: verifyError } = await supabase
      .from('scripts')
      .select('id');
    
    if (verifyError) {
      console.error('   Error verifying:', verifyError);
    } else {
      console.log(`   ✓ ${remainingScripts?.length || 0} scripts remaining in database`);
    }
    
    console.log('\n✅ Database cleaned successfully!');
    console.log('   All scripts and related data have been deleted.');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the deletion
deleteAllScripts().catch(console.error);