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

    const { tier, billingCycle, paymentMethod } = await request.json();

    if (!tier || !billingCycle || !paymentMethod) {
      return NextResponse.json(
        { error: 'Tier, billing cycle, and payment method are required' },
        { status: 400 }
      );
    }

    // Create subscription with payment
    const result = await paymentGatewayService.createSubscription(
      user.id,
      tier,
      billingCycle,
      paymentMethod
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
