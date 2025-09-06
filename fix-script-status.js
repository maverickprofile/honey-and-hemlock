const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

async function fixScriptStatus() {
  console.log('🔧 Fixing script status to show reviewed scripts...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Step 1: Find all scripts that have reviews
    console.log('1. Finding scripts with reviews...');
    const { data: reviews, error: reviewError } = await supabase
      .from('script_reviews')
      .select('script_id, status, recommendation, created_at')
      .eq('status', 'completed');
    
    if (reviewError) {
      console.error('Error fetching reviews:', reviewError);
      return;
    }
    
    console.log(`   Found ${reviews?.length || 0} completed reviews`);
    
    if (reviews && reviews.length > 0) {
      // Step 2: Update each script to have 'reviewed' status
      console.log('\n2. Updating script statuses...');
      
      for (const review of reviews) {
        const { data: script, error: scriptError } = await supabase
          .from('scripts')
          .select('id, title, status')
          .eq('id', review.script_id)
          .single();
        
        if (script) {
          console.log(`   Script: "${script.title}" (current status: ${script.status})`);
          
          // Update the script status to 'reviewed'
          const { error: updateError } = await supabase
            .from('scripts')
            .update({ 
              status: 'reviewed',
              reviewed_at: review.created_at // Also set the reviewed_at timestamp
            })
            .eq('id', script.id);
          
          if (updateError) {
            console.error(`   ❌ Failed to update: ${updateError.message}`);
          } else {
            console.log(`   ✅ Updated to 'reviewed' status`);
          }
        }
      }
    }
    
    // Step 3: Verify the updates
    console.log('\n3. Verifying updates...');
    const { data: reviewedScripts, error: verifyError } = await supabase
      .from('scripts')
      .select('id, title, status, reviewed_at')
      .eq('status', 'reviewed');
    
    if (verifyError) {
      console.error('Error verifying:', verifyError);
    } else {
      console.log(`\n✅ SUCCESS! ${reviewedScripts?.length || 0} scripts now show as 'reviewed'`);
      
      if (reviewedScripts && reviewedScripts.length > 0) {
        console.log('\nReviewed scripts:');
        reviewedScripts.forEach(script => {
          console.log(`   - "${script.title}"`);
        });
      }
    }
    
    // Step 4: Also check for any scripts with "assigned" status that have reviews
    console.log('\n4. Checking for assigned scripts with completed reviews...');
    const { data: assignedScripts } = await supabase
      .from('scripts')
      .select('id, title, status, assigned_judge_id')
      .or('status.eq.assigned,status.eq.pending');
    
    if (assignedScripts && assignedScripts.length > 0) {
      for (const script of assignedScripts) {
        // Check if this script has a completed review
        const { data: hasReview } = await supabase
          .from('script_reviews')
          .select('id')
          .eq('script_id', script.id)
          .eq('status', 'completed')
          .single();
        
        if (hasReview) {
          console.log(`   Found completed review for "${script.title}" - updating status...`);
          await supabase
            .from('scripts')
            .update({ status: 'reviewed' })
            .eq('id', script.id);
          console.log(`   ✅ Updated "${script.title}" to reviewed`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL STATUS');
    console.log('='.repeat(60));
    console.log('Script statuses have been fixed!');
    console.log('\nYou should now be able to:');
    console.log('1. Login to admin panel at http://localhost:8080/admin');
    console.log('2. Go to Scripts section');
    console.log('3. See scripts with "Reviewed" status');
    console.log('4. Click "View Review" button');
    console.log('5. Download the rubric as PDF');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the fix
fixScriptStatus().catch(console.error);