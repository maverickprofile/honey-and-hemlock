const { chromium } = require('playwright');

async function testAdminRubricView() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('='.repeat(60));
  console.log('ADMIN RUBRIC VIEW TEST');
  console.log('='.repeat(60));

  const testResults = {
    adminLogin: false,
    scriptsPageLoads: false,
    viewReviewButtonExists: false,
    reviewDialogOpens: false,
    titleResponseDisplays: false,
    allRubricFieldsDisplay: false,
    perPageRubricDisplay: false
  };

  try {
    // Step 1: Login as admin
    console.log('\n→ Step 1: Logging in as admin...');
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
      
      // Step 2: Navigate to Scripts section
      console.log('\n→ Step 2: Navigating to Scripts section...');
      const scriptsTab = await page.$('button:has-text("Scripts")');
      if (scriptsTab) {
        await scriptsTab.click();
        await page.waitForTimeout(2000);
        console.log('✅ Scripts section loaded');
        testResults.scriptsPageLoads = true;
        
        // Step 3: Look for scripts with reviews
        console.log('\n→ Step 3: Looking for reviewed scripts...');
        
        // Check if there's a View Review button
        const viewReviewButtons = await page.$$('button[title="View Review"]');
        if (viewReviewButtons.length > 0) {
          console.log(`  ✓ Found ${viewReviewButtons.length} scripts with reviews`);
          testResults.viewReviewButtonExists = true;
          
          // Click the first View Review button
          console.log('\n→ Step 4: Opening review dialog...');
          await viewReviewButtons[0].click();
          await page.waitForTimeout(2000);
          
          // Check if dialog opened
          const reviewDialog = await page.$('text=/Script Review/');
          if (reviewDialog) {
            console.log('✅ Review dialog opened successfully');
            testResults.reviewDialogOpens = true;
            
            // Step 5: Check for Title Response section
            const titleResponseSection = await page.$('text=/Title Response/');
            if (titleResponseSection) {
              console.log('  ✓ Title Response section found');
              testResults.titleResponseDisplays = true;
            }
            
            // Step 6: Check for Complete Rubric Assessment
            const rubricSection = await page.$('text=/Complete Rubric Assessment/');
            if (rubricSection) {
              console.log('  ✓ Complete Rubric Assessment section found');
              
              // Check for all rubric fields
              const rubricFields = [
                'Plot', 'Characters', 'Concept/Originality', 
                'Structure', 'Dialogue', 'Format/Pacing',
                'Theme/Tone', 'Catharsis', 'Production Budget'
              ];
              
              let allFieldsFound = true;
              console.log('\n  Checking for all rubric fields:');
              for (const field of rubricFields) {
                const fieldElement = await page.$(`text=/${field}/`);
                if (fieldElement) {
                  console.log(`    ✓ ${field} field found`);
                } else {
                  console.log(`    ❌ ${field} field NOT found`);
                  allFieldsFound = false;
                }
              }
              
              if (allFieldsFound) {
                console.log('\n  ✅ All rubric fields are displayed');
                testResults.allRubricFieldsDisplay = true;
              } else {
                console.log('\n  ⚠️ Some rubric fields are missing');
              }
            }
            
            // Step 7: Check for Per-Page Rubrics (for $1000 tier)
            const perPageSection = await page.$('text=/Per-Page Complete Rubric Assessment/');
            if (perPageSection) {
              console.log('\n  ✓ Per-Page Rubric section found ($1000 tier)');
              testResults.perPageRubricDisplay = true;
              
              // Check if individual page rubrics are displayed
              const pageRubrics = await page.$$('text=/Page [0-9]+/');
              if (pageRubrics.length > 0) {
                console.log(`    ✓ Found ${pageRubrics.length} page rubrics`);
              }
            }
            
            // Close the dialog
            const closeButton = await page.$('button:has-text("Close")');
            if (closeButton) {
              await closeButton.click();
              await page.waitForTimeout(1000);
            }
          } else {
            console.log('❌ Review dialog did not open');
          }
        } else {
          console.log('  ⚠️ No View Review buttons found');
          console.log('  → This might mean no scripts have been reviewed yet');
        }
      } else {
        console.log('❌ Scripts tab not found');
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
    
    console.log('\nAdmin Navigation:');
    console.log(`  Login: ${testResults.adminLogin ? '✅' : '❌'}`);
    console.log(`  Scripts Page: ${testResults.scriptsPageLoads ? '✅' : '❌'}`);
    console.log(`  View Review Button: ${testResults.viewReviewButtonExists ? '✅' : '❌'}`);
    
    console.log('\nReview Dialog:');
    console.log(`  Dialog Opens: ${testResults.reviewDialogOpens ? '✅' : '❌'}`);
    console.log(`  Title Response: ${testResults.titleResponseDisplays ? '✅' : '❌'}`);
    console.log(`  All Rubric Fields: ${testResults.allRubricFieldsDisplay ? '✅' : '❌'}`);
    console.log(`  Per-Page Rubrics: ${testResults.perPageRubricDisplay ? '✅' : 'N/A'}`);
    
    // Count passed tests
    let passedTests = 0;
    let totalTests = 0;
    for (const [key, value] of Object.entries(testResults)) {
      if (key !== 'perPageRubricDisplay' || value === true) {
        totalTests++;
        if (value) passedTests++;
      }
    }
    
    const percentage = Math.round((passedTests / totalTests) * 100);
    console.log('\n' + '='.repeat(60));
    console.log(`FINAL SCORE: ${passedTests}/${totalTests} tests passed (${percentage}%)`);
    
    if (percentage === 100) {
      console.log('🎉 PERFECT! Admin can see all rubric fields!');
    } else if (percentage >= 80) {
      console.log('✅ GOOD! Most features working.');
    } else if (percentage >= 60) {
      console.log('⚠️ NEEDS WORK! Some features missing.');
    } else {
      console.log('❌ CRITICAL! Many features not working.');
    }
    
    console.log('='.repeat(60));
    
    // Keep browser open for inspection if tests failed
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
testAdminRubricView();