const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create a test PDF file
function createTestPDF() {
  // Create a simple text file that we'll rename as PDF for testing
  const testContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test Script) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
365
%%EOF`;
  
  const filePath = path.join(__dirname, 'test-script.pdf');
  fs.writeFileSync(filePath, testContent);
  return filePath;
}

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions to see what's happening
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Starting complete workflow test...');

  try {
    // Create test PDF
    const testPdfPath = createTestPDF();
    console.log('Test PDF created at:', testPdfPath);

    // Step 1: Upload script with free tier
    console.log('\n=== Step 1: Uploading script with free tier ===');
    await page.goto('http://localhost:8080/pricing');
    await page.waitForTimeout(2000);

    // Click on Free Tier
    const selectButtons = await page.$$('button:has-text("Select")');
    if (selectButtons.length > 0) {
      await selectButtons[0].click(); // First button should be free tier
      console.log('Selected Free Tier');
      await page.waitForTimeout(2000);
    }

    // Check if we're on script upload page
    if (page.url().includes('script-upload')) {
      console.log('Navigated to script upload page');
      
      // Fill the form
      await page.fill('input[id="title"]', `Test Script ${Date.now()}`);
      await page.fill('input[id="authorName"]', 'Test Author');
      await page.fill('input[id="authorEmail"]', `test${Date.now()}@example.com`);
      await page.fill('input[id="authorPhone"]', '1234567890');

      // Upload file
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(testPdfPath);
        console.log('File selected for upload');
      }

      // Submit form
      const submitButton = await page.$('button:has-text("Upload Script")');
      if (submitButton) {
        console.log('Clicking upload button...');
        await submitButton.click();
        await page.waitForTimeout(5000);
        
        // Check for success or error
        const toastMessage = await page.$('.toast-message, [role="alert"]');
        if (toastMessage) {
          const message = await toastMessage.textContent();
          console.log('Upload result:', message);
        }
      }
    }

    // Step 2: Admin login and script assignment
    console.log('\n=== Step 2: Admin login ===');
    await page.goto('http://localhost:8080/admin');
    await page.waitForTimeout(2000);

    // Fill admin login
    const emailInput = await page.$('input[placeholder*="email" i], input[placeholder*="username" i], input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[placeholder*="password" i], input[type="password"], input[name="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.fill('admin');
      await passwordInput.fill('Neurobit@123');
      
      const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      if (loginButton) {
        await loginButton.click();
        console.log('Admin login submitted');
        await page.waitForTimeout(3000);
      }
    }

    // Check if logged in
    if (page.url().includes('admin') && !page.url().includes('login')) {
      console.log('Admin logged in successfully');
      
      // Navigate to scripts
      const scriptsTab = await page.$('text=/Scripts/i') || await page.$('a[href*="scripts"]');
      if (scriptsTab) {
        await scriptsTab.click();
        await page.waitForTimeout(2000);
        console.log('Navigated to scripts section');
        
        // Find unassigned scripts
        const unassignedScripts = await page.$$('tr:has-text("Unassigned"), tr:has-text("pending")');
        if (unassignedScripts.length > 0) {
          console.log(`Found ${unassignedScripts.length} unassigned scripts`);
          
          // Click on first unassigned script to assign
          const assignButton = await unassignedScripts[0].$('button:has-text("Assign"), button:has-text("Edit")');
          if (assignButton) {
            await assignButton.click();
            await page.waitForTimeout(2000);
            
            // Select Test Contractor
            const contractorSelect = await page.$('select, [role="combobox"]');
            if (contractorSelect) {
              await contractorSelect.selectOption({ label: 'Test Contractor' });
              console.log('Selected Test Contractor');
              
              // Save assignment
              const saveButton = await page.$('button:has-text("Save"), button:has-text("Assign")');
              if (saveButton) {
                await saveButton.click();
                console.log('Assignment saved');
                await page.waitForTimeout(2000);
              }
            }
          }
        }
      }
    }

    // Step 3: Logout and login as contractor
    console.log('\n=== Step 3: Contractor login ===');
    
    // Logout from admin
    const logoutButton = await page.$('button:has-text("Logout"), button:has-text("Sign Out")');
    if (logoutButton) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      console.log('Logged out from admin');
    }

    // Go to contractor login
    await page.goto('http://localhost:8080/contractor');
    await page.waitForTimeout(2000);

    // Login as test contractor
    const contractorEmail = await page.$('input[placeholder*="email" i], input[type="email"], input[name="email"]');
    const contractorPassword = await page.$('input[placeholder*="password" i], input[type="password"], input[name="password"]');
    
    if (contractorEmail && contractorPassword) {
      await contractorEmail.fill('test');
      await contractorPassword.fill('test');
      
      const contractorLoginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      if (contractorLoginButton) {
        await contractorLoginButton.click();
        console.log('Contractor login submitted');
        await page.waitForTimeout(3000);
      }
    }

    // Check if contractor can see assigned scripts
    if (page.url().includes('contractor') && !page.url().includes('login')) {
      console.log('Contractor logged in successfully');
      
      // Look for assigned scripts
      const assignedScripts = await page.$$('tr, [role="row"], .script-item');
      console.log(`Contractor can see ${assignedScripts.length} scripts`);
      
      if (assignedScripts.length > 0) {
        console.log('✅ Workflow complete! Contractor can see assigned scripts.');
      } else {
        console.log('⚠️ No scripts visible to contractor');
      }
    }

    // Check for any errors on page
    const errors = await page.$$('text=/error/i, text=/denied/i, [role="alert"]');
    if (errors.length > 0) {
      console.log('\n⚠️ Errors found on page:');
      for (const error of errors) {
        const errorText = await error.textContent();
        console.log('  -', errorText);
      }
    } else {
      console.log('\n✅ No errors found!');
    }

  } catch (error) {
    console.error('\n❌ Error during workflow test:', error);
  }

  console.log('\n Test complete. Browser will remain open for inspection.');
  console.log('Press Ctrl+C to close.');
  
  // Keep browser open for manual inspection
  await page.waitForTimeout(300000); // 5 minutes
})();