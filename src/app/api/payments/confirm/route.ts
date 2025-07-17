import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createPaymentGatewayService } from '@/services/payment-gateway';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { paymentIntentId, paymentMethod } = await request.json();

    if (!paymentIntentId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Payment intent ID and payment method are required' },
        { status: 400 }
      );
    }

    // Confirm payment
    const result = await paymentGatewayService.confirmPayment(paymentIntentId, paymentMethod);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
