# Setting Up Stripe with Supabase Edge Functions

## The Issue
The payment error occurs because the Stripe secret key needs to be configured in Supabase's Edge Function environment, not just in your local `.env` files.

## Solution Steps

### 1. Set Stripe Secret Key in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/zknmzaowomihtrtqleon
2. Navigate to **Edge Functions** section in the left sidebar
3. Click on **Secrets** or **Environment Variables**
4. Add the following secret:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_live_YOUR_STRIPE_SECRET_KEY_HERE`

### 2. Deploy the Edge Function

Run these commands in your terminal:

```bash
cd "C:\Users\Hafsa\Desktop\Honey and Hemlock CODE\honeyandhemlock"

# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref zknmzaowomihtrtqleon

# Deploy the Edge Function
supabase functions deploy create-script-payment

# Deploy the sponsorship payment function as well
supabase functions deploy create-sponsorship-payment
```

### 3. Verify the Setup

After deploying:
1. Check the Supabase dashboard to confirm the functions are deployed
2. Test the script submission form again
3. The payment should now redirect to Stripe checkout

## Important Notes

- **Security**: Never commit the `.env.local` file with real Stripe keys to version control
- **Testing**: For testing, you should use Stripe test keys (starting with `pk_test_` and `sk_test_`)
- **Production**: The keys in your `.env.local` are LIVE production keys - be careful with them

## Alternative: Local Testing Setup

If you want to test locally without deploying to Supabase:

1. Create test Stripe keys from your Stripe dashboard
2. Use Supabase CLI to serve functions locally:
   ```bash
   supabase functions serve --env-file .env.local
   ```
3. Update your frontend to point to the local function URL

## Troubleshooting

If you still get errors after setting up:
1. Check the browser console for detailed error messages
2. Check Supabase Edge Function logs in the dashboard
3. Verify the Stripe keys are correct and active
4. Ensure CORS is properly configured (already set in the function)