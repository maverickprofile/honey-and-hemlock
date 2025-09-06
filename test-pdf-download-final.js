const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting PDF Download Test with Pre-inserted Data...\n');
  
  // Launch browser in headed mode
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    acceptDownloads: true
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate directly to admin login
    console.log('1. Navigating to admin login...');
    await page.goto('http://localhost:8080/admin');
    await page.waitForTimeout(2000);
    
    // Step 2: Login as admin
    console.log('2. Logging in as admin...');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@honeylocust.com');
    await page.fill('input[type="password"]', 'HoneyAdmin2024!');
    
    // Click login button
    await page.click('button[type="submit"]');
    console.log('   ⏳ Waiting for dashboard to load...');
    await page.waitForTimeout(5000);
    
    // Check if we're logged in
    const dashboardVisible = await page.locator('text=/Dashboard|Overview|Scripts/i').first().isVisible().catch(() => false);
    if (dashboardVisible) {
      console.log('   ✓ Successfully logged in as admin');
    } else {
      console.log('   ⚠️ Dashboard not fully loaded, continuing anyway...');
    }
    
    // Step 3: Navigate to Scripts section
    console.log('\n3. Navigating to Scripts section...');
    
    // Try multiple selectors for Scripts
    const scriptsSelectors = [
      'button:has-text("Scripts")',
      'a:has-text("Scripts")',
      'text="Scripts"',
      '[data-tab="scripts"]',
      '.tab-trigger:has-text("Scripts")'
    ];
    
    let scriptsClicked = false;
    for (const selector of scriptsSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        await element.click();
        scriptsClicked = true;
        console.log(`   ✓ Clicked Scripts using: ${selector}`);
        break;
      }
    }
    
    if (!scriptsClicked) {
      console.log('   ⚠️ Could not find Scripts button, trying to navigate directly...');
      await page.goto('http://localhost:8080/admin#scripts');
    }
    
    await page.waitForTimeout(3000);
    
    // Step 4: Look for the test script we just inserted
    console.log('\n4. Looking for reviewed scripts...');
    
    // Look for our test script "RLS Test with Roles" or any reviewed script
    const scriptTitleVisible = await page.locator('text=/RLS Test with Roles|Test Masterpiece/i').first().isVisible().catch(() => false);
    if (scriptTitleVisible) {
      console.log('   ✓ Found the test script');
    }
    
    // Step 5: Find and click View Review button
    console.log('\n5. Looking for View Review button...');
    
    // Try multiple selectors for View Review
    const viewSelectors = [
      'button:has-text("View Review")',
      'button[title*="View"]',
      'button:has(svg.lucide-eye)',
      'button:has(svg[class*="eye"])',
      '[aria-label*="View review"]'
    ];
    
    let viewClicked = false;
    for (const selector of viewSelectors) {
      const buttons = await page.locator(selector).all();
      if (buttons.length > 0) {
        // Click the first view button found
        await buttons[0].click();
        viewClicked = true;
        console.log(`   ✓ Clicked View Review button`);
        break;
      }
    }
    
    if (!viewClicked) {
      // Try clicking on eye icon directly
      const eyeIcon = await page.locator('svg').filter({ hasText: /eye/i }).first();
      if (await eyeIcon.isVisible().catch(() => false)) {
        await eyeIcon.click();
        viewClicked = true;
        console.log('   ✓ Clicked eye icon');
      }
    }
    
    if (!viewClicked) {
      console.log('   ❌ Could not find View Review button');
      console.log('   Note: Make sure there are reviewed scripts in the list');
    }
    
    await page.waitForTimeout(3000);
    
    // Step 6: Check if review dialog opened
    console.log('\n6. Checking if review dialog opened...');
    
    const dialogIndicators = [
      'text=/Script Review|Rubric Assessment/i',
      'text=/Overall Assessment|Complete Rubric/i',
      'text=/Plot.*Rating|Characters.*Rating/i',
      'text="Download PDF"'
    ];
    
    let dialogOpen = false;
    for (const indicator of dialogIndicators) {
      if (await page.locator(indicator).first().isVisible().catch(() => false)) {
        dialogOpen = true;
        console.log(`   ✓ Review dialog is open`);
        break;
      }
    }
    
    if (!dialogOpen) {
      console.log('   ⚠️ Review dialog may not have opened fully');
    }
    
    // Step 7: Look for and click Download PDF button
    console.log('\n7. Testing PDF download...');
    
    const pdfSelectors = [
      'button:has-text("Download PDF")',
      'button:has(svg.lucide-file-down)',
      'button:has-text("Export PDF")',
      'button[class*="green"]:has-text("Download")'
    ];
    
    let downloadInitiated = false;
    for (const selector of pdfSelectors) {
      const button = await page.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        console.log(`   ✓ Found Download PDF button`);
        
        // Set up download promise
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
        
        // Click the button
        await button.click();
        console.log('   ⏳ Waiting for download...');
        
        // Wait for download
        const download = await downloadPromise;
        
        if (download) {
          const fileName = download.suggestedFilename();
          console.log(`   ✅ PDF downloaded successfully!`);
          console.log(`   📄 Filename: ${fileName}`);
          
          // Save the file
          const savePath = `./downloads/${fileName}`;
          await download.saveAs(savePath);
          console.log(`   💾 Saved to: ${savePath}`);
          downloadInitiated = true;
        } else {
          console.log('   ⚠️ Download did not complete within timeout');
        }
        break;
      }
    }
    
    if (!downloadInitiated) {
      console.log('   ❌ Download PDF button not found');
      console.log('   Please check that:');
      console.log('   1. The review dialog opened correctly');
      console.log('   2. The Download PDF button is visible');
      console.log('   3. The exportRubricToPDF function is imported correctly');
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    if (downloadInitiated) {
      console.log('✅ SUCCESS: PDF download functionality is working!');
      console.log('\nThe rubric PDF has been downloaded successfully.');
      console.log('Check the ./downloads folder for the PDF file.');
    } else {
      console.log('⚠️ PARTIAL SUCCESS: Some steps may have failed.');
      console.log('\nTroubleshooting tips:');
      console.log('1. Manually check if you can login as admin');
      console.log('2. Verify Scripts section shows reviewed scripts');
      console.log('3. Check if View Review button opens the dialog');
      console.log('4. Look for the green Download PDF button in the dialog');
    }
    
    console.log('\n📌 Browser will stay open for 1 minute for manual inspection.');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  // Keep browser open for inspection
  await page.waitForTimeout(60000); // 1 minute
  
  await browser.close();
  console.log('\n✅ Test completed and browser closed.');
})();