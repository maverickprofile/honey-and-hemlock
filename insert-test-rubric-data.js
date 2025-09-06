const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://zknmzaowomihtrtqleon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

async function insertTestData() {
  console.log('🚀 Starting test data insertion...\n');
  
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Step 1: Check if we have any judges
    console.log('1. Checking for judges...');
    const { data: judges, error: judgeError } = await supabase
      .from('judges')
      .select('*')
      .limit(1);
    
    if (judgeError) {
      console.error('Error fetching judges:', judgeError);
      return;
    }
    
    let judgeId;
    if (judges && judges.length > 0) {
      judgeId = judges[0].id;
      console.log(`   ✓ Found judge: ${judges[0].name} (${judgeId})`);
    } else {
      // Create a test judge
      console.log('   Creating test judge...');
      const { data: newJudge, error: createJudgeError } = await supabase
        .from('judges')
        .insert({
          name: 'Test Judge',
          email: 'testjudge@example.com',
          password_hash: 'dummy_hash', // In real app, this would be hashed
          status: 'active'
        })
        .select()
        .single();
      
      if (createJudgeError) {
        console.error('Error creating judge:', createJudgeError);
        return;
      }
      
      judgeId = newJudge.id;
      console.log(`   ✓ Created test judge (${judgeId})`);
    }
    
    // Step 2: Check for scripts
    console.log('\n2. Checking for scripts...');
    const { data: scripts, error: scriptError } = await supabase
      .from('scripts')
      .select('*')
      .limit(1);
    
    if (scriptError) {
      console.error('Error fetching scripts:', scriptError);
      return;
    }
    
    let scriptId;
    if (scripts && scripts.length > 0) {
      scriptId = scripts[0].id;
      console.log(`   ✓ Found script: ${scripts[0].title} (${scriptId})`);
      
      // Update script to be assigned to our judge
      await supabase
        .from('scripts')
        .update({ 
          assigned_judge_id: judgeId,
          status: 'assigned'
        })
        .eq('id', scriptId);
    } else {
      // Create a test script
      console.log('   Creating test script...');
      const { data: newScript, error: createScriptError } = await supabase
        .from('scripts')
        .insert({
          title: 'The Test Masterpiece',
          author_name: 'Test Author',
          author_email: 'author@test.com',
          tier_name: 'Premium',
          tier_id: 'tier_premium',
          amount: 1000,
          status: 'assigned',
          assigned_judge_id: judgeId,
          file_name: 'test_script.pdf',
          payment_status: 'paid'
        })
        .select()
        .single();
      
      if (createScriptError) {
        console.error('Error creating script:', createScriptError);
        return;
      }
      
      scriptId = newScript.id;
      console.log(`   ✓ Created test script (${scriptId})`);
    }
    
    // Step 3: Create or update script review with full rubric data
    console.log('\n3. Creating/updating script review with rubric data...');
    
    // Check if review exists
    const { data: existingReview } = await supabase
      .from('script_reviews')
      .select('*')
      .eq('script_id', scriptId)
      .single();
    
    const reviewData = {
      script_id: scriptId,
      judge_id: judgeId,
      status: 'completed',
      recommendation: 'approved',
      overall_notes: 'This is an exceptional script that demonstrates masterful storytelling. The narrative is compelling from start to finish, with well-developed characters and authentic dialogue. The themes are profound and relevant, making this a strong candidate for production.',
      feedback: 'Outstanding work overall. The script shows great potential for both critical and commercial success.',
      
      // Rubric fields
      title_response: 'The title "The Test Masterpiece" perfectly captures the essence of the story',
      
      // Ratings (1-5 scale)
      plot_rating: 5,
      plot_notes: 'The plot is exceptionally well-crafted with logical progression and surprising twists. Each event flows naturally into the next, creating a compelling narrative arc that keeps the reader engaged throughout.',
      
      characters_rating: 4,
      character_notes: 'Characters are well-developed with distinct voices and believable motivations. The protagonist shows significant growth throughout the story, and supporting characters add depth to the narrative.',
      
      concept_originality_rating: 5,
      concept_originality_notes: 'Highly original concept that brings a fresh perspective to the genre. The premise is immediately engaging and executed with creativity and intelligence.',
      
      structure_rating: 4,
      structure_notes: 'Well-structured narrative with strong pacing. The three-act structure is clear, with effective rising action leading to a powerful climax.',
      
      dialogue_rating: 5,
      dialogue_notes: 'Exceptional dialogue that feels natural and authentic. Each character has a distinct voice, and the subtext is masterfully handled throughout.',
      
      format_pacing_rating: 4,
      format_pacing_notes: 'Professional formatting throughout with only minor issues. Pacing keeps the reader engaged from start to finish without any significant lag.',
      
      theme_rating: 5,
      theme_tone_notes: 'Profound thematic exploration of human nature and moral complexity. The themes are woven organically through character actions and dialogue.',
      
      catharsis_rating: 5,
      catharsis_notes: 'The ending provides complete emotional satisfaction and logical resolution. Readers will feel deeply moved and transformed by the journey.',
      
      production_budget_rating: 3, // 1-6 scale (3 = medium budget)
      production_budget_notes: 'Moderate budget requirements with 5 main locations and a cast of 8-10 actors. No major action sequences or special effects needed, making this feasible for independent production.'
    };
    
    let reviewId;
    if (existingReview) {
      // Update existing review
      const { data: updatedReview, error: updateError } = await supabase
        .from('script_reviews')
        .update(reviewData)
        .eq('id', existingReview.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating review:', updateError);
        return;
      }
      
      reviewId = existingReview.id;
      console.log(`   ✓ Updated existing review (${reviewId})`);
    } else {
      // Create new review
      const { data: newReview, error: createReviewError } = await supabase
        .from('script_reviews')
        .insert(reviewData)
        .select()
        .single();
      
      if (createReviewError) {
        console.error('Error creating review:', createReviewError);
        return;
      }
      
      reviewId = newReview.id;
      console.log(`   ✓ Created new review (${reviewId})`);
    }
    
    // Step 4: Add some page notes (optional)
    console.log('\n4. Adding page notes...');
    
    const pageNotes = [
      { script_review_id: reviewId, page_number: 1, note: 'Strong opening that immediately hooks the reader.' },
      { script_review_id: reviewId, page_number: 10, note: 'Excellent character introduction with natural exposition.' },
      { script_review_id: reviewId, page_number: 25, note: 'First act break is perfectly timed with strong momentum.' },
      { script_review_id: reviewId, page_number: 50, note: 'Midpoint twist is unexpected yet perfectly logical.' },
      { script_review_id: reviewId, page_number: 75, note: 'Third act begins with high stakes and tension.' },
      { script_review_id: reviewId, page_number: 90, note: 'Climax delivers emotional payoff.' }
    ];
    
    // Delete existing page notes for this review
    await supabase
      .from('script_page_notes')
      .delete()
      .eq('script_review_id', reviewId);
    
    // Insert new page notes
    const { error: notesError } = await supabase
      .from('script_page_notes')
      .insert(pageNotes);
    
    if (notesError) {
      console.error('Error adding page notes:', notesError);
    } else {
      console.log(`   ✓ Added ${pageNotes.length} page notes`);
    }
    
    // Step 5: Update script status
    console.log('\n5. Updating script status...');
    const { error: statusError } = await supabase
      .from('scripts')
      .update({ status: 'approved' })
      .eq('id', scriptId);
    
    if (statusError) {
      console.error('Error updating script status:', statusError);
    } else {
      console.log('   ✓ Script marked as approved');
    }
    
    // Success message
    console.log('\n' + '='.repeat(50));
    console.log('✅ TEST DATA INSERTED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\nYou can now:');
    console.log('1. Login as admin at http://localhost:8080/admin');
    console.log('2. Navigate to Scripts section');
    console.log('3. Click "View Review" on the test script');
    console.log('4. Click "Download PDF" to test the PDF export');
    console.log('\nScript Title: The Test Masterpiece');
    console.log('Review Status: Completed');
    console.log('Recommendation: Approved');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Check if Supabase credentials are configured
if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.log('⚠️  Please update the Supabase credentials in this file first!');
  console.log('   You can find them in your Supabase project dashboard.');
  console.log('   Look for:');
  console.log('   - Project URL (SUPABASE_URL)');
  console.log('   - Anon/Public key (SUPABASE_ANON_KEY)');
} else {
  // Run the insertion
  insertTestData().catch(console.error);
}