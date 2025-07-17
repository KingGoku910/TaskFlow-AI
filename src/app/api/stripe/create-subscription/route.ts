import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripePaymentService } from '@/services/stripe-payment';

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

    const { tier, billingCycle } = await request.json();

    if (!tier || !billingCycle) {
      return NextResponse.json(
        { error: 'Tier and billing cycle are required' },
        { status: 400 }
      );
    }

    if (!['pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be pro or enterprise' },
        { status: 400 }
      );
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be monthly or yearly' },
        { status: 400 }
      );
    }

    // Mock subscription creation response
    const mockResult = {
      subscriptionId: 'sub_mock_' + Date.now(),
      paymentIntent: {
        id: 'pi_mock_' + Date.now(),
        client_secret: 'pi_mock_' + Date.now() + '_secret_mock',
        amount: billingCycle === 'monthly' ? 999 : 9999,
        currency: 'usd',
        status: 'requires_payment_method',
      },
      customer: {
        id: 'cus_mock_' + Date.now(),
        email: user.email,
      },
    };

    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
