const { chromium } = require('playwright');

async function testRubricVisibility() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    devtools: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`Browser console error:`, msg.text());
    }
  });

  console.log('Starting rubric visibility test...');

  try {
    // Step 1: Login as admin
    console.log('\n=== Step 1: Login as Admin ===');
    await page.goto('http://localhost:8080/admin');
    await page.waitForTimeout(2000);

    // Try to find login fields
    const emailInput = await page.$('input[type="email"], input[placeholder*="email" i], input[name="email"]');
    const passwordInput = await page.$('input[type="password"], input[placeholder*="password" i], input[name="password"]');
    
    if (emailInput && passwordInput) {
      console.log('Found login fields, entering admin credentials...');
      await emailInput.fill('admin');
      await passwordInput.fill('Neurobit@123');
      
      const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      if (loginButton) {
        await loginButton.click();
        console.log('Login submitted');
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('No login fields found, may already be logged in');
    }

    // Check if we're on the admin dashboard
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Step 2: Upload test scripts with different tiers
    console.log('\n=== Step 2: Creating test scripts with different tiers ===');
    
    // We'll use the existing test script and update its tier
    // First, let's go to contractor dashboard as Test Contractor
    console.log('Switching to contractor view...');
    await page.goto('http://localhost:8080/contractor');
    await page.waitForTimeout(2000);
    
    // Login as test contractor
    const contractorEmail = await page.$('input[type="email"], input[placeholder*="email" i], input[name="email"]');
    const contractorPassword = await page.$('input[type="password"], input[placeholder*="password" i], input[name="password"]');
    
    if (contractorEmail && contractorPassword) {
      console.log('Logging in as test contractor...');
      await contractorEmail.fill('test');
      await contractorPassword.fill('test');
      
      const loginBtn = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      if (loginBtn) {
        await loginBtn.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Step 3: Find and open the script
    console.log('\n=== Step 3: Opening script to view PDF and rubric ===');
    
    // Look for the script "dfffw"
    const scriptCard = await page.$('text=/dfffw/i');
    if (scriptCard) {
      console.log('Found script "dfffw"');
      
      // Click View & Review button
      const reviewButton = await page.$('button:has-text("View & Review")');
      if (reviewButton) {
        console.log('Clicking View & Review button...');
        await reviewButton.click();
        await page.waitForTimeout(5000);
        
        // Step 4: Check if PDF viewer is displayed
        console.log('\n=== Step 4: Checking PDF viewer and rubric visibility ===');
        
        // Check if PDF canvas is present
        const pdfCanvas = await page.$('canvas');
        if (pdfCanvas) {
          console.log('✅ PDF canvas found - PDF is rendering');
        } else {
          // Check for PDF error
          const errorMessage = await page.$('text=/Failed to load PDF/i, text=/Unable to load/i');
          if (errorMessage) {
            console.log('❌ PDF loading error found');
          } else {
            console.log('⚠️ No PDF canvas or error found');
          }
        }
        
        // Step 5: Scroll down to check for rubric
        console.log('\n=== Step 5: Scrolling to check for rubric ===');
        
        // First check if page is scrollable
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        console.log(`Page height: ${pageHeight}, Viewport height: ${viewportHeight}`);
        
        if (pageHeight > viewportHeight) {
          console.log('Page is scrollable, scrolling down...');
          
          // Scroll to bottom
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(2000);
          
          // Check for rubric form
          const rubricTitle = await page.$('text=/Judging Rubric/i');
          if (rubricTitle) {
            console.log('✅ Rubric form found!');
            
            // Check which type of rubric
            const perPageIndicator = await page.$('text=/Page 1 of/i, text=/Page.*of.*[0-9]/i');
            if (perPageIndicator) {
              console.log('✅ Per-page rubric detected (for $1000 tier)');
            } else {
              console.log('✅ Standard rubric detected (for $500/$750 tier)');
            }
            
            // Check if rubric fields are visible
            const plotField = await page.$('text=/PLOT/');
            const characterField = await page.$('text=/CHARACTER/');
            const dialogueField = await page.$('text=/DIALOGUE/');
            
            if (plotField && characterField && dialogueField) {
              console.log('✅ Rubric fields are visible');
            } else {
              console.log('⚠️ Some rubric fields may not be visible');
            }
            
            // Try to fill in a field to test functionality
            const titleInput = await page.$('input[placeholder*="Short answer text"]');
            if (titleInput) {
              await titleInput.fill('Test Title Response');
              console.log('✅ Successfully filled rubric field');
            }
            
          } else {
            console.log('❌ Rubric form NOT found after scrolling');
            
            // Try to find any element with "rubric" text
            const anyRubricText = await page.$('text=/rubric/i');
            if (anyRubricText) {
              console.log('⚠️ Found some rubric-related text but not the form');
            }
          }
        } else {
          console.log('⚠️ Page is not scrollable - rubric might be hidden');
          
          // Check if rubric exists in DOM but is not visible
          const rubricInDOM = await page.$eval('text=/Judging Rubric/i', el => {
            if (el) {
              const rect = el.getBoundingClientRect();
              return {
                exists: true,
                visible: rect.top < window.innerHeight && rect.bottom > 0,
                position: { top: rect.top, bottom: rect.bottom }
              };
            }
            return { exists: false };
          }).catch(() => ({ exists: false }));
          
          if (rubricInDOM.exists) {
            if (rubricInDOM.visible) {
              console.log('✅ Rubric is in DOM and visible');
            } else {
              console.log(`❌ Rubric is in DOM but not visible. Position: top=${rubricInDOM.position.top}, bottom=${rubricInDOM.position.bottom}`);
            }
          } else {
            console.log('❌ Rubric not found in DOM');
          }
        }
        
        // Step 6: Test navigation within PDF
        console.log('\n=== Step 6: Testing PDF navigation with rubric ===');
        
        const nextButton = await page.$('button:has-text("Next")');
        if (nextButton && !(await nextButton.isDisabled())) {
          console.log('Clicking Next button to go to page 2...');
          await nextButton.click();
          await page.waitForTimeout(2000);
          
          // Check if page changed
          const pageIndicator = await page.$('text=/Page 2/');
          if (pageIndicator) {
            console.log('✅ Successfully navigated to page 2');
            
            // For $1000 tier, check if rubric updated
            const page2Rubric = await page.$('text=/Page 2 of/');
            if (page2Rubric) {
              console.log('✅ Per-page rubric updated for page 2');
            }
          }
        }
        
      } else {
        console.log('❌ View & Review button not found');
      }
    } else {
      console.log('❌ Script "dfffw" not found');
      
      // List all visible scripts
      const scriptTitles = await page.$$eval('h3', elements => 
        elements.map(el => el.textContent)
      );
      console.log('Visible scripts:', scriptTitles);
    }

    // Keep browser open for inspection
    console.log('\n=== Test complete. Summary ===');
    console.log('1. Check if rubric is visible when scrolling down');
    console.log('2. For $500/$750 tier: Single rubric for entire script');
    console.log('3. For $1000 tier: Per-page rubric that changes with page navigation');
    console.log('\nKeeping browser open for manual inspection...');
    console.log('Press Ctrl+C to close.');
    
    await page.waitForTimeout(300000); // 5 minutes

  } catch (error) {
    console.error('\n❌ Test error:', error);
  }
}

testRubricVisibility();