
'use server';

import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Helper function is no longer needed with the new utils
// The server client handles cookies internally

const SignUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long.").max(50, "Username must be less than 50 characters."),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const ForgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
});

export type FormState = {
  message: string;
  type: 'success' | 'error';
  fields?: Record<string, string>;
  issues?: string[];
} | null;


export async function signUpWithEmailPassword(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const parsed = SignUpSchema.safeParse(data);

  if (!parsed.success) {
    return {
      message: "Invalid form data.",
      type: 'error',
      issues: parsed.error.issues.map(issue => issue.message),
    };
  }

  const { username, email, password } = parsed.data;

  try {
    const supabase = await createClient();
    
    // Check if username already exists first
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking username:', checkError);
      return {
        message: "Error checking username availability.",
        type: 'error'
      };
    }

    if (existingUser) {
      return {
        message: "Username already taken. Please choose a different username.",
        type: 'error'
      };
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return {
        message: authError.message || "Sign up failed. Please try again.",
        type: 'error'
      };
    }

    if (!authData.user) {
      return {
        message: "Sign up failed. Please try again.",
        type: 'error'
      };
    }

    // Create user profile with username - use service role for this operation
    const serviceSupabase = createServiceClient();
    const { error: profileError } = await serviceSupabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: authData.user.email || email,
        username: username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tutorial_completed: false,
        profile_data: {}
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return {
        message: "Account created but profile setup failed. Please contact support.",
        type: 'error'
      };
    }

    // Success - redirect will be handled by the auth callback
    return { 
      message: "Account created successfully! Redirecting to dashboard...", 
      type: 'success' 
    };

  } catch (error: any) {
    console.error('Signup error:', error);
    return { 
      message: error.message || "Sign up failed. Please try again.", 
      type: 'error' 
    };
  }
}

export async function signInWithEmailPassword(prevState: FormState | null, formData: FormData): Promise<FormState> {
  // NOTE: This server action now requires a custom token flow for sign-in,
  // which is more complex. The simplest approach for email/password sign-in
  // is often to handle it on the client-side with the Firebase client SDK
  // and then post the ID token to a server route to create a session cookie.
  // For this project, we'll keep the client-side sign-in and redirect logic
  // in auth/page.tsx, which will then trigger server components on the dashboard.
  // This server action is now primarily for reference or other auth methods.
  // To keep it simple, we will return an error and guide the user.
  
  return {
    message: "This function is not implemented for server-side cookie-based auth. Please use the client-side sign-in.",
    type: 'error'
  };
}


export async function handleForgotPassword(prevState: FormState | null, formData: FormData): Promise<FormState> {
    const data = Object.fromEntries(formData);
    const parsed = ForgotPasswordSchema.safeParse(data);

    if (!parsed.success) {
        return {
            message: "Invalid email address.",
            type: 'error',
            issues: parsed.error.issues.map((issue) => issue.message),
        };
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);
        if (error) throw error;
        return { message: "Password reset email sent. Please check your inbox.", type: 'success' };
    } catch (error: any) {
        return { message: error.message || "Failed to send password reset email.", type: 'error' };
    }
}


export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth');
}
