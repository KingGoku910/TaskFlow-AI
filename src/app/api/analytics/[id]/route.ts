import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to create Supabase client with proper cookies handling for Next.js 15
async function createSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The set method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The delete method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// GET /api/analytics/[id] - Fetch specific analytics entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get specific analytics entry
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (analyticsError) {
      if (analyticsError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Analytics entry not found' }, { status: 404 });
      }
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error('Unexpected error in GET /api/analytics/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/analytics/[id] - Update analytics entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { data: analyticsData } = body;

    // Validate required fields
    if (!analyticsData || typeof analyticsData !== 'object') {
      return NextResponse.json({ error: 'Invalid analytics data' }, { status: 400 });
    }

    // Update analytics entry
    const { data: updatedAnalytics, error: updateError } = await supabase
      .from('analytics')
      .update({ 
        data: analyticsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Analytics entry not found' }, { status: 404 });
      }
      console.error('Error updating analytics:', updateError);
      return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedAnalytics });
  } catch (error) {
    console.error('Unexpected error in PUT /api/analytics/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/analytics/[id] - Delete analytics entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Delete analytics entry
    const { error: deleteError } = await supabase
      .from('analytics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting analytics:', deleteError);
      return NextResponse.json({ error: 'Failed to delete analytics' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Analytics entry deleted successfully' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/analytics/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}