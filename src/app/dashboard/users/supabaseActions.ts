// src/app/dashboard/users/supabaseActions.ts
import { supabase } from '@/lib/supabaseClient';

// Fetch user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// Add a new user profile
export async function addUserProfile(userData: any) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .single();
  if (error) throw error;
  return data;
}

// Update user profile
export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}
