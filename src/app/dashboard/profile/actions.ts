'use server';

// Firestore logic removed for Supabase migration
import { createClient } from '@/utils/supabase/server';
import { addTaskDirect } from '@/app/dashboard/tasks/actions';
import { revalidatePath } from 'next/cache';

// Define the tutorial tasks
const TUTORIAL_TASKS_DATA = [
  {
    title: "👋 Welcome to Effecto TaskFlow!",
    description: "Let's get you started! This board is your new productivity hub.\n\n- [ ] **Explore the Dashboard**: Notice the 'Pending', 'In Progress', and 'Completed' columns. These help you organize your work.\n- [ ] **Drag this Task**: Click and hold this task, then drag it to the 'In Progress' column to see how easy it is to update status.",
    priority: "high" as const,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "➕ Create Your First Real Task",
    description: "Time to add your own task!\n\n- [ ] **Find the Button**: Click the '+ Add New Task' button (usually at the top right of the dashboard).\n- [ ] **Fill Details**: Give your task a clear title (e.g., 'Plan weekend activities'), a description, set a priority, and pick a deadline.\n- [ ] **Add the Task**: Click 'Add Task' in the form.\n- [ ] **Verify**: See your new task appear on the board!",
    priority: "medium" as const,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "🔍 Explore Task Details & Checklists",
    description: "Tasks can hold more than just a title.\n\n- [ ] **Click a Task**: Click on any task card (like this one!) to open its detail view.\n- [ ] **View Details**: See the full description, priority, and deadline.\n- [ ] **Interactive Checklists**: If a description has a markdown checklist (like `- [ ] Item`), these become interactive in the detail view. Try checking items off!",
    priority: "medium" as const,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "🤖 Use AI Task Decomposition",
    description: "Break down big goals with AI.\n\n- [ ] **Find the Tool**: Locate the 'AI Task Decomposition' section on the dashboard.\n- [ ] **Enter an Objective**: Type a larger goal, e.g., 'Organize my home office' or select an existing task.\n- [ ] **Decompose**: Let AI break it into smaller, manageable subtasks with checklists. These new tasks will be added to your board.",
    priority: "medium" as const,
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "📝 AI Note Generator",
    description: "Quickly generate notes on any topic.\n\n- [ ] **Navigate**: Use the sidebar menu to go to the 'AI Note Generator'.\n- [ ] **Enter a Topic**: Type any subject you want notes on (e.g., 'The basics of photosynthesis').\n- [ ] **Generate**: Let AI create structured markdown notes for you.",
    priority: "low" as const,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "🎉 You're All Set!",
    description: "You've learned the basics of Effecto TaskFlow! Feel free to explore other features like the Account and Settings pages (accessible from the sidebar). You can delete these tutorial tasks once you're comfortable (click a task to see details, then find the delete option).\n\nHappy tasking!",
    priority: "low" as const,
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

async function createTutorialTasks(userId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`profile/actions: Attempting to create tutorial tasks for user ${userId}`);
  if (!userId) {
    const errorMsg = "profile/actions: User ID is undefined in createTutorialTasks.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  try {
    // Get the user's profile to get their username
    const supabase = await createClient();
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error getting user profile:', userError);
      return { success: false, error: `Failed to get user profile: ${userError.message}` };
    }

    const username = userProfile?.username || 'there';
    
    // Create personalized tutorial tasks
    const personalizedTasks = [
      {
        title: `👋 Welcome to Effecto TaskFlow, ${username}!`,
        description: `Let's get you started! This board is your new productivity hub.\n\n- [ ] **Explore the Dashboard**: Notice the 'Pending', 'In Progress', and 'Completed' columns. These help you organize your work.\n- [ ] **Drag this Task**: Click and hold this task, then drag it to the 'In Progress' column to see how easy it is to update status.`,
        priority: "high" as const,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "➕ Create Your First Real Task",
        description: "Time to add your own task!\n\n- [ ] **Find the Button**: Click the '+ Add New Task' button (usually at the top right of the dashboard).\n- [ ] **Fill Details**: Give your task a clear title (e.g., 'Plan weekend activities'), a description, set a priority, and pick a deadline.\n- [ ] **Add the Task**: Click 'Add Task' in the form.\n- [ ] **Verify**: See your new task appear on the board!",
        priority: "medium" as const,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "🔍 Explore Task Details & Checklists",
        description: "Tasks can hold more than just a title.\n\n- [ ] **Click a Task**: Click on any task card (like this one!) to open its detail view.\n- [ ] **View Details**: See the full description, priority, and deadline.\n- [ ] **Interactive Checklists**: If a description has a markdown checklist (like `- [ ] Item`), these become interactive in the detail view. Try checking items off!",
        priority: "medium" as const,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "🤖 Use AI Task Decomposition",
        description: "Break down big goals with AI.\n\n- [ ] **Find the Tool**: Locate the 'AI Task Decomposition' section on the dashboard.\n- [ ] **Enter an Objective**: Type a larger goal, e.g., 'Organize my home office' or select an existing task.\n- [ ] **Decompose**: Let AI break it into smaller, manageable subtasks with checklists. These new tasks will be added to your board.",
        priority: "medium" as const,
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "📝 AI Note Generator",
        description: "Quickly generate notes on any topic.\n\n- [ ] **Navigate**: Use the sidebar menu to go to the 'AI Note Generator'.\n- [ ] **Enter a Topic**: Type any subject you want notes on (e.g., 'The basics of photosynthesis').\n- [ ] **Generate**: Let AI create structured markdown notes for you.",
        priority: "low" as const,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: `🎉 You're All Set, ${username}!`,
        description: "You've learned the basics of Effecto TaskFlow! Feel free to explore other features like the Account and Settings pages (accessible from the sidebar). You can delete these tutorial tasks once you're comfortable (click a task to see details, then find the delete option).\n\nHappy tasking!",
        priority: "low" as const,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    for (const taskData of personalizedTasks) {
      const result = await addTaskDirect(userId, taskData, false); // Prevent SSR revalidation
      if (!result) {
        const errorMessage = `profile/actions: Failed to add tutorial task: "${taskData.title}" for user ${userId}.`;
        console.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    }
    console.log(`profile/actions: Successfully created tutorial tasks for user ${userId}`);
    return { success: true };
  } catch (error) {
    let message = "profile/actions: Unknown error creating tutorial tasks.";
    if (error instanceof Error) {
      message = error.message;
      if ((error as any).code === 'permission-denied' || message.toLowerCase().includes('permission denied')) {
        message = `profile/actions: Firestore permission denied while creating tutorial tasks for user ${userId}. Please check Firestore rules for 'users/${userId}/tasks'. Original error: ${message}`;
      }
    }
    console.error(`profile/actions: Critical error in createTutorialTasks for ${userId}:`, message, error);
    return { success: false, error: message };
  }
}

export async function ensureUserProfileAndTutorialTasks(userId: string, email: string | null | undefined, shouldRevalidate: boolean = true): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    const errorMsg = "profile/actions: User ID is undefined in ensureUserProfileAndTutorialTasks.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  console.log(`profile/actions: Ensuring user profile for ${userId}, email: ${email}`);

  // Supabase logic for user profile
  try {
    const supabase = await createClient();
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: No rows found
      throw profileError;
    }

    if (!profileData) {
      // Create new profile
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, email: email || 'N/A', created_at: new Date().toISOString(), tutorial_completed: false }]);
      if (insertError) throw insertError;

      // Create tutorial tasks
      const tutorialResult = await createTutorialTasks(userId);
      if (tutorialResult.success) {
        await supabase
          .from('users')
          .update({ tutorial_completed: true })
          .eq('id', userId);
      } else {
        return { success: false, error: `Profile created, but failed to add tutorial tasks: ${tutorialResult.error || 'Unknown error during tutorial task creation.'}` };
      }
    } else if (!profileData.tutorial_completed) {
      // Tutorial not completed, create tasks
      const tutorialResult = await createTutorialTasks(userId);
      if (tutorialResult.success) {
        await supabase
          .from('users')
          .update({ tutorial_completed: true })
          .eq('id', userId);
      } else {
        return { success: false, error: `Failed to add tutorial tasks for existing user: ${tutorialResult.error || 'Unknown error during tutorial task creation for existing user.'}` };
      }
    }
    
    // Only revalidate if not during SSR
    if (shouldRevalidate) {
      revalidatePath('/dashboard');
    }
    return { success: true };
  } catch (error: any) {
    let specificMessage = "profile/actions: Unknown error ensuring user profile.";
    if (error instanceof Error) {
        specificMessage = error.message;
    }
    console.error(`profile/actions: Critical Error in ensureUserProfileAndTutorialTasks for user ${userId}:`, specificMessage, error);
    return { success: false, error: specificMessage };
  }
}

export async function restartTutorial(userId: string, shouldRevalidate: boolean = true): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    const errorMsg = "profile/actions: User ID is undefined in restartTutorial.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  console.log(`profile/actions: Restarting tutorial for user ${userId}`);

  try {
    const supabase = await createClient();
    
    // Get the user's profile to get their username
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error getting user profile:', userError);
      return { success: false, error: `Failed to get user profile: ${userError.message}` };
    }

    const username = userProfile?.username || 'there';
    
    // Create personalized tutorial task titles for deletion
    const personalizedTitles = [
      `👋 Welcome to Effecto TaskFlow, ${username}!`,
      "➕ Create Your First Real Task",
      "🔍 Explore Task Details & Checklists",
      "🤖 Use AI Task Decomposition",
      "📝 AI Note Generator",
      `🎉 You're All Set, ${username}!`
    ];
    
    // Also include the original titles in case they exist
    const originalTitles = TUTORIAL_TASKS_DATA.map(task => task.title);
    const allTitles = [...personalizedTitles, ...originalTitles];
    
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .in('title', allTitles);

    if (deleteError) {
      console.error('Error deleting existing tutorial tasks:', deleteError);
      return { success: false, error: `Failed to delete existing tutorial tasks: ${deleteError.message}` };
    }

    // Create new tutorial tasks
    const tutorialResult = await createTutorialTasks(userId);
    if (!tutorialResult.success) {
      return { success: false, error: `Failed to create new tutorial tasks: ${tutorialResult.error}` };
    }

    // Mark tutorial as completed (so it doesn't auto-create again)
    const { error: updateError } = await supabase
      .from('users')
      .update({ tutorial_completed: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating tutorial completion status:', updateError);
      return { success: false, error: `Failed to update tutorial status: ${updateError.message}` };
    }

    // Only revalidate if not during SSR
    if (shouldRevalidate) {
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/tasks');
    }
    
    console.log(`profile/actions: Successfully restarted tutorial for user ${userId}`);
    return { success: true };

  } catch (error: any) {
    let specificMessage = "profile/actions: Unknown error restarting tutorial.";
    if (error instanceof Error) {
      specificMessage = error.message;
    }
    console.error(`profile/actions: Critical Error in restartTutorial for user ${userId}:`, specificMessage, error);
    return { success: false, error: specificMessage };
  }
}

export async function getTutorialProgress(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    const supabase = await createClient();
    
    // Get tutorial task titles
    const tutorialTitles = TUTORIAL_TASKS_DATA.map(task => task.title);
    
    // Count existing tutorial tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, status')
      .eq('user_id', userId)
      .in('title', tutorialTitles);

    if (error) {
      return { success: false, error: error.message };
    }

    const totalTutorialTasks = TUTORIAL_TASKS_DATA.length;
    const existingTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;

    return {
      success: true,
      data: {
        totalTasks: totalTutorialTasks,
        existingTasks,
        completedTasks,
        hasActiveTutorial: existingTasks > 0,
        completionPercentage: existingTasks > 0 ? Math.round((completedTasks / existingTasks) * 100) : 0
      }
    };

  } catch (error: any) {
    return { success: false, error: error.message || "Failed to get tutorial progress" };
  }
}

export async function getTaskStats(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    const supabase = await createClient();
    
    // Get all tasks for the user
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, status, created_at')
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    const totalTasks = tasks?.length || 0;
    const todoTasks = tasks?.filter(task => task.status === 'todo').length || 0;
    const inProgressTasks = tasks?.filter(task => task.status === 'in_progress').length || 0;
    const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
    
    // Tasks created in the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentTasks = tasks?.filter(task => 
      new Date(task.created_at) > weekAgo
    ).length || 0;

    return {
      success: true,
      data: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        recentTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    };

  } catch (error: any) {
    return { success: false, error: error.message || "Failed to get task statistics" };
  }
}

export async function getUserPreferences(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    const supabase = await createClient();
    
    // Use select() without .single() to handle multiple or no rows gracefully
    const { data: users, error } = await supabase
      .from('users')
      .select('profile_data')
      .eq('id', userId);

    if (error) {
      console.error('getUserPreferences database error:', error);
      return { success: false, error: error.message };
    }

    // Handle multiple rows by taking the first one, or handle no rows
    const user = users && users.length > 0 ? users[0] : null;
    const preferences = user?.profile_data || {};
    
    // Default preferences if none exist - Restored to original teal theme
    const defaultPreferences = {
      kanban: {
        todoColor: '#14b8a6',       // Teal (matches original theme)
        inProgressColor: '#f59e0b', // Amber
        completedColor: '#10b981'   // Emerald
      },
      theme: {
        accentColor: '#14b8a6',     // Teal accent (matches original theme)
        borderRadius: 'medium',      // small, medium, large
        cardStyle: 'modern',         // modern, classic, minimal
        fontSize: 'medium'           // small, medium, large
      },
      ui: {
        compactMode: false,
        showAnimations: true,
        highContrast: false
      }
    };

    return {
      success: true,
      data: { ...defaultPreferences, ...preferences }
    };

  } catch (error: any) {
    console.error('getUserPreferences catch error:', error);
    return { success: false, error: error.message || "Failed to get user preferences" };
  }
}

export async function updateUserPreferences(userId: string, preferences: any, shouldRevalidate: boolean = true): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('users')
      .update({ profile_data: preferences })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Only revalidate if not during SSR
    if (shouldRevalidate) {
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/settings');
    }
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update preferences" };
  }
}
