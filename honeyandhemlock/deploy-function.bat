@echo off
echo ====================================
echo Supabase Edge Function Deployment
echo ====================================
echo.

echo Step 1: Installing Supabase CLI...
call npm install -g supabase

echo.
echo Step 2: You need to link your project first
echo Please get your project reference ID from:
echo https://app.supabase.com/project/_/settings/general
echo (It looks like: abcdefghijklmnop)
echo.
set /p PROJECT_REF="Enter your Supabase Project Ref: "

echo.
echo Step 3: Linking to your project...
call npx supabase link --project-ref %PROJECT_REF%

echo.
echo Step 4: Deploying the create-script-payment function...
call npx supabase functions deploy create-script-payment

echo.
echo ====================================
echo Deployment complete!
echo ====================================
echo.
echo Please check your Supabase dashboard to verify the function was updated.
echo Test by selecting different tiers and checking if Stripe shows the correct amount.
pause