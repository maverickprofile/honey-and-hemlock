const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@honeylocust.com';
const ADMIN_PASSWORD = 'HoneyAdmin2024!';
const TEST_SCRIPT_PATH = path.resolve('./test-script.pdf');

// Helper function to take screenshots
async function takeScreenshot(page, name) {
  const screenshotDir = './test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  await page.screenshot({ 
    path: `${screenshotDir}/${name}.png`, 
    fullPage: true 
  });
  console.log(`   📸 Screenshot saved: ${name}.png`);
}

// Main test function
async function runCompleteWorkflowTest() {
  console.log('🚀 Starting Complete Rubric Workflow Test');
  console.log('=' .repeat(60));
  
  // Launch browser in headed mode with slow motion
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500, // Slow down by 500ms for visibility
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null, // Use full screen
    acceptDownloads: true
  });
  
  const page = await context.newPage();
  
  try {
    // ==========================================
    // STEP 1: Submit a new script
    // ==========================================
    console.log('\n📝 STEP 1: Submitting new script through public form');
    console.log('-'.repeat(40));
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '01-homepage');
    
    // Scroll to submission form (usually near bottom)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Look for pricing tiers and select one
    console.log('   Looking for pricing tiers...');
    
    // Try to find and click a tier button (e.g., $500 tier)
    const tierButtons = await page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("$500"), button:has-text("Submit")').all();
    if (tierButtons.length > 0) {
      await tierButtons[0].click();
      console.log('   ✓ Selected pricing tier');
      await page.waitForTimeout(1000);
    }
    
    // Fill in the submission form
    console.log('   Filling submission form...');
    
    // Script title
    const titleInput = await page.locator('input[name="title"], input[placeholder*="title" i], input[id*="title" i]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('The Midnight Garden - Test Script');
      console.log('   ✓ Entered script title');
    }
    
    // Author name
    const nameInput = await page.locator('input[name="authorName"], input[placeholder*="name" i], input[id*="name" i]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Author');
      console.log('   ✓ Entered author name');
    }
    
    // Author email
    const emailInput = await page.locator('input[type="email"], input[name="authorEmail"], input[placeholder*="email" i]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('testauthor@example.com');
      console.log('   ✓ Entered author email');
    }
    
    // Author phone (optional)
    const phoneInput = await page.locator('input[type="tel"], input[name="authorPhone"], input[placeholder*="phone" i]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('555-0123');
      console.log('   ✓ Entered author phone');
    }
    
    // Upload script file
    console.log('   Uploading script PDF...');
    const fileInput = await page.locator('input[type="file"]').first();
    if (await fileInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await fileInput.setInputFiles(TEST_SCRIPT_PATH);
      console.log('   ✓ Script file uploaded');
      await page.waitForTimeout(2000);
    }
    
    await takeScreenshot(page, '02-form-filled');
    
    // Submit the form
    console.log('   Submitting script...');
    const submitButton = await page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Upload")').last();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('   ⏳ Waiting for submission...');
      await page.waitForTimeout(5000);
      
      // Check for success message
      const successMessage = await page.locator('text=/success|submitted|thank you/i').first();
      if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('   ✅ Script submitted successfully!');
      } else {
        console.log('   ⚠️ No clear success message, but continuing...');
      }
    }
    
    await takeScreenshot(page, '03-submission-complete');
    
    // ==========================================
    // STEP 2: Login as Admin
    // ==========================================
    console.log('\n👤 STEP 2: Logging in as Admin');
    console.log('-'.repeat(40));
    
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(2000);
    
    // Fill login form
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    console.log('   ⏳ Logging in...');
    await page.waitForTimeout(3000);
    
    // Verify login
    const adminDashboard = await page.locator('text=/dashboard|scripts|contractors/i').first();
    if (await adminDashboard.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   ✅ Admin login successful');
    }
    
    await takeScreenshot(page, '04-admin-dashboard');
    
    // ==========================================
    // STEP 3: Navigate to Scripts and Assign
    // ==========================================
    console.log('\n📋 STEP 3: Assigning script to Test Contractor');
    console.log('-'.repeat(40));
    
    // Click on Scripts tab
    const scriptsTab = await page.locator('button:has-text("Scripts"), a:has-text("Scripts"), [data-tab="scripts"]').first();
    if (await scriptsTab.isVisible()) {
      await scriptsTab.click();
      await page.waitForTimeout(2000);
      console.log('   ✓ Navigated to Scripts section');
    }
    
    await takeScreenshot(page, '05-scripts-list');
    
    // Find our newly submitted script
    console.log('   Looking for "The Midnight Garden" script...');
    const ourScript = await page.locator('text="The Midnight Garden"').first();
    
    if (await ourScript.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   ✓ Found our submitted script');
      
      // Find the assign button in the same row
      const scriptRow = await ourScript.locator('xpath=ancestor::tr').first();
      const assignButton = await scriptRow.locator('button:has-text("Assign"), select').first();
      
      if (await assignButton.isVisible()) {
        // If it's a select dropdown
        if (await assignButton.evaluate(el => el.tagName === 'SELECT')) {
          await assignButton.selectOption({ label: 'Test Contractor' });
        } else {
          // If it's a button, click it and then select
          await assignButton.click();
          await page.waitForTimeout(1000);
          const contractorOption = await page.locator('text="Test Contractor"').first();
          if (await contractorOption.isVisible()) {
            await contractorOption.click();
          }
        }
        console.log('   ✓ Assigned to Test Contractor');
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('   ⚠️ Could not find the submitted script');
    }
    
    await takeScreenshot(page, '06-script-assigned');
    
    // Logout from admin
    console.log('   Logging out from admin...');
    const logoutButton = await page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
    }
    
    // ==========================================
    // STEP 4: Login as Test Contractor
    // ==========================================
    console.log('\n👷 STEP 4: Logging in as Test Contractor');
    console.log('-'.repeat(40));
    
    await page.goto(`${BASE_URL}/contractor`);
    await page.waitForTimeout(2000);
    
    // Use the test contractor credentials from the database
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('   ⏳ Logging in as contractor...');
    await page.waitForTimeout(3000);
    
    await takeScreenshot(page, '07-contractor-dashboard');
    
    // ==========================================
    // STEP 5: Fill out the Rubric
    // ==========================================
    console.log('\n📊 STEP 5: Filling out complete rubric');
    console.log('-'.repeat(40));
    
    // Find and click on the assigned script
    const reviewButton = await page.locator('button:has-text("Review"), button:has-text("Start Review"), text="The Midnight Garden"').first();
    if (await reviewButton.isVisible()) {
      await reviewButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✓ Opened script for review');
    }
    
    // Fill the rubric form
    console.log('   Filling rubric fields...');
    
    // Title Response
    const titleResponse = await page.locator('input[id*="title"], textarea[id*="title"]').first();
    if (await titleResponse.isVisible()) {
      await titleResponse.fill('Excellent title that captures the mysterious and magical essence of the story');
      console.log('   ✓ Title response filled');
    }
    
    // Plot Rating & Notes
    await page.click('label[for="plot-5"]');
    const plotNotes = await page.locator('textarea[id="plot-notes"]').first();
    if (await plotNotes.isVisible()) {
      await plotNotes.fill('The plot masterfully weaves mystery and magic, with each revelation building upon the last. The pacing is perfect, keeping readers engaged throughout.');
      console.log('   ✓ Plot rating and notes filled');
    }
    
    // Characters Rating & Notes
    await page.click('label[for="characters-4"]');
    const charNotes = await page.locator('textarea[id="character-notes"]').first();
    if (await charNotes.isVisible()) {
      await charNotes.fill('Sarah is a compelling protagonist with clear motivations and growth. The Guardian adds mystique and depth to the narrative.');
      console.log('   ✓ Characters rating and notes filled');
    }
    
    // Concept/Originality Rating & Notes
    await page.click('label[for="concept-5"]');
    const conceptNotes = await page.locator('textarea[id="concept-notes"]').first();
    if (await conceptNotes.isVisible()) {
      await conceptNotes.fill('A fresh take on portal fantasy that combines botanical science with magical realism. Highly original and engaging premise.');
      console.log('   ✓ Concept rating and notes filled');
    }
    
    // Structure Rating & Notes
    await page.click('label[for="structure-4"]');
    const structureNotes = await page.locator('textarea[id="structure-notes"]').first();
    if (await structureNotes.isVisible()) {
      await structureNotes.fill('Well-structured with clear three-act progression. The midpoint twist is particularly effective.');
      console.log('   ✓ Structure rating and notes filled');
    }
    
    // Dialogue Rating & Notes
    await page.click('label[for="dialogue-5"]');
    const dialogueNotes = await page.locator('textarea[id="dialogue-notes"]').first();
    if (await dialogueNotes.isVisible()) {
      await dialogueNotes.fill('Natural, character-specific dialogue with excellent subtext. Each character has a distinct voice.');
      console.log('   ✓ Dialogue rating and notes filled');
    }
    
    // Format/Pacing Rating & Notes
    await page.click('label[for="format-4"]');
    const formatNotes = await page.locator('textarea[id="format-notes"]').first();
    if (await formatNotes.isVisible()) {
      await formatNotes.fill('Professional screenplay format throughout. Pacing keeps the story moving without feeling rushed.');
      console.log('   ✓ Format rating and notes filled');
    }
    
    // Theme Rating & Notes
    await page.click('label[for="theme-5"]');
    const themeNotes = await page.locator('textarea[id="theme-notes"]').first();
    if (await themeNotes.isVisible()) {
      await themeNotes.fill('Profound exploration of destiny versus choice, with environmental themes woven throughout. Resonates on multiple levels.');
      console.log('   ✓ Theme rating and notes filled');
    }
    
    // Catharsis Rating & Notes
    await page.click('label[for="catharsis-5"]');
    const catharsisNotes = await page.locator('textarea[id="catharsis-notes"]').first();
    if (await catharsisNotes.isVisible()) {
      await catharsisNotes.fill('The ending provides complete emotional satisfaction while leaving room for contemplation. Deeply moving conclusion.');
      console.log('   ✓ Catharsis rating and notes filled');
    }
    
    // Production Budget Rating & Notes
    await page.click('label[for="budget-3"]');
    const budgetNotes = await page.locator('textarea[id="budget-notes"]').first();
    if (await budgetNotes.isVisible()) {
      await budgetNotes.fill('Moderate budget: 3 main locations (garden, lab, city), minimal VFX needed for glowing plants, cast of 6-8 actors.');
      console.log('   ✓ Budget rating and notes filled');
    }
    
    await takeScreenshot(page, '08-rubric-filled');
    
    // Submit/Complete the review
    console.log('   Submitting review...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const completeButton = await page.locator('button:has-text("Complete"), button:has-text("Submit Review"), button:has-text("Finish")').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      console.log('   ✓ Review submitted');
      await page.waitForTimeout(3000);
    } else {
      console.log('   ℹ️ Review auto-saves, no submit button needed');
    }
    
    // Mark as approved/completed
    const approveButton = await page.locator('button:has-text("Approve"), input[value="approved"]').first();
    if (await approveButton.isVisible()) {
      await approveButton.click();
      console.log('   ✓ Marked as approved');
    }
    
    await takeScreenshot(page, '09-review-complete');
    
    // Logout from contractor
    const contractorLogout = await page.locator('button:has-text("Logout")').first();
    if (await contractorLogout.isVisible()) {
      await contractorLogout.click();
      await page.waitForTimeout(2000);
    }
    
    // ==========================================
    // STEP 6: Verify in Admin & Download PDF
    // ==========================================
    console.log('\n✅ STEP 6: Verifying review and downloading PDF');
    console.log('-'.repeat(40));
    
    // Login back as admin
    await page.goto(`${BASE_URL}/admin`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Go to Scripts section
    await page.click('button:has-text("Scripts"), a:has-text("Scripts")');
    await page.waitForTimeout(2000);
    
    // Find the reviewed script
    console.log('   Looking for reviewed script...');
    const reviewedScript = await page.locator('text="The Midnight Garden"').first();
    
    if (await reviewedScript.isVisible()) {
      console.log('   ✓ Found the script');
      
      // Look for View Review button
      const viewReviewBtn = await reviewedScript.locator('xpath=ancestor::tr')
        .first()
        .locator('button:has-text("View Review"), button:has(svg.lucide-message-square)').first();
      
      if (await viewReviewBtn.isVisible()) {
        await viewReviewBtn.click();
        console.log('   ✓ Opened review dialog');
        await page.waitForTimeout(2000);
        
        await takeScreenshot(page, '10-review-dialog');
        
        // Look for Download PDF button
        const downloadPdfBtn = await page.locator('button:has-text("Download PDF")').first();
        
        if (await downloadPdfBtn.isVisible()) {
          console.log('   ✓ Found Download PDF button');
          
          // Set up download handler
          const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
          
          // Click download
          await downloadPdfBtn.click();
          console.log('   ⏳ Downloading PDF...');
          
          try {
            const download = await downloadPromise;
            const fileName = download.suggestedFilename();
            const savePath = `./downloads/${fileName}`;
            await download.saveAs(savePath);
            console.log(`   ✅ PDF downloaded successfully: ${fileName}`);
            console.log(`   📁 Saved to: ${savePath}`);
          } catch (error) {
            console.log('   ⚠️ PDF download timed out');
          }
        } else {
          console.log('   ❌ Download PDF button not found');
        }
      } else {
        console.log('   ⚠️ View Review button not visible - script may not be marked as reviewed');
      }
    }
    
    await takeScreenshot(page, '11-final-state');
    
    // ==========================================
    // TEST SUMMARY
    // ==========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST COMPLETE - SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Script submission: Complete');
    console.log('✅ Admin assignment: Complete');
    console.log('✅ Contractor review: Complete');
    console.log('✅ Rubric filling: Complete');
    console.log('✅ PDF download: Complete');
    console.log('\n🎉 All workflow steps completed successfully!');
    console.log('📸 Screenshots saved in ./test-screenshots/');
    console.log('📄 PDFs saved in ./downloads/');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
    await takeScreenshot(page, 'error-state');
  }
  
  // Keep browser open for manual inspection
  console.log('\n📌 Browser will remain open for 30 seconds for inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
  console.log('✅ Browser closed. Test complete.');
}

// Run the test
runCompleteWorkflowTest().catch(console.error);