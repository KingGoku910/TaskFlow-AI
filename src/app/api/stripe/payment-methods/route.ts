import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripePaymentService } from '@/services/stripe-payment';

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

    // Return mock payment methods for now
    const mockPaymentMethods = [
      {
        id: 'pm_1234567890',
        last_four: '4242',
        brand: 'Visa',
        expiry_month: 12,
        expiry_year: 2025,
        is_default: true,
      },
      {
        id: 'pm_0987654321',
        last_four: '0005',
        brand: 'Mastercard',
        expiry_month: 8,
        expiry_year: 2024,
        is_default: false,
      },
    ];

    return NextResponse.json(mockPaymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}
