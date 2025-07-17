// src/app/dashboard/tasks/supabaseActions.ts
import { supabase } from '@/lib/supabaseClient';

// Fetch tasks for a user
export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Add a new task
export async function addTask(userId: string, taskData: any) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...taskData, user_id: userId }])
    .single();
  if (error) throw error;
  return data;
}

// Update a task
export async function updateTask(taskId: string, updates: any) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .single();
  if (error) throw error;
  return data;
}

// Delete a task
export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw error;
}

// Fetch subtasks for a task
export async function getSubtasks(taskId: string) {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId);
  if (error) throw error;
  return data;
}

// Add a subtask
export async function addSubtask(taskId: string, subtaskData: any) {
  const { data, error } = await supabase
    .from('subtasks')
    .insert([{ ...subtaskData, task_id: taskId }])
    .single();
  if (error) throw error;
  return data;
}

// Update a subtask
export async function updateSubtask(subtaskId: string, updates: any) {
  const { data, error } = await supabase
    .from('subtasks')
    .update(updates)
    .eq('id', subtaskId)
    .single();
  if (error) throw error;
  return data;
}

// Delete a subtask
export async function deleteSubtask(subtaskId: string) {
  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', subtaskId);
  if (error) throw error;
}
