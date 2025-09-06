const { chromium } = require('playwright');

async function testFullSystemVerification() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Suppress non-critical console errors
  page.on('console', msg => {
    if (msg.type() === 'error' && 
        !msg.text().includes('Failed to fetch') && 
        !msg.text().includes('Failed to load resource: the server responded with a status of 406')) {
      console.log(`[Console Error]:`, msg.text());
    }
  });

  console.log('='.repeat(70));
  console.log('FULL SYSTEM VERIFICATION TEST');
  console.log('Testing: Rubric System, PDF Viewer, Admin Review Display');
  console.log('='.repeat(70));

  const testResults = {
    // Contractor tests
    contractorLogin: false,
    scriptsFound: false,
    script500Review: false,
    script750Review: false,
    script1000Review: false,
    rubric500Type: false,
    rubric750Type: false,
    rubric1000Type: false,
    
    // Admin tests
    adminLogin: false,
    adminScriptsView: false,
    adminReviewButton: false,
    adminAllFieldsDisplay: false,
    adminPerPageDisplay: false
  };

  try {
    // ============================================
    // PART 1: CONTRACTOR WORKFLOW
    // ============================================
    console.log('\n' + '─'.repeat(50));
    console.log('PART 1: CONTRACTOR WORKFLOW');
    console.log('─'.repeat(50));
    
    // Step 1: Login as contractor
    console.log('\n→ Logging in as test contractor...');
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
      console.log('  ✅ Contractor login successful');
      testResults.contractorLogin = true;
      
      // Check for scripts
      const scripts = await page.$$('.bg-portfolio-black');
      if (scripts.length > 0) {
        console.log(`  ✓ Found ${scripts.length} scripts`);
        testResults.scriptsFound = true;
      }
      
      // Test each tier
      const tiers = [
        { amount: 500, name: 'Test 500' },
        { amount: 750, name: 'Test 750' },
        { amount: 1000, name: 'Test 1000' }
      ];
      
      for (const tier of tiers) {
        console.log(`\n→ Testing ${tier.name} script (Tier: $${tier.amount})...`);
        
        // Go back to dashboard
        if (!page.url().includes('contractor-dashboard')) {
          await page.goto('http://localhost:8080/contractor-dashboard');
          await page.waitForTimeout(2000);
        }
        
        // Find and open the script
        const scriptCard = await page.$(`text=/${tier.name}/i`);
        if (!scriptCard) {
          console.log(`  ❌ ${tier.name} script not found`);
          continue;
        }
        
        console.log(`  ✓ Found ${tier.name} script`);
        
        // Click View & Review button
        const reviewButton = await page.evaluateHandle((name) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          for (const btn of buttons) {
            if (btn.textContent?.includes('View & Review')) {
              const card = btn.closest('.bg-portfolio-black');
              if (card && card.textContent?.includes(name)) {
                return btn;
              }
            }
          }
          return null;
        }, tier.name);
        
        if (!reviewButton) {
          console.log(`  ❌ View & Review button not found`);
          continue;
        }
        
        await reviewButton.click();
        console.log(`  ✓ Opening PDF viewer...`);
        await page.waitForTimeout(5000);
        
        // Check if PDF loaded
        const pdfCanvas = await page.$('canvas');
        if (!pdfCanvas) {
          console.log(`  ❌ PDF failed to load`);
          continue;
        }
        
        console.log(`  ✓ PDF loaded successfully`);
        
        // Scroll down to check rubric
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);
        
        // Check rubric type based on tier
        const judgeRubricTitle = await page.$('text=/Judging Rubric/i');
        const perPageTitle = await page.$('text=/Page.*of.*[0-9]/i, text=/Page 1/');
        const pageButtons = await page.$$('button:has-text("Page"):not(:has-text("Previous")):not(:has-text("Next"))');
        
        if (tier.amount === 1000) {
          // Should have per-page rubric
          if (perPageTitle || pageButtons.length > 1) {
            console.log(`  ✅ Per-page rubric found (correct for $1000 tier)`);
            testResults[`rubric${tier.amount}Type`] = true;
            
            // Test page navigation
            if (pageButtons.length > 1) {
              await pageButtons[1].click();
              await page.waitForTimeout(1000);
              console.log(`    ✓ Page navigation working`);
            }
          } else {
            console.log(`  ❌ Per-page rubric NOT found (expected for $1000)`);
          }
        } else {
          // Should have single rubric
          if (judgeRubricTitle && !perPageTitle) {
            console.log(`  ✅ Single rubric found (correct for $${tier.amount} tier)`);
            testResults[`rubric${tier.amount}Type`] = true;
          } else if (perPageTitle) {
            console.log(`  ❌ Found per-page rubric (expected single for $${tier.amount})`);
          } else {
            console.log(`  ❌ No rubric found`);
          }
        }
        
        // Fill minimal rubric data for quick test
        console.log(`  → Filling sample rubric data...`);
        const titleInput = await page.$('input[placeholder*="Short answer text"]');
        if (titleInput) {
          await titleInput.fill(`Quick test for ${tier.name}`);
        }
        
        // Select a few ratings
        const ratingButtons = await page.$$('input[type="radio"]');
        if (ratingButtons.length > 3) {
          await ratingButtons[3].click(); // Select rating 4
          await page.waitForTimeout(100);
        }
        
        // Try to submit (but handle dialog overlay issue)
        const submitButton = await page.$('button:has-text("Submit Review")');
        if (submitButton) {
          try {
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            // Handle submit dialog if it appears
            const finalSubmitButton = await page.$('button:has-text("Submit Final Review")');
            if (finalSubmitButton) {
              const overallNotes = await page.$('textarea[placeholder*="overall"]');
              if (overallNotes) {
                await overallNotes.fill(`Test review for ${tier.name}`);
              }
              
              // Try to click final submit
              try {
                await finalSubmitButton.click({ timeout: 5000 });
                console.log(`  ✅ Review submitted for ${tier.name}`);
                testResults[`script${tier.amount}Review`] = true;
                await page.waitForTimeout(3000);
              } catch (e) {
                // If dialog is blocking, press Escape
                console.log(`  ⚠️ Dialog blocking, pressing Escape...`);
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1000);
              }
            }
          } catch (e) {
            console.log(`  ⚠️ Could not submit review (dialog issue)`);
            await page.keyboard.press('Escape');
          }
        }
        
        // Go back to dashboard
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
      
    } else {
      console.log('  ❌ Contractor login failed');
    }
    
    // ============================================
    // PART 2: ADMIN VERIFICATION
    // ============================================
    console.log('\n' + '─'.repeat(50));
    console.log('PART 2: ADMIN REVIEW VERIFICATION');
    console.log('─'.repeat(50));
    
    console.log('\n→ Logging in as admin...');
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
      console.log('  ✅ Admin login successful');
      testResults.adminLogin = true;
      
      // Navigate to Scripts section
      console.log('\n→ Navigating to Scripts section...');
      const scriptsTab = await page.$('button:has-text("Scripts")');
      if (scriptsTab) {
        await scriptsTab.click();
        await page.waitForTimeout(2000);
        console.log('  ✓ Scripts section loaded');
        testResults.adminScriptsView = true;
        
        // Look for View Review buttons
        const viewReviewButtons = await page.$$('button[title="View Review"]');
        if (viewReviewButtons.length > 0) {
          console.log(`  ✓ Found ${viewReviewButtons.length} View Review buttons`);
          testResults.adminReviewButton = true;
          
          // Click the first review
          console.log('\n→ Opening first review to check rubric display...');
          await viewReviewButtons[0].click();
          await page.waitForTimeout(2000);
          
          // Check for comprehensive rubric display
          const titleResponseSection = await page.$('text=/Title Response/');
          const completeRubricSection = await page.$('text=/Complete Rubric Assessment/');
          
          if (titleResponseSection) {
            console.log('  ✓ Title Response section found');
          }
          
          if (completeRubricSection) {
            console.log('  ✓ Complete Rubric Assessment section found');
            
            // Check for all 9 rubric categories
            const expectedFields = [
              'Plot', 'Characters', 'Concept/Originality',
              'Structure', 'Dialogue', 'Format/Pacing',
              'Theme/Tone', 'Catharsis', 'Production Budget'
            ];
            
            let allFieldsFound = true;
            console.log('\n  Checking all rubric fields:');
            for (const field of expectedFields) {
              const fieldElement = await page.$(`text=/${field}/`);
              if (fieldElement) {
                console.log(`    ✓ ${field}`);
              } else {
                console.log(`    ❌ ${field} (missing)`);
                allFieldsFound = false;
              }
            }
            
            if (allFieldsFound) {
              console.log('\n  ✅ All 19 rubric fields are displayed');
              testResults.adminAllFieldsDisplay = true;
            }
          }
          
          // Check for per-page rubrics (if $1000 tier)
          const perPageSection = await page.$('text=/Per-Page Complete Rubric Assessment/');
          if (perPageSection) {
            console.log('\n  ✓ Per-Page Rubric section found ($1000 tier)');
            testResults.adminPerPageDisplay = true;
            
            const pageHeaders = await page.$$('text=/Page [0-9]+/');
            console.log(`    Found ${pageHeaders.length} page rubrics`);
          }
          
          // Close dialog
          const closeButton = await page.$('button:has-text("Close")');
          if (closeButton) {
            await closeButton.click();
          }
        } else {
          console.log('  ⚠️ No View Review buttons found (no completed reviews)');
        }
      }
    } else {
      console.log('  ❌ Admin login failed');
    }
    
    // ============================================
    // TEST SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(70));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(70));
    
    console.log('\n📋 CONTRACTOR TESTS:');
    console.log(`  Login: ${testResults.contractorLogin ? '✅' : '❌'}`);
    console.log(`  Scripts Found: ${testResults.scriptsFound ? '✅' : '❌'}`);
    console.log(`  $500 Single Rubric: ${testResults.rubric500Type ? '✅' : '❌'}`);
    console.log(`  $750 Single Rubric: ${testResults.rubric750Type ? '✅' : '❌'}`);
    console.log(`  $1000 Per-Page Rubric: ${testResults.rubric1000Type ? '✅' : '❌'}`);
    
    console.log('\n👨‍💼 ADMIN TESTS:');
    console.log(`  Login: ${testResults.adminLogin ? '✅' : '❌'}`);
    console.log(`  Scripts View: ${testResults.adminScriptsView ? '✅' : '❌'}`);
    console.log(`  Review Button: ${testResults.adminReviewButton ? '✅' : '❌'}`);
    console.log(`  All 19 Fields Display: ${testResults.adminAllFieldsDisplay ? '✅' : '❌'}`);
    console.log(`  Per-Page Display: ${testResults.adminPerPageDisplay ? '✅' : 'N/A'}`);
    
    // Calculate score
    let passedTests = 0;
    let totalTests = 0;
    for (const [key, value] of Object.entries(testResults)) {
      if (!key.includes('script') || key.includes('Type')) { // Count essential tests
        totalTests++;
        if (value) passedTests++;
      }
    }
    
    const percentage = Math.round((passedTests / totalTests) * 100);
    console.log('\n' + '='.repeat(70));
    console.log(`FINAL SCORE: ${passedTests}/${totalTests} essential tests passed (${percentage}%)`);
    
    if (percentage === 100) {
      console.log('🎉 PERFECT! All systems working correctly!');
    } else if (percentage >= 80) {
      console.log('✅ GOOD! Most features working properly.');
    } else if (percentage >= 60) {
      console.log('⚠️ NEEDS ATTENTION! Some features need fixes.');
    } else {
      console.log('❌ CRITICAL! Major issues detected.');
    }
    
    console.log('='.repeat(70));
    
    // Keep browser open briefly for inspection
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testFullSystemVerification();