import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createStripePaymentService } from '@/services/stripe-payment';

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

    // Create setup intent for adding payment methods
    const stripePaymentService = createStripePaymentService();
    const result = await stripePaymentService.createSetupIntent(user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json(
      { error: 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}
