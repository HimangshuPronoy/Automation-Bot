import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  typescript: true,
});

// Initialize Supabase Admin (for verifying user)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

/**
 * Create a Stripe Checkout Session
 * POST /api/stripe/checkout
 * Body: { priceId: string } (or use predefined plans)
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate user from Auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    // Map internal plans to Stripe Price IDs (or hardcode prices for now)
    // PRO TIP: In production, store these in DB or Env
    // let priceId = '';
    // if (plan === 'starter') priceId = 'price_1Q...'; 
    // else if (plan === 'pro') priceId = 'price_1Q...';

    // For demo purposes, we will create a one-time price on the fly
    // In a real SaaS, you'd use Recurring Subscription prices created in Stripe Dashboard
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan === 'pro' ? 'Pro Plan' : 'Starter Plan',
              description: plan === 'pro' ? 'Unlimited leads & AI calls' : '100 leads/month',
            },
            unit_amount: plan === 'pro' ? 9900 : 4900, // $99 or $49
            recurring: { interval: 'month' }, // Subscription
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaigns?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
