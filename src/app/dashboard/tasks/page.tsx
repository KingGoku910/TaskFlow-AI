import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import DashboardClientContent from '@/components/dashboard/dashboard-client';
import { ClipboardList } from 'lucide-react';
import { ensureUserProfileAndTutorialTasks } from '@/app/dashboard/profile/actions';

export default async function TasksPage() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/auth');
  }

  let pageError: string | null = null;
  let initialTasks: any[] = [];

  try {
    // Ensure user profile and tutorial tasks are set up
    const profileResult = await ensureUserProfileAndTutorialTasks(user.id, user.email, false); // Prevent SSR revalidation
    if (!profileResult.success) {
      pageError = `Failed to set up user profile: ${profileResult.error}`;
    }

    // Fetch tasks for the user (excluding archived tasks)
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false) // Only get non-archived tasks
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      pageError = 'Failed to fetch tasks. Please try refreshing the page.';
    } else {
      initialTasks = tasks || [];
    }
  } catch (error) {
    console.error('Error in TasksPage:', error);
    pageError = 'An unexpected error occurred. Please try again.';
  }

  return (
    <div className="tasks-page-container space-y-1">
      <DashboardPageHeader
        title="Task Management Dashboard"
        description="Organize and track your tasks with our intuitive Kanban board system."
        icon={<ClipboardList className="h-8 w-8" />}
      />
      
      <Suspense fallback={<div>Loading tasks...</div>}>
        <DashboardClientContent
          initialTasks={initialTasks}
          userId={user.id}
          pageError={pageError}
        />
      </Suspense>
    </div>
  );
}
