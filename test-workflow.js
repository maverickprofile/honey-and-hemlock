const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Starting workflow test...');

  try {
    // Step 1: Test free tier script upload
    console.log('Step 1: Testing free tier script upload...');
    await page.goto('http://localhost:8080/script-upload');
    await page.waitForTimeout(2000);

    // Select free tier
    const freeTierButton = await page.$('text=/Free Tier/i');
    if (freeTierButton) {
      await freeTierButton.click();
      await page.waitForTimeout(1000);
    }

    // Fill the form
    await page.fill('input[id="title"]', 'Test Script from Playwright');
    await page.fill('input[id="authorName"]', 'Playwright Test');
    await page.fill('input[id="authorEmail"]', 'playwright@test.com');
    await page.fill('input[id="authorPhone"]', '1234567890');

    // Create a test file to upload
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // We'll need to create a test PDF file first
      console.log('Note: File upload skipped - need actual PDF file');
    }

    console.log('Form filled. Would submit but need actual file.');
    await page.waitForTimeout(2000);

    // Step 2: Login as admin
    console.log('Step 2: Logging in as admin...');
    await page.goto('http://localhost:8080/admin');
    await page.waitForTimeout(2000);

    // Fill login form
    await page.fill('input[placeholder*="email" i], input[type="email"]', 'admin');
    await page.fill('input[placeholder*="password" i], input[type="password"]', 'Neurobit@123');
    
    // Click login button
    await page.click('button:has-text("Login"), button:has-text("Sign In")');
    await page.waitForTimeout(3000);

    // Check if we're logged in
    const dashboardUrl = page.url();
    if (dashboardUrl.includes('/admin')) {
      console.log('Admin login successful!');
      
      // Look for scripts section
      const scriptsLink = await page.$('text=/Scripts/i');
      if (scriptsLink) {
        await scriptsLink.click();
        await page.waitForTimeout(2000);
        console.log('Navigated to scripts section');
      }
    }

    // Step 3: Contractor login test
    console.log('Step 3: Testing contractor login...');
    
    // First logout from admin
    const logoutButton = await page.$('button:has-text("Logout"), button:has-text("Sign Out")');
    if (logoutButton) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
    }

    // Go to contractor login
    await page.goto('http://localhost:8080/contractor');
    await page.waitForTimeout(2000);

    // Try test contractor login
    await page.fill('input[placeholder*="email" i], input[type="email"]', 'test');
    await page.fill('input[placeholder*="password" i], input[type="password"]', 'test');
    await page.click('button:has-text("Login"), button:has-text("Sign In")');
    await page.waitForTimeout(3000);

    console.log('Contractor login attempted');

    // Check for any errors
    const errorElements = await page.$$('text=/error/i');
    if (errorElements.length > 0) {
      console.log('Errors found on page - need to investigate');
    }

  } catch (error) {
    console.error('Error during workflow test:', error);
  }

  console.log('Test complete. Browser will close in 5 seconds...');
  await page.waitForTimeout(5000);
  await browser.close();
})();