import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createPaymentGatewayService } from '@/services/payment-gateway';

export async function GET(request: NextRequest) {
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

    // Get payment methods
    const paymentMethods = await paymentGatewayService.getUserPaymentMethods(user.id);

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

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

    const { paymentMethod, providerCustomerId, lastFour, brand, expiryMonth, expiryYear, isDefault } = await request.json();

    if (!paymentMethod || !providerCustomerId) {
      return NextResponse.json(
        { error: 'Payment method and provider customer ID are required' },
        { status: 400 }
      );
    }

    // Add payment method
    await paymentGatewayService.addPaymentMethod(
      user.id,
      paymentMethod,
      providerCustomerId,
      lastFour,
      brand,
      expiryMonth,
      expiryYear,
      isDefault
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Remove payment method
    await paymentGatewayService.removePaymentMethod(user.id, paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing payment method:', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
