# Environment Setup Guide

This guide explains how to set up environment variables for the Honey & Hemlock Productions website.

## Quick Start

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`

3. **Never commit `.env.local`** to version control (it's already in `.gitignore`)

## Required Environment Variables

### 🗄️ Supabase Configuration
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to find these:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon public key

### 💳 Stripe Configuration
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Where to find these:**
1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API keys
3. Copy the Publishable key and Secret key
4. Use test keys for development, live keys for production

### 🔐 Security Notes

- **VITE_** prefixed variables are exposed to the frontend
- **Non-VITE** variables are server-side only
- Never commit actual keys to version control
- Use test keys in development
- Rotate keys regularly in production

## Environment-Specific Files

### Development
- Use `.env.local` for local development
- Contains test/development keys
- Included in `.gitignore`

### Production
- Set environment variables in your hosting platform
- Use production/live keys
- Enable proper security headers

## Supabase Edge Functions

The Stripe integration uses Supabase Edge Functions. Make sure to set environment variables in your Supabase project:

1. Go to Project Settings → Edge Functions
2. Add environment variables:
   - `STRIPE_SECRET_KEY`
   - Any other server-side variables

## Testing Stripe Integration

### Test Mode
- Use Stripe test keys (pk_test_... and sk_test_...)
- Use test card numbers:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

### Webhook Testing
1. Install Stripe CLI
2. Forward events to local server:
   ```bash
   stripe listen --forward-to localhost:5173/webhook
   ```
3. Use the webhook signing secret in your environment

## Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check that your Stripe keys are correct
   - Ensure you're using the right environment keys

2. **Supabase connection errors**
   - Verify your Supabase URL and anon key
   - Check that your Supabase project is active

3. **Environment variables not loading**
   - Restart your development server after adding new variables
   - Ensure variables are prefixed with `VITE_` for frontend access

### Getting Help

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Check the [Stripe Documentation](https://stripe.com/docs)
3. Verify your environment variables are spelled correctly
4. Ensure all required variables are set

## Production Deployment

### Vercel
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
```

### Netlify
Add variables in Site Settings → Environment Variables

### Other Platforms
Refer to your hosting provider's documentation for setting environment variables.

---

**⚠️ Security Reminder:** Never commit actual API keys, passwords, or secrets to version control. Always use environment variables for sensitive configuration.