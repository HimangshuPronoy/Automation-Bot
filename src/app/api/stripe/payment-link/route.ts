import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/**
 * Create a Stripe Payment Link for a quote
 * POST /api/stripe/payment-link
 */
export async function POST(req: NextRequest) {
  try {
    const { quoteId, amount, description } = await req.json();

    // Create a product and price on the fly
    const product = await stripe.products.create({
      name: description || `Quote #${quoteId}`,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount, // already in cents
      currency: 'usd',
    });

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        quoteId,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/quotes?paid=${quoteId}`,
        },
      },
    });

    return NextResponse.json({ paymentLink: paymentLink.url });
  } catch (error) {
    console.error('Payment link error:', error);
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
  }
}
