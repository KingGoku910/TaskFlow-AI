import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createSubscriptionService } from '@/services/subscription';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const subscriptionService = createSubscriptionService(supabase);
    const plans = await subscriptionService.getSubscriptionPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
