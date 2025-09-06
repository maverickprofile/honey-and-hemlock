# Deploy Supabase Functions

## Steps to Deploy the Updated create-script-payment Function

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link to your project
```bash
# Navigate to your project directory
cd "C:\Users\Hafsa\Desktop\Honey and Hemlock CODE\honeyandhemlock"

# Link to your Supabase project (you'll need your project ref)
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Deploy the function
```bash
# Deploy the create-script-payment function
supabase functions deploy create-script-payment
```

### 5. Verify deployment
After deployment, check the Supabase dashboard to confirm the function was updated.

## Alternative: Deploy via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to "Edge Functions" 
3. Find "create-script-payment"
4. Click "Edit" 
5. Copy the entire contents of `supabase/functions/create-script-payment/index.ts`
6. Paste it into the editor
7. Click "Deploy"

## Testing After Deployment

1. Clear your browser cache and localStorage:
   - Open Developer Tools (F12)
   - Go to Application tab
   - Clear Site Data

2. Test the flow:
   - Go to /script-portal (pricing page)
   - Select a tier (Essential $500, Comprehensive $750, or Premium $1000)
   - Fill in the form
   - Submit and check if Stripe shows the correct amount

3. Check the logs:
   - In Supabase Dashboard, go to "Edge Functions"
   - Click on "create-script-payment"
   - Check the "Logs" tab to see the debug output

## What Changed

The updated function includes:
- Debug logging to track amounts received
- Validation to ensure amounts are correct (50000, 75000, or 100000 cents)
- Fallback logic to correct amounts based on tier name/ID if needed
- Clear console logs to help diagnose issues

## Expected Console Output

When you submit a script, you should see in the browser console:
```
=== SCRIPT PORTAL DEBUG ===
Parsed tier object: {id: "tier1", name: "Essential Review", price: 500, ...}
=== SCRIPT SUBMISSION DEBUG ===
Amount in cents: 50000
```

And in Supabase function logs:
```
=== STRIPE PAYMENT DEBUG ===
Received amount (in cents): 50000
Final amount being sent to Stripe unit_amount: 50000
This should display as: $500.00
```