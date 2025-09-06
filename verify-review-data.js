const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

async function verifyReviewData() {
  console.log('🔍 Verifying review data in database...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Step 1: Check all scripts
    console.log('1. All scripts in database:');
    console.log('=' .repeat(60));
    const { data: scripts, error: scriptsError } = await supabase
      .from('scripts')
      .select('id, title, status, assigned_judge_id, created_at')
      .order('created_at', { ascending: false });
    
    if (scriptsError) {
      console.error('Error fetching scripts:', scriptsError);
      return;
    }
    
    if (scripts && scripts.length > 0) {
      scripts.forEach((script, index) => {
        console.log(`\n${index + 1}. Script: "${script.title}"`);
        console.log(`   ID: ${script.id}`);
        console.log(`   Status: ${script.status}`);
        console.log(`   Assigned Judge: ${script.assigned_judge_id || 'None'}`);
        console.log(`   Created: ${new Date(script.created_at).toLocaleString()}`);
      });
    } else {
      console.log('   No scripts found');
    }
    
    // Step 2: Check all reviews
    console.log('\n\n2. All reviews in database:');
    console.log('=' .repeat(60));
    const { data: reviews, error: reviewsError } = await supabase
      .from('script_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return;
    }
    
    if (reviews && reviews.length > 0) {
      for (const review of reviews) {
        console.log(`\nReview ID: ${review.id}`);
        console.log(`Script ID: ${review.script_id}`);
        console.log(`Judge ID: ${review.judge_id}`);
        console.log(`Status: ${review.status}`);
        console.log(`Recommendation: ${review.recommendation}`);
        console.log(`Created: ${new Date(review.created_at).toLocaleString()}`);
        
        // Check if this review has rubric data
        const hasRubricData = review.plot_rating || review.characters_rating || 
                             review.dialogue_rating || review.theme_rating;
        console.log(`Has Rubric Data: ${hasRubricData ? '✅ YES' : '❌ NO'}`);
        
        if (hasRubricData) {
          console.log('Rubric Ratings:');
          if (review.plot_rating) console.log(`  - Plot: ${review.plot_rating}/5`);
          if (review.characters_rating) console.log(`  - Characters: ${review.characters_rating}/5`);
          if (review.concept_originality_rating) console.log(`  - Concept: ${review.concept_originality_rating}/5`);
          if (review.structure_rating) console.log(`  - Structure: ${review.structure_rating}/5`);
          if (review.dialogue_rating) console.log(`  - Dialogue: ${review.dialogue_rating}/5`);
          if (review.format_pacing_rating) console.log(`  - Format/Pacing: ${review.format_pacing_rating}/5`);
          if (review.theme_rating) console.log(`  - Theme: ${review.theme_rating}/5`);
          if (review.catharsis_rating) console.log(`  - Catharsis: ${review.catharsis_rating}/5`);
          if (review.production_budget_rating) console.log(`  - Production Budget: ${review.production_budget_rating}/6`);
        }
        
        // Find the script this review belongs to
        const script = scripts?.find(s => s.id === review.script_id);
        if (script) {
          console.log(`\n📌 This review is for: "${script.title}"`);
          console.log(`   Script status: ${script.status}`);
        }
      }
    } else {
      console.log('   No reviews found');
    }
    
    // Step 3: Check which scripts should show "View Review" button
    console.log('\n\n3. Scripts that should show "View Review" button:');
    console.log('=' .repeat(60));
    console.log('(Scripts with status: approved, declined, or reviewed)\n');
    
    const reviewableStatuses = ['approved', 'declined', 'reviewed'];
    const reviewableScripts = scripts?.filter(s => 
      reviewableStatuses.includes(s.status)
    );
    
    if (reviewableScripts && reviewableScripts.length > 0) {
      reviewableScripts.forEach(script => {
        console.log(`✅ "${script.title}" - Status: ${script.status}`);
        
        // Check if this script has a review
        const hasReview = reviews?.find(r => r.script_id === script.id);
        if (hasReview) {
          console.log(`   ✅ Has review (ID: ${hasReview.id})`);
          console.log(`   ✅ Review has rubric data: ${hasReview.plot_rating ? 'YES' : 'NO'}`);
        } else {
          console.log(`   ⚠️ No review found for this script`);
        }
      });
    } else {
      console.log('❌ No scripts with reviewable status found');
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Scripts: ${scripts?.length || 0}`);
    console.log(`Total Reviews: ${reviews?.length || 0}`);
    console.log(`Scripts with "approved" status: ${scripts?.filter(s => s.status === 'approved').length || 0}`);
    console.log(`Scripts with "declined" status: ${scripts?.filter(s => s.status === 'declined').length || 0}`);
    
    const scriptsWithViewButton = scripts?.filter(s => 
      ['approved', 'declined', 'reviewed'].includes(s.status)
    ).length || 0;
    
    if (scriptsWithViewButton > 0) {
      console.log(`\n✅ ${scriptsWithViewButton} script(s) should show "View Review" button in admin panel`);
      console.log('\nNext steps:');
      console.log('1. Go to http://localhost:8080/admin');
      console.log('2. Login with admin@honeylocust.com / HoneyAdmin2024!');
      console.log('3. Click on Scripts tab');
      console.log('4. Look for the "View Review" button (chat bubble icon) next to approved/declined scripts');
      console.log('5. Click it to open the review dialog');
      console.log('6. Click "Download PDF" to get the rubric PDF');
    } else {
      console.log('\n❌ No scripts currently have the right status to show "View Review" button');
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run verification
verifyReviewData().catch(console.error);