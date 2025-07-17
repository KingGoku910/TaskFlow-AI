import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      error: error?.message || null,
      session_info: user ? 'User found' : 'No user session'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      session_info: 'Error checking session'
    });
  }
}
