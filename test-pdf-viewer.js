const { chromium } = require('playwright');

async function testPDFViewer() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    devtools: true // Open dev tools to see console errors
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`Browser console [${msg.type()}]:`, msg.text());
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });

  console.log('Starting PDF viewer test...');

  try {
    // Step 1: Go to contractor login
    console.log('\n=== Step 1: Logging in as test contractor ===');
    await page.goto('http://localhost:8080/contractor');
    await page.waitForTimeout(2000);

    // Login as test contractor
    const emailInput = await page.$('input[placeholder*="email" i], input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[placeholder*="password" i], input[type="password"], input[name="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.fill('test');
      await passwordInput.fill('test');
      
      const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      if (loginButton) {
        await loginButton.click();
        console.log('Login submitted');
        await page.waitForTimeout(3000);
      }
    }

    // Check if logged in successfully
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    if (currentUrl.includes('contractor-dashboard') || currentUrl.includes('contractor') && !currentUrl.includes('login')) {
      console.log('✅ Logged in successfully');
      
      // Step 2: Find and click on the script "dfffw"
      console.log('\n=== Step 2: Looking for script "dfffw" ===');
      await page.waitForTimeout(2000);
      
      // Look for the script by title
      const scriptCard = await page.$('text=/dfffw/i');
      if (scriptCard) {
        console.log('Found script "dfffw"');
        
        // Look for the View & Review button
        const reviewButton = await page.$('button:has-text("View & Review")');
        if (reviewButton) {
          console.log('Clicking View & Review button...');
          await reviewButton.click();
          await page.waitForTimeout(5000);
          
          // Check if PDF viewer opened
          console.log('\n=== Step 3: Checking PDF viewer ===');
          
          // Check for PDF loading errors
          const errorMessage = await page.$('text=/Failed to load PDF/i, text=/Unable to load/i');
          if (errorMessage) {
            const errorText = await errorMessage.textContent();
            console.log('❌ PDF loading error found:', errorText);
            
            // Check the console for more details
            console.log('Checking for PDF URL issues...');
            
            // Check if the sample PDF message appears
            const sampleMessage = await page.$('text=/Using Sample PDF/i');
            if (sampleMessage) {
              console.log('ℹ️ Sample PDF is being used');
            }
          }
          
          // Check if PDF canvas is present
          const pdfCanvas = await page.$('canvas');
          if (pdfCanvas) {
            console.log('✅ PDF canvas found - PDF is rendering');
            
            // Check if page navigation works
            const nextButton = await page.$('button:has-text("Next")');
            if (nextButton) {
              const isDisabled = await nextButton.isDisabled();
              console.log('Next button found, disabled:', isDisabled);
            }
          } else {
            console.log('❌ No PDF canvas found - PDF is not rendering');
          }
          
          // Check for react-pdf error messages
          const reactPdfError = await page.$('.react-pdf__message--error');
          if (reactPdfError) {
            const errorContent = await reactPdfError.textContent();
            console.log('React-PDF error:', errorContent);
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
    } else {
      console.log('❌ Login failed or redirected');
    }

    // Keep browser open for inspection
    console.log('\n=== Test complete. Keeping browser open for inspection ===');
    console.log('Check the browser console for any CORS or network errors.');
    console.log('Press Ctrl+C to close.');
    
    await page.waitForTimeout(300000); // 5 minutes

  } catch (error) {
    console.error('\n❌ Test error:', error);
  }
}

testPDFViewer();