'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSubscriptionService } from '@/services/subscription';
import { rateLimitMiddleware } from '@/middleware/rate-limit';

// Fetch tasks for authenticated user
export async function getTasks() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/auth');
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

// Add a new task
export async function addTask(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error in addTask:', userError);
      redirect('/auth');
    }

    // Create subscription service instance
    const subscriptionService = createSubscriptionService(supabase);

    // Check rate limits for task creation
    const canCreateTask = await subscriptionService.checkResourceLimit(user.id, 'task');
    if (!canCreateTask) {
      const usage = await subscriptionService.getUserUsage(user.id);
      const subscription = await subscriptionService.getUserSubscription(user.id);
      
      throw new Error(`Task limit exceeded. You have used ${usage.tasks_used} of ${subscription?.plan_limits.max_tasks_per_month} tasks this month. Upgrade to Pro for unlimited tasks.`);
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const status = formData.get('status') as string || 'todo';
    const deadline = formData.get('deadline') as string;

    // Validate required fields
    if (!title || title.trim() === '') {
      throw new Error('Task title is required');
    }

    if (!priority || !['low', 'medium', 'high'].includes(priority)) {
      throw new Error('Valid priority is required');
    }

    if (!status || !['todo', 'in_progress', 'completed', 'archived'].includes(status)) {
      throw new Error('Valid status is required');
    }

    console.log('Adding task with data:', { title, description, priority, status, deadline });

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ 
        title: title.trim(),
        description: description || '',
        priority,
        status,
        deadline: deadline && deadline !== '' ? new Date(deadline).toISOString() : null,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Database error in addTask:', error);
      throw error;
    }
    
    // Track usage after successful task creation
    await subscriptionService.trackUsage(user.id, 'task', data.id);
    
    console.log('Task added successfully:', data);
    revalidatePath('/dashboard/tasks');
    return data;
  } catch (error) {
    console.error('Error in addTask server action:', error);
    throw error;
  }
}

// Add a task with direct parameters (used for tutorial task creation)
export async function addTaskDirect(
  userId: string, 
  taskData: { title: string; description: string; priority: string; deadline?: string },
  shouldRevalidate: boolean = true
) {
  const supabase = await createClient();
  
  // Verify user authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user || user.id !== userId) {
    console.error('Authentication failed in addTaskDirect:', userError);
    return null;
  }

  // Debug the task data
  console.log('addTaskDirect: Attempting to insert task with data:', {
    title: taskData.title,
    description: taskData.description.substring(0, 50) + '...',
    priority: taskData.priority,
    deadline: taskData.deadline,
    user_id: userId
  });

  try {
    const taskToInsert = { 
      ...taskData,
      user_id: userId,
      status: 'todo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('addTaskDirect: Final task object to insert:', taskToInsert);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskToInsert])
      .select()
      .single();
      
    if (error) {
      console.error('Error inserting task:', error);
      console.error('Task data that failed:', taskToInsert);
      return null;
    }
    
    console.log('addTaskDirect: Successfully inserted task:', data);
    
    // Only revalidate if not during SSR
    if (shouldRevalidate) {
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/tasks');
    }
    
    return data;
    
  } catch (error) {
    console.error('Exception in addTaskDirect:', error);
    return null;
  }
}

// Update a task
export async function updateTask(taskId: string, updates: any) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error in updateTask:', userError);
      redirect('/auth');
    }

    // Validate taskId
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('Invalid task ID provided');
    }

    // Ensure updates object is valid
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid updates object provided');
    }

    console.log('Updating task:', taskId, 'with updates:', updates);

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', user.id) // Ensure user can only update their own tasks
      .select()
      .single();
      
    if (error) {
      console.error('Database error in updateTask:', error);
      throw error;
    }
    
    console.log('Task updated successfully:', data);
    revalidatePath('/dashboard/tasks');
    return data;
  } catch (error) {
    console.error('Error in updateTask server action:', error);
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/auth');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id); // Ensure user can only delete their own tasks
    
  if (error) throw error;
  
  revalidatePath('/dashboard/tasks');
}

// Delete multiple tasks
export async function deleteMultipleTasks(taskIds: string[]) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/auth');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .in('id', taskIds)
    .eq('user_id', user.id); // Ensure user can only delete their own tasks
    
  if (error) throw error;
  
  revalidatePath('/dashboard/tasks');
}

// Archive a task
export async function archiveTask(taskId: string) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error in archiveTask:', userError);
      redirect('/auth');
    }

    // Validate taskId
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('Invalid task ID provided');
    }

    console.log('Archiving task:', taskId);

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', user.id) // Ensure user can only archive their own tasks
      .select()
      .single();
      
    if (error) {
      console.error('Database error in archiveTask:', error);
      throw error;
    }
    
    console.log('Task archived successfully:', data);
    revalidatePath('/dashboard/tasks');
    return data;
  } catch (error) {
    console.error('Error in archiveTask server action:', error);
    throw error;
  }
}

// Archive multiple tasks
export async function archiveMultipleTasks(taskIds: string[]) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/auth');
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .in('id', taskIds)
    .eq('user_id', user.id); // Ensure user can only archive their own tasks
    
  if (error) throw error;
  
  revalidatePath('/dashboard/tasks');
}

// Auto-archive completed tasks older than specified days
export async function autoArchiveCompletedTasks(daysThreshold: number = 30) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Authentication error in autoArchiveCompletedTasks:', userError);
    return;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .lt('completed_at', cutoffDate.toISOString())
    .is('archived_at', null);
    
  if (error) {
    console.error('Error auto-archiving tasks:', error);
    return;
  }

  console.log(`Auto-archived ${data?.length || 0} completed tasks older than ${daysThreshold} days`);
  revalidatePath('/dashboard/tasks');
  return data;
}

export interface TaskDecompositionOutput {
  subtasks: Array<{
    title: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
    estimated_hours?: number;
    dependencies?: string[];
    checklist?: Array<{
      item: string;
      description?: string;
      completed: boolean;
    }>;
  }>;
}

export async function decomposeTask(
  title: string,
  description: string
): Promise<TaskDecompositionOutput> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    // Create subscription service instance
    const subscriptionService = createSubscriptionService(supabase);

    // Check if user can use AI features
    const canUseAI = await subscriptionService.canUseFeature(user.id, 'ai_task_decomposition');
    if (!canUseAI) {
      throw new Error('AI task decomposition is not available in your current plan. Upgrade to Pro to access AI features.');
    }

    // Check AI request rate limits
    const canUseAIRequest = await subscriptionService.checkResourceLimit(user.id, 'ai_request');
    if (!canUseAIRequest) {
      const usage = await subscriptionService.getUserUsage(user.id);
      const subscription = await subscriptionService.getUserSubscription(user.id);
      
      throw new Error(`AI request limit exceeded. You have used ${usage.ai_requests_used} of ${subscription?.plan_limits.max_ai_requests_per_month} AI requests this month. Upgrade to Pro for more AI requests.`);
    }

    // Dynamic import to ensure this only runs on server
    const { taskDecomposition } = await import('@/ai/flows/task-decomposition');
    
    const objective = `${title}: ${description}`;
    const result = await taskDecomposition({ objective });
    
    // Track AI usage after successful decomposition
    await subscriptionService.trackUsage(user.id, 'ai_request', undefined, 1);
    
    return result;
  } catch (error) {
    console.error('Error decomposing task:', error);
    
    // If it's a rate limit error, re-throw it
    if (error instanceof Error && (error.message.includes('limit exceeded') || error.message.includes('not available'))) {
      throw error;
    }
    
    // Return fallback result if AI processing fails
    return {
      subtasks: [
        {
          title: `Research and Planning for: ${title}`,
          description: '- [ ] Define requirements\n- [ ] Research approaches\n- [ ] Create plan',
          priority: 'high',
          estimated_hours: 2
        },
        {
          title: `Implementation of: ${title}`,
          description: '- [ ] Set up development environment\n- [ ] Implement core functionality\n- [ ] Add error handling',
          priority: 'medium',
          estimated_hours: 4
        },
        {
          title: `Testing and Review for: ${title}`,
          description: '- [ ] Write tests\n- [ ] Manual testing\n- [ ] Code review',
          priority: 'medium',
          estimated_hours: 1
        }
      ]
    };
  }
}
