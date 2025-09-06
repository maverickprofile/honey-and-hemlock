const { chromium } = require('playwright');

(async () => {
  console.log('Starting Simplified Rubric PDF Test...');
  
  // Launch browser in headed mode
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slower to see what's happening
  });
  
  const context = await browser.newContext({
    acceptDownloads: true
  });
  const page = await context.newPage();

  try {
    // Step 1: Go directly to contractor login
    console.log('\n1. Navigating to contractor login...');
    await page.goto('http://localhost:8080/contractor');
    await page.waitForTimeout(3000);
    
    // Check current page
    const currentUrl = page.url();
    console.log('   Current URL:', currentUrl);
    
    // Step 2: Try to login as contractor/judge
    console.log('\n2. Attempting contractor login...');
    
    // Look for email and password fields
    const emailField = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordField = await page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailField.isVisible() && await passwordField.isVisible()) {
      // Try some test credentials
      await emailField.fill('test@example.com');
      await passwordField.fill('password123');
      
      // Find and click login button
      const loginButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(3000);
        console.log('   ✓ Login attempt made');
      }
    } else {
      console.log('   ! Login form not found, navigating to admin instead...');
    }
    
    // Step 3: Try admin login instead
    console.log('\n3. Attempting admin login...');
    await page.goto('http://localhost:8080/admin');
    await page.waitForTimeout(3000);
    
    // Check for login form
    const adminEmail = await page.locator('input[type="email"], input[name="email"]').first();
    const adminPassword = await page.locator('input[type="password"], input[name="password"]').first();
    
    if (await adminEmail.isVisible() && await adminPassword.isVisible()) {
      await adminEmail.fill('admin@honeylocust.com');
      await adminPassword.fill('HoneyAdmin2024!');
      
      const adminLoginBtn = await page.locator('button[type="submit"], button:has-text("Sign In")').first();
      if (await adminLoginBtn.isVisible()) {
        await adminLoginBtn.click();
        console.log('   ⏳ Logging in as admin...');
        await page.waitForTimeout(5000);
        
        // Check if login successful
        const dashboardVisible = await page.locator('text=/Dashboard|Scripts|Contractors/i').first().isVisible().catch(() => false);
        if (dashboardVisible) {
          console.log('   ✓ Admin login successful');
        } else {
          console.log('   ! Admin login may have failed');
        }
      }
    }
    
    // Step 4: Navigate to Scripts section
    console.log('\n4. Looking for Scripts section...');
    
    // Try different selectors for Scripts navigation
    const scriptsLink = await page.locator('text="Scripts", button:has-text("Scripts"), a:has-text("Scripts")').first();
    
    if (await scriptsLink.isVisible()) {
      await scriptsLink.click();
      await page.waitForTimeout(3000);
      console.log('   ✓ Navigated to Scripts section');
      
      // Step 5: Look for any reviewed scripts
      console.log('\n5. Searching for reviewed scripts...');
      
      // Look for View Review buttons or Eye icons
      const viewReviewBtn = await page.locator('button:has-text("View Review"), button[title*="View"], svg.lucide-eye').first();
      
      if (await viewReviewBtn.isVisible()) {
        console.log('   ✓ Found a reviewed script');
        await viewReviewBtn.click();
        await page.waitForTimeout(3000);
        
        // Step 6: Check if review dialog opened
        console.log('\n6. Checking review dialog...');
        
        const dialogVisible = await page.locator('text=/Script Review|Rubric Assessment|Overall Assessment/i').first().isVisible().catch(() => false);
        
        if (dialogVisible) {
          console.log('   ✓ Review dialog is open');
          
          // Step 7: Look for Download PDF button
          console.log('\n7. Looking for Download PDF button...');
          
          const downloadPdfBtn = await page.locator('button:has-text("Download PDF"), button:has(svg.lucide-file-down)').first();
          
          if (await downloadPdfBtn.isVisible()) {
            console.log('   ✓ Download PDF button found!');
            
            // Setup download handler
            const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
            
            // Click download button
            await downloadPdfBtn.click();
            console.log('   ⏳ Attempting PDF download...');
            
            const download = await downloadPromise;
            if (download) {
              const fileName = download.suggestedFilename();
              console.log(`   ✓ PDF download initiated: ${fileName}`);
              
              // Save the file
              await download.saveAs(`./downloads/${fileName}`);
              console.log(`   ✓ PDF saved successfully!`);
            } else {
              console.log('   ! PDF download did not complete');
            }
          } else {
            console.log('   ! Download PDF button not found');
            console.log('   Note: Make sure a script has been reviewed with rubric data');
          }
        } else {
          console.log('   ! Review dialog did not open');
          console.log('   Note: There may be no reviewed scripts in the system');
        }
      } else {
        console.log('   ! No reviewed scripts found');
        console.log('   Note: You need to have at least one script with a completed review');
      }
    } else {
      console.log('   ! Scripts section not found');
      console.log('   Current page title:', await page.title());
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY:');
    console.log('='.repeat(50));
    console.log('The test has completed. Check the results above.');
    console.log('\nIf the PDF download was successful, check the ./downloads folder');
    console.log('If not, ensure that:');
    console.log('1. There is at least one script in the system');
    console.log('2. The script has been assigned to a judge');
    console.log('3. The judge has filled out the rubric');
    console.log('4. The admin can see the review');
    
  } catch (error) {
    console.error('\n❌ Test encountered an error:', error.message);
    console.error('Stack:', error.stack);
  }

  // Keep browser open
  console.log('\n📌 Browser will remain open for 2 minutes for inspection.');
  console.log('   You can manually test the functionality.');
  
  await page.waitForTimeout(120000); // 2 minutes
  
  await browser.close();
  console.log('✅ Test completed and browser closed.');
})();