// src/app/dashboard/analytics/supabaseActions.ts
import { supabase } from '@/lib/supabaseClient';

export interface AnalyticsData {
  id?: string;
  user_id: string;
  data: {
    type: string;
    value: number;
    metadata?: Record<string, any>;
  };
  created_at?: string;
  updated_at?: string;
}

// Fetch analytics for a user
export async function getAnalytics(userId: string): Promise<AnalyticsData[]> {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Add analytics data
export async function addAnalytics(userId: string, analyticsData: AnalyticsData['data']): Promise<AnalyticsData> {
  const { data, error } = await supabase
    .from('analytics')
    .insert([{ 
      user_id: userId,
      data: analyticsData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Update analytics data
export async function updateAnalytics(analyticsId: string, analyticsData: AnalyticsData['data']): Promise<AnalyticsData> {
  const { data, error } = await supabase
    .from('analytics')
    .update({ 
      data: analyticsData,
      updated_at: new Date().toISOString()
    })
    .eq('id', analyticsId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Delete analytics data
export async function deleteAnalytics(analyticsId: string): Promise<void> {
  const { error } = await supabase
    .from('analytics')
    .delete()
    .eq('id', analyticsId);
  
  if (error) throw error;
}

// Get analytics by type
export async function getAnalyticsByType(userId: string, type: string): Promise<AnalyticsData[]> {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('user_id', userId)
    .eq('data->type', type)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get analytics summary
export async function getAnalyticsSummary(userId: string): Promise<{
  totalEntries: number;
  types: string[];
  dateRange: { start: string; end: string } | null;
}> {
  const { data, error } = await supabase
    .from('analytics')
    .select('data, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  if (!data || data.length === 0) {
    return {
      totalEntries: 0,
      types: [],
      dateRange: null
    };
  }
  
  const types = Array.from(new Set(data.map(item => item.data?.type).filter(Boolean)));
  const dateRange = {
    start: data[data.length - 1]?.created_at || '',
    end: data[0]?.created_at || ''
  };
  
  return {
    totalEntries: data.length,
    types,
    dateRange
  };
}
