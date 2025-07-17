// src/app/dashboard/notes/supabaseActions.ts
import { supabase } from '@/lib/supabaseClient';

// Fetch notes for a user
export async function getNotes(userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Add a new note
export async function addNote(userId: string, noteData: any) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...noteData, user_id: userId }])
    .single();
  if (error) throw error;
  return data;
}

// Update a note
export async function updateNote(noteId: string, updates: any) {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .single();
  if (error) throw error;
  return data;
}

// Delete a note
export async function deleteNote(noteId: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  if (error) throw error;
}
