import { NextRequest, NextResponse } from 'next/server';
import { createStripePaymentService } from '@/services/stripe-payment';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Stripe signature header is required' },
        { status: 400 }
      );
    }

    const payload = await request.text();

    // Process webhook
    const stripePaymentService = createStripePaymentService();
    await stripePaymentService.processWebhook(payload, signature);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
