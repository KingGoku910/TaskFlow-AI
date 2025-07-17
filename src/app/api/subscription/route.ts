import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createSubscriptionService } from '@/services/subscription';

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

    // For now, return mock data until database schema is deployed
    const mockSubscriptionData = {
      subscription: {
        tier: 'free',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan_limits: {
          max_tasks_per_month: 50,
          max_ai_requests_per_month: 0,
          max_notes_per_month: 50,
          max_meeting_summaries_per_month: 0,
          max_storage_mb: 100,
          ai_task_decomposition: false,
          meeting_summarization: false,
          advanced_analytics: false,
        },
      },
      usage: {
        tasks_used: 12,
        ai_requests_used: 0,
        notes_used: 8,
        meeting_summaries_used: 0,
        storage_used_mb: 45,
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      daysRemaining: 30,
      isInTrial: false,
    };

    return NextResponse.json(mockSubscriptionData);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const subscriptionService = createSubscriptionService(supabase);
    
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

    // Upgrade subscription
    await subscriptionService.upgradeSubscription(user.id, tier, billingCycle);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const subscriptionService = createSubscriptionService(supabase);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Cancel subscription
    await subscriptionService.cancelSubscription(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
