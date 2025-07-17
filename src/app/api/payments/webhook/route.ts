import { NextRequest, NextResponse } from 'next/server';
import { createPaymentGatewayService } from '@/services/payment-gateway';

export async function POST(request: NextRequest) {
  try {
    const { provider, signature } = request.headers;
    const payload = await request.text();

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider header is required' },
        { status: 400 }
      );
    }

    // Process webhook
    const paymentGatewayService = createPaymentGatewayService();
    await paymentGatewayService.processWebhook(
      provider as any,
      payload,
      signature || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
