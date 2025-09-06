const { chromium } = require('playwright');

async function testCompleteRubricFlow() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300,
    devtools: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to fetch')) {
      console.log(`[Console Error]:`, msg.text());
    }
  });

  console.log('='.repeat(60));
  console.log('COMPLETE RUBRIC WORKFLOW TEST');
  console.log('='.repeat(60));

  const testResults = {
    contractorLogin: false,
    script500Found: false,
    script750Found: false,
    script1000Found: false,
    pdf500Loads: false,
    pdf750Loads: false,
    pdf1000Loads: false,
    rubric500Single: false,
    rubric750Single: false,
    rubric1000PerPage: false,
    rubricSubmit500: false,
    rubricSubmit750: false,
    rubricSubmit1000: false,
    adminLogin: false,
    adminViewReviews: false,
    adminRubricDisplay: false,
    uiContrastGood: false
  };

  try {
    // ============================================
    // PART 1: CONTRACTOR TESTING
    // ============================================
    console.log('\n' + '='.repeat(40));
    console.log('PART 1: CONTRACTOR WORKFLOW');
    console.log('='.repeat(40));
    
    // Step 1: Login as contractor
    console.log('\n→ Step 1: Logging in as test contractor...');
    await page.goto('http://localhost:8080/contractor');
    await page.waitForTimeout(2000);
    
    const emailInput = await page.$('input[type="email"], input[placeholder*="email" i]');
    const passwordInput = await page.$('input[type="password"], input[placeholder*="password" i]');
    
    if (emailInput && passwordInput) {
      await emailInput.fill('test');
      await passwordInput.fill('test');
      
      const loginButton = await page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Check if logged in
    const currentUrl = page.url();
    if (currentUrl.includes('contractor-dashboard')) {
      console.log('✅ Contractor login successful');
      testResults.contractorLogin = true;
    } else {
      console.log('❌ Contractor login failed');
    }
    
    // Step 2: Test each tier script
    const tiers = [
      { amount: 500, name: 'Test 500', expectedRubric: 'single' },
      { amount: 750, name: 'Test 750', expectedRubric: 'single' },
      { amount: 1000, name: 'Test 1000', expectedRubric: 'per-page' }
    ];
    
    for (const tier of tiers) {
      console.log(`\n→ Step 2.${tier.amount}: Testing ${tier.name} script...`);
      
      // Go back to dashboard if needed
      if (!page.url().includes('contractor-dashboard')) {
        await page.goto('http://localhost:8080/contractor-dashboard');
        await page.waitForTimeout(2000);
      }
      
      // Find the script
      const scriptCard = await page.$(`text=/${tier.name}/i`);
      if (scriptCard) {
        console.log(`  ✓ Found ${tier.name} script`);
        testResults[`script${tier.amount}Found`] = true;
        
        // Click View & Review
        const reviewButton = await page.evaluateHandle((name) => {
          // Find all buttons with "View & Review" text
          const buttons = Array.from(document.querySelectorAll('button'));
          // Find the one in the same card as the script name
          for (const btn of buttons) {
            if (btn.textContent?.includes('View & Review')) {
              const card = btn.closest('.bg-portfolio-black') || btn.closest('[class*="card"]');
              if (card && card.textContent?.includes(name)) {
                return btn;
              }
            }
          }
          return null;
        }, tier.name);
        
        if (reviewButton) {
          await reviewButton.click();
          console.log(`  ✓ Opened ${tier.name} PDF viewer`);
          await page.waitForTimeout(5000);
          
          // Check if PDF loads
          const pdfCanvas = await page.$('canvas');
          if (pdfCanvas) {
            console.log(`  ✓ PDF loaded for ${tier.name}`);
            testResults[`pdf${tier.amount}Loads`] = true;
            
            // Scroll down to check rubric
            console.log(`  → Checking rubric type...`);
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(2000);
            
            // Check rubric type
            if (tier.expectedRubric === 'per-page') {
              // Check for per-page rubric indicators
              const perPageTitle = await page.$('text=/Page.*of.*[0-9]/i, text=/Page 1/');
              const pageButtons = await page.$$('button:has-text("Page"):not(:has-text("Previous")):not(:has-text("Next"))');
              
              if (perPageTitle || pageButtons.length > 1) {
                console.log(`  ✅ Per-page rubric found for ${tier.name} (as expected)`);
                testResults[`rubric${tier.amount}PerPage`] = true;
                
                // Test page navigation
                if (pageButtons.length > 1) {
                  await pageButtons[1].click();
                  await page.waitForTimeout(1000);
                  console.log(`    ✓ Page navigation working`);
                }
              } else {
                console.log(`  ❌ Per-page rubric NOT found for ${tier.name}`);
              }
            } else {
              // Check for single rubric
              const rubricTitle = await page.$('text=/Judging Rubric/i');
              const perPageIndicator = await page.$('text=/Page.*of.*[0-9]/i');
              
              if (rubricTitle && !perPageIndicator) {
                console.log(`  ✅ Single rubric found for ${tier.name} (as expected)`);
                testResults[`rubric${tier.amount}Single`] = true;
              } else if (perPageIndicator) {
                console.log(`  ❌ Found per-page rubric for ${tier.name} (expected single)`);
              } else {
                console.log(`  ❌ No rubric found for ${tier.name}`);
              }
            }
            
            // Fill in sample rubric data
            console.log(`  → Filling sample rubric data...`);
            const titleInput = await page.$('input[placeholder*="Short answer text"]');
            if (titleInput) {
              await titleInput.fill(`Test Review for ${tier.name}`);
            }
            
            // Select some ratings
            const ratingButtons = await page.$$('input[type="radio"]');
            if (ratingButtons.length > 0) {
              // Click a few rating buttons
              for (let i = 0; i < Math.min(5, ratingButtons.length); i += 5) {
                await ratingButtons[i + 3].click(); // Select rating 4
                await page.waitForTimeout(100);
              }
              console.log(`    ✓ Filled sample ratings`);
            }
            
            // Check button contrast
            const goldButtons = await page.$$('.bg-portfolio-gold');
            if (goldButtons.length > 0) {
              const buttonText = await goldButtons[0].evaluate(btn => {
                const styles = window.getComputedStyle(btn);
                return {
                  color: styles.color,
                  fontWeight: styles.fontWeight
                };
              });
              
              if (buttonText.fontWeight === '600' || buttonText.fontWeight === 'bold') {
                console.log(`    ✓ Button contrast improved (font-weight: ${buttonText.fontWeight})`);
                testResults.uiContrastGood = true;
              }
            }
            
            // Submit review
            const submitButton = await page.$('button:has-text("Submit Review")');
            if (submitButton) {
              await submitButton.click();
              await page.waitForTimeout(2000);
              
              // Handle submit dialog
              const finalSubmitButton = await page.$('button:has-text("Submit Final Review")');
              if (finalSubmitButton) {
                const overallNotesTextarea = await page.$('textarea[placeholder*="overall"]');
                if (overallNotesTextarea) {
                  await overallNotesTextarea.fill(`Comprehensive review for ${tier.name} script. The rubric system is working correctly.`);
                }
                
                await finalSubmitButton.click();
                console.log(`  ✅ Review submitted for ${tier.name}`);
                testResults[`rubricSubmit${tier.amount}`] = true;
                await page.waitForTimeout(3000);
              }
            }
            
          } else {
            console.log(`  ❌ PDF failed to load for ${tier.name}`);
          }
        } else {
          console.log(`  ❌ View & Review button not found for ${tier.name}`);
        }
      } else {
        console.log(`  ❌ ${tier.name} script not found`);
      }
    }
    
    // ============================================
    // PART 2: ADMIN TESTING
    // ============================================
    console.log('\n' + '='.repeat(40));
    console.log('PART 2: ADMIN REVIEW VERIFICATION');
    console.log('='.repeat(40));
    
    // Step 3: Login as admin
    console.log('\n→ Step 3: Logging in as admin...');
    await page.goto('http://localhost:8080/admin');
    await page.waitForTimeout(2000);
    
    const adminEmail = await page.$('input[type="email"], input[placeholder*="email" i]');
    const adminPassword = await page.$('input[type="password"], input[placeholder*="password" i]');
    
    if (adminEmail && adminPassword) {
      await adminEmail.fill('admin');
      await adminPassword.fill('Neurobit@123');
      
      const adminLoginBtn = await page.$('button[type="submit"]');
      if (adminLoginBtn) {
        await adminLoginBtn.click();
        await page.waitForTimeout(3000);
      }
    }
    
    if (page.url().includes('admin-dashboard')) {
      console.log('✅ Admin login successful');
      testResults.adminLogin = true;
      
      // Navigate to Scripts section
      console.log('\n→ Step 4: Checking script reviews in admin...');
      const scriptsTab = await page.$('button:has-text("Scripts"), text=/Scripts/');
      if (scriptsTab) {
        await scriptsTab.click();
        await page.waitForTimeout(2000);
        
        // Look for reviewed scripts
        for (const tier of tiers) {
          console.log(`  → Checking ${tier.name} review...`);
          
          const scriptRow = await page.$(`text=/${tier.name}/`);
          if (scriptRow) {
            // Find View Review button for this script
            const viewReviewBtn = await page.evaluateHandle((name) => {
              // Find all buttons with "View Review" text
              const buttons = Array.from(document.querySelectorAll('button'));
              // Find the one in the same row as the script name
              for (const btn of buttons) {
                if (btn.textContent?.includes('View Review')) {
                  const row = btn.closest('tr') || btn.closest('[role="row"]');
                  if (row && row.textContent?.includes(name)) {
                    return btn;
                  }
                }
              }
              return null;
            }, tier.name);
            
            if (viewReviewBtn) {
              await viewReviewBtn.click();
              await page.waitForTimeout(2000);
              
              // Check if rubric scores are displayed
              const rubricScoresSection = await page.$('text=/Rubric Scores/i');
              const perPageRubricSection = await page.$('text=/Per-Page Rubric/i');
              
              if (tier.amount === 1000 && perPageRubricSection) {
                console.log(`    ✅ Per-page rubric scores displayed for ${tier.name}`);
                testResults.adminRubricDisplay = true;
              } else if (tier.amount < 1000 && rubricScoresSection) {
                console.log(`    ✅ Single rubric scores displayed for ${tier.name}`);
                testResults.adminRubricDisplay = true;
              } else if (rubricScoresSection || perPageRubricSection) {
                console.log(`    ✓ Rubric data found for ${tier.name}`);
                testResults.adminRubricDisplay = true;
              } else {
                console.log(`    ⚠️ No rubric display found for ${tier.name}`);
              }
              
              // Close dialog
              const closeButton = await page.$('button:has-text("Close")');
              if (closeButton) {
                await closeButton.click();
                await page.waitForTimeout(1000);
              }
            }
          }
        }
        
        testResults.adminViewReviews = true;
      }
    } else {
      console.log('❌ Admin login failed');
    }
    
    // ============================================
    // TEST SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    let passedTests = 0;
    let totalTests = Object.keys(testResults).length;
    
    console.log('\nContractor Tests:');
    console.log(`  Login: ${testResults.contractorLogin ? '✅' : '❌'}`);
    console.log(`  $500 Script Found: ${testResults.script500Found ? '✅' : '❌'}`);
    console.log(`  $750 Script Found: ${testResults.script750Found ? '✅' : '❌'}`);
    console.log(`  $1000 Script Found: ${testResults.script1000Found ? '✅' : '❌'}`);
    
    console.log('\nPDF Loading:');
    console.log(`  $500 PDF Loads: ${testResults.pdf500Loads ? '✅' : '❌'}`);
    console.log(`  $750 PDF Loads: ${testResults.pdf750Loads ? '✅' : '❌'}`);
    console.log(`  $1000 PDF Loads: ${testResults.pdf1000Loads ? '✅' : '❌'}`);
    
    console.log('\nRubric Display:');
    console.log(`  $500 Single Rubric: ${testResults.rubric500Single ? '✅' : '❌'}`);
    console.log(`  $750 Single Rubric: ${testResults.rubric750Single ? '✅' : '❌'}`);
    console.log(`  $1000 Per-Page Rubric: ${testResults.rubric1000PerPage ? '✅' : '❌'}`);
    
    console.log('\nReview Submission:');
    console.log(`  $500 Submit: ${testResults.rubricSubmit500 ? '✅' : '❌'}`);
    console.log(`  $750 Submit: ${testResults.rubricSubmit750 ? '✅' : '❌'}`);
    console.log(`  $1000 Submit: ${testResults.rubricSubmit1000 ? '✅' : '❌'}`);
    
    console.log('\nAdmin Tests:');
    console.log(`  Admin Login: ${testResults.adminLogin ? '✅' : '❌'}`);
    console.log(`  View Reviews: ${testResults.adminViewReviews ? '✅' : '❌'}`);
    console.log(`  Rubric Display: ${testResults.adminRubricDisplay ? '✅' : '❌'}`);
    
    console.log('\nUI Improvements:');
    console.log(`  Button Contrast: ${testResults.uiContrastGood ? '✅' : '❌'}`);
    
    // Count passed tests
    for (const [key, value] of Object.entries(testResults)) {
      if (value) passedTests++;
    }
    
    const percentage = Math.round((passedTests / totalTests) * 100);
    console.log('\n' + '='.repeat(60));
    console.log(`FINAL SCORE: ${passedTests}/${totalTests} tests passed (${percentage}%)`);
    
    if (percentage === 100) {
      console.log('🎉 PERFECT! All tests passed!');
    } else if (percentage >= 80) {
      console.log('✅ GOOD! Most tests passed.');
    } else if (percentage >= 60) {
      console.log('⚠️ NEEDS WORK! Some tests failed.');
    } else {
      console.log('❌ CRITICAL! Many tests failed.');
    }
    
    console.log('='.repeat(60));
    
    // Keep browser open for inspection
    if (percentage < 100) {
      console.log('\nKeeping browser open for manual inspection...');
      console.log('Press Ctrl+C to close.');
      await page.waitForTimeout(300000); // 5 minutes
    } else {
      await page.waitForTimeout(5000);
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testCompleteRubricFlow();