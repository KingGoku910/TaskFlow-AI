import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=callback_error`);
    }

    // For OAuth logins, ensure user profile exists
    if (data.user) {
      try {
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          // Create user profile for OAuth users using service client
          const serviceSupabase = createServiceClient();
          const { error: profileError } = await serviceSupabase
            .from('users')
            .insert([{
              id: data.user.id,
              email: data.user.email || '',
              username: null, // OAuth users don't have username initially
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              tutorial_completed: false,
              profile_data: {}
            }]);

          if (profileError) {
            console.error('Error creating user profile in callback:', profileError);
          }
        }
      } catch (profileError) {
        console.error('Error checking/creating user profile:', profileError);
      }
    }

    // Check if this is a password reset flow
    if (type === 'recovery') {
      // Redirect to password reset page
      return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`);
    }

    // For normal sign-in, redirect to dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  }

  // If no code, redirect to auth page
  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}
