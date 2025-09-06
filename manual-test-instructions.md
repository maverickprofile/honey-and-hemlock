# Manual Test Instructions for Rubric PDF Download

## Test Overview
This test verifies that judges can fill out rubrics and admins can download them as PDFs.

## Prerequisites
- Development server running at http://localhost:8080
- Admin credentials: admin@honeylocust.com / HoneyAdmin2024!
- Judge/Contractor account (or create one)

## Step-by-Step Test Process

### Part 1: Setup Test Data (Admin)

1. **Login as Admin**
   - Navigate to http://localhost:8080/admin
   - Login with: admin@honeylocust.com / HoneyAdmin2024!

2. **Create a Test Judge (if needed)**
   - Click on "Contractors" tab
   - Click "Add Contractor"
   - Fill in:
     - Name: Test Judge
     - Email: judge@test.com
     - Password: password123
   - Save

3. **Create/Find a Test Script**
   - Click on "Scripts" tab
   - If no scripts exist, you'll need to submit one through the main site
   - Note the script title for later reference

4. **Assign Script to Judge**
   - In Scripts section, find an unassigned script
   - Click assign button
   - Select "Test Judge" from dropdown
   - Save assignment

### Part 2: Fill Out Rubric (Judge)

1. **Logout from Admin**
   - Click logout

2. **Login as Judge**
   - Navigate to http://localhost:8080/contractor
   - Login with judge credentials

3. **Find Assigned Script**
   - Look for the assigned script in dashboard
   - Click "Review Script" or similar button

4. **Fill Out Complete Rubric**
   Fill in all fields with test data:
   
   **Title Response:** "Excellent and engaging title"
   
   **Ratings (click the stars):**
   - Plot: 5/5
   - Characters: 4/5
   - Concept/Originality: 5/5
   - Structure: 4/5
   - Dialogue: 5/5
   - Format/Pacing: 4/5
   - Theme: 5/5
   - Catharsis: 5/5
   - Production Budget: 3/6

   **Notes for each section:**
   - Plot Notes: "Compelling narrative with excellent pacing"
   - Character Notes: "Well-developed, authentic characters"
   - Concept Notes: "Highly original and engaging premise"
   - Structure Notes: "Strong three-act structure"
   - Dialogue Notes: "Natural, character-specific dialogue"
   - Format Notes: "Professional formatting throughout"
   - Theme Notes: "Profound thematic exploration"
   - Catharsis Notes: "Emotionally satisfying conclusion"
   - Budget Notes: "Moderate budget, 5 locations, 10 actors"

5. **Submit Review**
   - The form should auto-save, but look for any submit button
   - Wait for confirmation

### Part 3: Download PDF (Admin)

1. **Logout and Return to Admin**
   - Logout from judge account
   - Navigate to http://localhost:8080/admin
   - Login as admin again

2. **Navigate to Scripts**
   - Click "Scripts" tab

3. **Find Reviewed Script**
   - Look for the script you assigned
   - Status should show "Reviewed" or similar
   - Click "View Review" button (eye icon)

4. **Review Dialog Opens**
   - Verify you can see:
     - Script information
     - Reviewer information
     - Complete rubric scores
     - All notes and feedback

5. **Download PDF**
   - Look for green "Download PDF" button
   - Click it
   - PDF should download with filename like: rubric_[script_title]_[date].pdf

6. **Verify PDF Content**
   - Open the downloaded PDF
   - Check that it contains:
     - Honey & Hemlock header
     - Script details
     - All rubric ratings with visual stars
     - All written notes
     - Professional formatting

## Expected Results

✅ **Success Criteria:**
- Judge can fill and save rubric
- Admin can view completed rubric
- PDF downloads successfully
- PDF contains all rubric data
- PDF is professionally formatted

❌ **Common Issues:**
- Script not assigned: Check assignment in admin
- Rubric not saving: Check browser console for errors
- PDF not downloading: Check browser download settings
- Review not visible: Ensure rubric was submitted

## Test Verification Commands

To verify the rubric was saved to database:
```sql
-- Check script_reviews table
SELECT * FROM script_reviews ORDER BY created_at DESC LIMIT 1;
```

## Notes
- The rubric auto-saves every 2 seconds after changes
- PDF uses jsPDF library for generation
- Downloads folder should be in browser's default download location