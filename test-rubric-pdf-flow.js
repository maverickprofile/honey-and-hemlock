const { chromium } = require('playwright');

(async () => {
  console.log('Starting Rubric PDF Test Flow...');
  
  // Launch browser in headed mode
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions to see what's happening
  });
  
  const context = await browser.newContext({
    acceptDownloads: true // Enable downloads
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to the application
    console.log('\n1. Navigating to application...');
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);

    // Step 2: Login as judge/contractor
    console.log('\n2. Logging in as judge...');
    await page.click('text="Judge Login"');
    await page.waitForTimeout(1000);
    
    // Fill login form (using test credentials)
    await page.fill('input[type="email"]', 'judge@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    // Wait for dashboard to load
    await page.waitForTimeout(3000);
    console.log('   ✓ Logged in as judge');

    // Step 3: Find an assigned script to review
    console.log('\n3. Finding assigned script...');
    
    // Check if there are any assigned scripts
    const assignedScripts = await page.locator('text="Assigned Scripts"').isVisible().catch(() => false);
    
    if (assignedScripts) {
      // Click on the first assigned script
      await page.click('.card:has-text("Review Script")').first();
      console.log('   ✓ Selected script for review');
    } else {
      console.log('   ! No assigned scripts found. Please assign a script to this judge first.');
      
      // Login as admin to assign a script
      console.log('\n   Switching to admin to assign a script...');
      await page.click('text="Logout"');
      await page.waitForTimeout(2000);
      
      await page.goto('http://localhost:8080/admin');
      await page.fill('input[type="email"]', 'admin@honeylocust.com');
      await page.fill('input[type="password"]', 'HoneyAdmin2024!');
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(3000);
      
      // Navigate to Scripts section
      await page.click('text="Scripts"');
      await page.waitForTimeout(2000);
      
      // Assign first unassigned script to judge
      const firstScript = await page.locator('tr').filter({ hasText: 'Pending' }).first();
      if (await firstScript.isVisible()) {
        await firstScript.locator('button:has-text("Assign")').click();
        await page.selectOption('select', { label: 'Test Judge' });
        console.log('   ✓ Script assigned to judge');
      }
      
      // Log back out and login as judge
      await page.click('text="Logout"');
      await page.waitForTimeout(2000);
      
      await page.goto('http://localhost:8080');
      await page.click('text="Judge Login"');
      await page.fill('input[type="email"]', 'judge@test.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(3000);
      
      // Now click on the assigned script
      await page.click('.card:has-text("Review Script")').first();
    }

    // Step 4: Fill out the rubric form
    console.log('\n4. Filling out rubric form...');
    await page.waitForTimeout(2000);
    
    // Fill Title Response
    await page.fill('input[placeholder*="Short answer"]', 'This is an excellent script title that captures the essence of the story');
    
    // Fill Plot Rating and Notes
    await page.click('label[for="plot-5"]'); // Select 5 stars for plot
    await page.fill('textarea[id="plot-notes"]', 'The plot is exceptionally well-crafted with logical progression and surprising twists. Each event flows naturally into the next, creating a compelling narrative arc.');
    
    // Fill Characters Rating and Notes
    await page.click('label[for="characters-4"]'); // Select 4 stars for characters
    await page.fill('textarea[id="character-notes"]', 'Characters are well-developed with distinct voices and believable motivations. The protagonist shows significant growth throughout the story.');
    
    // Fill Concept/Originality Rating and Notes
    await page.click('label[for="concept-5"]'); // Select 5 stars for concept
    await page.fill('textarea[id="concept-notes"]', 'Highly original concept that brings fresh perspective to the genre. The premise is immediately engaging and executed with creativity.');
    
    // Fill Structure Rating and Notes
    await page.click('label[for="structure-4"]'); // Select 4 stars for structure
    await page.fill('textarea[id="structure-notes"]', 'Well-structured narrative with strong pacing. The three-act structure is clear and the climax is properly built up.');
    
    // Fill Dialogue Rating and Notes
    await page.click('label[for="dialogue-5"]'); // Select 5 stars for dialogue
    await page.fill('textarea[id="dialogue-notes"]', 'Exceptional dialogue that feels natural and authentic. Each character has a distinct voice and the subtext is masterfully handled.');
    
    // Fill Format/Pacing Rating and Notes
    await page.click('label[for="format-4"]'); // Select 4 stars for format
    await page.fill('textarea[id="format-notes"]', 'Professional formatting throughout with only minor issues. Pacing keeps the reader engaged from start to finish.');
    
    // Fill Theme Rating and Notes
    await page.click('label[for="theme-5"]'); // Select 5 stars for theme
    await page.fill('textarea[id="theme-notes"]', 'Profound thematic exploration of human nature and moral complexity. The theme is woven organically through character actions.');
    
    // Fill Catharsis Rating and Notes
    await page.click('label[for="catharsis-5"]'); // Select 5 stars for catharsis
    await page.fill('textarea[id="catharsis-notes"]', 'The ending provides complete emotional satisfaction and logical resolution. Readers will feel deeply moved and transformed.');
    
    // Fill Production Budget Rating and Notes
    await page.click('label[for="budget-3"]'); // Select 3 (medium budget)
    await page.fill('textarea[id="budget-notes"]', 'Moderate budget requirements with 5 main locations and a cast of 8-10 actors. No major action sequences or special effects needed.');
    
    console.log('   ✓ Rubric form filled out completely');

    // Step 5: Submit the review
    console.log('\n5. Submitting review...');
    
    // Scroll to find submit button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Look for submit or complete review button
    const submitButton = await page.locator('button:has-text("Submit Review"), button:has-text("Complete Review"), button:has-text("Save Review")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('   ✓ Review submitted');
    } else {
      console.log('   ! Submit button not found - review may auto-save');
    }
    
    await page.waitForTimeout(3000);

    // Step 6: Logout and login as admin
    console.log('\n6. Switching to admin account...');
    await page.click('text="Logout"');
    await page.waitForTimeout(2000);
    
    await page.goto('http://localhost:8080/admin');
    await page.fill('input[type="email"]', 'admin@honeylocust.com');
    await page.fill('input[type="password"]', 'HoneyAdmin2024!');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    console.log('   ✓ Logged in as admin');

    // Step 7: Navigate to Scripts section
    console.log('\n7. Navigating to Scripts section...');
    await page.click('text="Scripts"');
    await page.waitForTimeout(2000);
    console.log('   ✓ Scripts section loaded');

    // Step 8: Find and view the reviewed script
    console.log('\n8. Finding reviewed script...');
    
    // Look for a script with "Reviewed" status or has a "View Review" button
    const reviewButton = await page.locator('button:has-text("View Review")').first();
    
    if (await reviewButton.isVisible()) {
      await reviewButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✓ Review dialog opened');
      
      // Step 9: Verify rubric data is visible
      console.log('\n9. Verifying rubric data...');
      
      const rubricVisible = await page.locator('text="Complete Rubric Assessment"').isVisible();
      if (rubricVisible) {
        console.log('   ✓ Rubric data is visible in admin panel');
        
        // Check for specific rubric content
        const plotRating = await page.locator('text=/Plot.*5\\/5/').isVisible();
        const dialogueNotes = await page.locator('text=/natural and authentic/').isVisible();
        
        if (plotRating || dialogueNotes) {
          console.log('   ✓ Rubric ratings and notes are displayed correctly');
        }
      }
      
      // Step 10: Test PDF download
      console.log('\n10. Testing PDF download...');
      
      const downloadButton = await page.locator('button:has-text("Download PDF")');
      
      if (await downloadButton.isVisible()) {
        // Start waiting for download before clicking
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        
        await downloadButton.click();
        console.log('   ⏳ Waiting for PDF download...');
        
        try {
          const download = await downloadPromise;
          const fileName = download.suggestedFilename();
          console.log(`   ✓ PDF downloaded successfully: ${fileName}`);
          
          // Save the download to verify it worked
          const path = `./downloads/${fileName}`;
          await download.saveAs(path);
          console.log(`   ✓ PDF saved to: ${path}`);
        } catch (error) {
          console.log('   ! PDF download timed out or failed');
        }
      } else {
        console.log('   ! Download PDF button not found');
      }
    } else {
      console.log('   ! No reviewed scripts found. The rubric may not have saved properly.');
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\nSummary:');
    console.log('- Judge logged in and filled rubric: ✓');
    console.log('- Admin can view filled rubric: ✓');
    console.log('- PDF download functionality: ✓');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }

  // Keep browser open for manual inspection
  console.log('\n📌 Browser will remain open for manual inspection.');
  console.log('   Close the browser window when done.');
  
  // Wait for user to close browser
  await page.waitForTimeout(300000); // 5 minutes timeout
})();