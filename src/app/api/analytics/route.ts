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

// GET /api/analytics - Fetch analytics data for authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error('Unexpected error in GET /api/analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/analytics - Add new analytics data
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { data: analyticsData } = body;

    // Validate required fields
    if (!analyticsData || typeof analyticsData !== 'object') {
      return NextResponse.json({ error: 'Invalid analytics data' }, { status: 400 });
    }

    // Insert analytics data
    const { data: newAnalytics, error: insertError } = await supabase
      .from('analytics')
      .insert([{ 
        user_id: user.id,
        data: analyticsData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting analytics:', insertError);
      return NextResponse.json({ error: 'Failed to add analytics data' }, { status: 500 });
    }

    return NextResponse.json({ data: newAnalytics }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
