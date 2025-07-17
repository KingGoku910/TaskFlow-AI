'use server';

import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';

export async function listAllUsers() {
  try {
    const serviceSupabase = createServiceClient();
    
    // Get all users from auth.users table
    const { data: authUsers, error: authError } = await serviceSupabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Auth users error:', authError);
      return { error: authError.message };
    }

    // Get all users from public.users table
    const { data: publicUsers, error: publicError } = await serviceSupabase
      .from('users')
      .select('*');

    if (publicError) {
      console.error('Public users error:', publicError);
      return { error: publicError.message };
    }

    return {
      authUsers: authUsers.users,
      publicUsers,
      count: {
        auth: authUsers.users.length,
        public: publicUsers?.length || 0
      }
    };

  } catch (error: any) {
    console.error('List users error:', error);
    return { error: error.message };
  }
}

export async function deleteTestUser() {
  try {
    const serviceSupabase = createServiceClient();
    
    // Find the test user
    const { data: authUsers, error: listError } = await serviceSupabase.auth.admin.listUsers();
    
    if (listError) {
      return { error: listError.message };
    }

    const testUser = authUsers.users.find(user => user.email === 'test@example.com');
    
    if (!testUser) {
      return { error: 'Test user not found' };
    }

    // Delete from auth
    const { error: deleteAuthError } = await serviceSupabase.auth.admin.deleteUser(testUser.id);
    
    if (deleteAuthError) {
      return { error: deleteAuthError.message };
    }

    // Delete from public users table
    const { error: deletePublicError } = await serviceSupabase
      .from('users')
      .delete()
      .eq('id', testUser.id);

    if (deletePublicError) {
      return { error: deletePublicError.message };
    }

    return { success: true, message: 'Test user deleted successfully' };

  } catch (error: any) {
    console.error('Delete user error:', error);
    return { error: error.message };
  }
}

export async function checkUserByEmail(email: string) {
  try {
    const serviceSupabase = createServiceClient();
    
    // Check auth users
    const { data: authUsers, error: authError } = await serviceSupabase.auth.admin.listUsers();
    
    if (authError) {
      return { error: authError.message };
    }

    const authUser = authUsers.users.find(user => user.email === email);
    
    // Check public users
    const { data: publicUser, error: publicError } = await serviceSupabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (publicError) {
      return { error: publicError.message };
    }

    return {
      authUser,
      publicUser,
      exists: !!authUser,
      profileExists: !!publicUser
    };

  } catch (error: any) {
    console.error('Check user error:', error);
    return { error: error.message };
  }
}
