// src/app/dashboard/meeting-summaries/supabaseActions.ts
import { supabase } from '@/lib/supabaseClient';

// Fetch meeting summaries for a user
export async function getMeetingSummaries(userId: string) {
  const { data, error } = await supabase
    .from('meeting_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Add a new meeting summary
export async function addMeetingSummary(userId: string, summaryData: any) {
  const { data, error } = await supabase
    .from('meeting_summaries')
    .insert([{ ...summaryData, user_id: userId }])
    .single();
  if (error) throw error;
  return data;
}
