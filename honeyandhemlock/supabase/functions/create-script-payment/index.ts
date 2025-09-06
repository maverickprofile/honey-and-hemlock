
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, authorName, authorEmail, authorPhone, amount, tierName, tierId, tierDescription } = await req.json();

    // Debug logging to track the amount being received
    console.log('=== STRIPE PAYMENT DEBUG ===');
    console.log('Received amount (in cents):', amount);
    console.log('Tier Name:', tierName);
    console.log('Tier ID:', tierId);
    console.log('Expected amounts: 0 (Free), 50000 (Tier 1), 75000 (Tier 2), 100000 (Tier 3)');
    
    // Handle free tier - bypass Stripe and create script directly
    if (amount === 0 || tierId === 'free') {
      console.log('Free tier selected - bypassing Stripe payment');
      
      // Create Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Create script entry directly in database
      const { data, error } = await supabase
        .from('scripts')
        .insert({
          title,
          author_name: authorName,
          author_email: authorEmail,
          author_phone: authorPhone,
          amount: 0,
          payment_status: 'paid', // Mark as paid since it's free
          status: 'pending',
          tier_name: tierName,
          tier_id: tierId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating free script:', error);
        throw error;
      }
      
      console.log('Free script created successfully:', data);
      
      // Return success URL directly without Stripe
      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin")}/script-portal?success=true&free=true` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Validate amount is one of the expected values
    const validAmounts = [50000, 75000, 100000];
    let finalAmount = amount;
    
    if (!validAmounts.includes(amount)) {
      console.warn(`WARNING: Unexpected amount received: ${amount} cents.`);
      
      // Try to determine correct amount from tier name or ID
      if (tierName?.includes('Essential') || tierId === 'tier1') {
        finalAmount = 50000;
        console.log('Correcting to Tier 1 amount: 50000 cents ($500)');
      } else if (tierName?.includes('Comprehensive') || tierId === 'tier2') {
        finalAmount = 75000;
        console.log('Correcting to Tier 2 amount: 75000 cents ($750)');
      } else if (tierName?.includes('Premium') || tierId === 'tier3') {
        finalAmount = 100000;
        console.log('Correcting to Tier 3 amount: 100000 cents ($1000)');
      } else {
        // If we can't determine, use the received amount
        console.log('Cannot determine correct tier, using received amount:', amount);
      }
    } else {
      finalAmount = amount;
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Log the exact amount being sent to Stripe
    console.log('Final amount being sent to Stripe unit_amount:', finalAmount);
    console.log('This should display as: $' + (finalAmount / 100).toFixed(2));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tierName} - Script Review Service`,
              description: `${tierDescription} | Script: ${title}`,
            },
            unit_amount: finalAmount, // Use validated/corrected amount
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/script-portal?success=true`,
      cancel_url: `${req.headers.get("origin")}/script-portal?canceled=true`,
      metadata: {
        title,
        authorName,
        authorEmail,
        authorPhone: authorPhone || "",
        tierName,
        tierId,
        tierDescription,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
