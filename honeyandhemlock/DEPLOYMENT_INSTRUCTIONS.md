# Deployment Instructions - Free Tier & Test Judge Setup

## Overview
This guide covers deploying the new free tier functionality and setting up the Test Judge account for Honey Writes.

## New Features Added
1. **Free Tier** - Allows users to upload scripts without payment
2. **Test Judge Account** - Pre-configured contractor account for testing
3. **Test Script** - Sample thriller script uploaded to the free tier

## Database Migrations

Run the following migrations in order:

1. **Add tier columns** - Adds tier_id and tier_name to scripts table
   ```sql
   supabase\migrations\20250817000000-add-tier-columns.sql
   ```

2. **Seed Test Judge** - Creates approved Test Judge account
   ```sql
   supabase\migrations\20250817000001-seed-test-judge.sql
   ```

3. **Create contractor authentication** - Adds authentication function for contractors
   ```sql
   supabase\migrations\20250817000002-create-contractor-auth.sql
   ```

4. **Seed test script** - Uploads a sample thriller script
   ```sql
   supabase\migrations\20250817000003-seed-test-script.sql
   ```

## Test Judge Credentials
- **Email:** test
- **Password:** test
- **Status:** Pre-approved
- **Name:** Test Judge

## Test Script Details
- **Title:** The Last Signal
- **Author:** Test Author
- **Tier:** Free Upload
- **Status:** Pending (ready for review)
- **File:** test-thriller-script.txt

## Updated Files

### Frontend Changes
1. **PricingPage.tsx** - Added free tier option
2. **ScriptSubmissionForm.tsx** - Handles free tier submissions
3. **AuthContext.tsx** - Updated to support contractor authentication
4. **ScriptsSection.tsx** - Updated tier filter to include all tiers

### Backend Changes
1. **create-script-payment/index.ts** - Modified to bypass Stripe for free tier
2. **New SQL migrations** - Database schema updates

## Testing Instructions

1. **Test Free Tier Upload:**
   - Navigate to /pricing
   - Select "Free Upload" tier
   - Fill in script details
   - Submit (should bypass payment and create script directly)

2. **Test Judge Login:**
   - Navigate to /contractor-login
   - Login with email: "test", password: "test"
   - Should access contractor dashboard

3. **Verify Admin View:**
   - Login as admin
   - Navigate to admin dashboard
   - Scripts section should show the test script
   - Tier filter should include "Free Upload" option

## Deployment Steps

1. **Apply database migrations:**
   ```bash
   supabase db push
   ```

2. **Deploy Supabase functions:**
   ```bash
   supabase functions deploy create-script-payment
   ```

3. **Deploy frontend:**
   ```bash
   npm run build
   npm run deploy
   ```

## Verification Checklist

- [ ] Free tier appears in pricing page
- [ ] Free uploads bypass Stripe payment
- [ ] Test Judge can login with credentials
- [ ] Test script appears in admin dashboard
- [ ] Tier filters work correctly in admin panel
- [ ] Scripts show correct tier information

## Notes
- The free tier marks payment_status as 'paid' automatically
- Test Judge is pre-approved and ready to review scripts
- The thriller script is 3 pages as requested
- All contractor passwords use bcrypt hashing for security