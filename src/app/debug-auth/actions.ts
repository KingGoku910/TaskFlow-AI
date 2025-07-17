'use server';

import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';

export async function createTestUser() {
  try {
    const serviceSupabase = createServiceClient();
    
    // Create the auth user
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword',
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Failed to create auth user' };
    }

    // Create user profile
    const { error: profileError } = await serviceSupabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: authData.user.email,
        username: 'testuser',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tutorial_completed: false,
        profile_data: {}
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { error: profileError.message };
    }

    return { success: true, user: authData.user };

  } catch (error: any) {
    console.error('Create test user error:', error);
    return { error: error.message };
  }
}

export async function checkAuthStatus() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    return {
      user,
      error: error?.message,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
