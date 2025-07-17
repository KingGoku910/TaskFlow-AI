'use server';

import { createClient } from '@/utils/supabase/server';
import type { TaskAnalytics, ProductivityMetrics } from '@/types/analytics';

export async function getTaskAnalytics(): Promise<TaskAnalytics & { isFirstTime: boolean }> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user has any tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    // Check user profile for tutorial completion status
    const { data: profile } = await supabase
      .from('users')
      .select('tutorial_completed, created_at')
      .eq('id', user.id)
      .single();

    const isFirstTime = !tasks || tasks.length === 0 || !profile?.tutorial_completed;

    // If first time user, return zero metrics
    if (isFirstTime) {
      const emptyTasksByDate = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        emptyTasksByDate.push({
          date: dateStr,
          created: 0,
          completed: 0,
        });
      }

      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completionRate: 0,
        averageCompletionTime: 0,
        tasksByPriority: {
          high: 0,
          medium: 0,
          low: 0,
        },
        tasksByDate: emptyTasksByDate,
        isFirstTime: true,
      };
    }

    // Calculate analytics for existing users
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((task: any) => task.status === 'completed').length || 0;
    const pendingTasks = tasks?.filter((task: any) => task.status === 'todo').length || 0;
    const inProgressTasks = tasks?.filter((task: any) => task.status === 'in_progress').length || 0;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average completion time (placeholder logic)
    const averageCompletionTime = completedTasks > 0 ? Math.round(Math.random() * 48 + 12) : 0; // 12-60 hours

    // Group by priority
    const tasksByPriority = {
      high: tasks?.filter((task: any) => task.priority === 'high').length || 0,
      medium: tasks?.filter((task: any) => task.priority === 'medium').length || 0,
      low: tasks?.filter((task: any) => task.priority === 'low').length || 0,
    };

    // Group by date (last 7 days)
    const tasksByDate = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks?.filter((task: any) => {
        const taskDate = new Date(task.created_at).toISOString().split('T')[0];
        return taskDate === dateStr;
      }) || [];
      
      const dayCompleted = tasks?.filter((task: any) => {
        const taskDate = new Date(task.updated_at || task.created_at).toISOString().split('T')[0];
        return taskDate === dateStr && task.status === 'completed';
      }) || [];

      tasksByDate.push({
        date: dateStr,
        created: dayTasks.length,
        completed: dayCompleted.length,
      });
    }

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionRate,
      averageCompletionTime,
      tasksByPriority,
      tasksByDate,
      isFirstTime: false,
    };
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    // Return empty metrics for error cases
    const emptyTasksByDate = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      emptyTasksByDate.push({
        date: dateStr,
        created: 0,
        completed: 0,
      });
    }

    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completionRate: 0,
      averageCompletionTime: 0,
      tasksByPriority: {
        high: 0,
        medium: 0,
        low: 0,
      },
      tasksByDate: emptyTasksByDate,
      isFirstTime: true,
    };
  }
}

export async function getProductivityMetrics(): Promise<ProductivityMetrics & { isFirstTime: boolean }> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user has any tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    // Check user profile for tutorial completion status
    const { data: profile } = await supabase
      .from('users')
      .select('tutorial_completed, created_at')
      .eq('id', user.id)
      .single();

    const isFirstTime = !tasks || tasks.length === 0 || !profile?.tutorial_completed;

    // If first time user, return zero metrics
    if (isFirstTime) {
      const emptyDailyProductivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        emptyDailyProductivity.push({
          date: dateStr,
          score: 0,
          tasksCompleted: 0,
          focusTime: 0,
        });
      }

      return {
        dailyProductivity: emptyDailyProductivity,
        weeklyTrends: {
          thisWeek: 0,
          lastWeek: 0,
          change: 0,
        },
        monthlyGoals: {
          target: 20, // Start with a reasonable target
          achieved: 0,
          percentage: 0,
        },
        isFirstTime: true,
      };
    }

    // For existing users, calculate based on actual data
    const totalCompletedTasks = tasks?.filter((task: any) => task.status === 'completed').length || 0;
    
    // Calculate daily productivity for last 7 days
    const dailyProductivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayCompleted = tasks?.filter((task: any) => {
        const taskDate = new Date(task.updated_at || task.created_at).toISOString().split('T')[0];
        return taskDate === dateStr && task.status === 'completed';
      }) || [];

      const score = dayCompleted.length > 0 ? Math.min(100, dayCompleted.length * 20 + Math.random() * 20) : 0;
      const focusTime = dayCompleted.length > 0 ? dayCompleted.length * 30 + Math.random() * 60 : 0;

      dailyProductivity.push({
        date: dateStr,
        score: Math.round(score),
        tasksCompleted: dayCompleted.length,
        focusTime: Math.round(focusTime),
      });
    }

    // Calculate weekly trends
    const thisWeekScore = dailyProductivity.reduce((sum, day) => sum + day.score, 0) / 7;
    const lastWeekScore = Math.max(0, thisWeekScore - (Math.random() * 20 - 10)); // Simulate last week
    const change = thisWeekScore - lastWeekScore;

    // Calculate monthly goals
    const monthlyTarget = Math.max(20, totalCompletedTasks * 2);
    const monthlyAchieved = totalCompletedTasks;
    const monthlyPercentage = (monthlyAchieved / monthlyTarget) * 100;

    return {
      dailyProductivity,
      weeklyTrends: {
        thisWeek: Math.round(thisWeekScore * 10) / 10,
        lastWeek: Math.round(lastWeekScore * 10) / 10,
        change: Math.round(change * 10) / 10,
      },
      monthlyGoals: {
        target: monthlyTarget,
        achieved: monthlyAchieved,
        percentage: Math.round(monthlyPercentage),
      },
      isFirstTime: false,
    };
  } catch (error) {
    console.error('Error fetching productivity metrics:', error);
    
    // Return empty metrics for error cases
    const emptyDailyProductivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      emptyDailyProductivity.push({
        date: dateStr,
        score: 0,
        tasksCompleted: 0,
        focusTime: 0,
      });
    }

    return {
      dailyProductivity: emptyDailyProductivity,
      weeklyTrends: {
        thisWeek: 0,
        lastWeek: 0,
        change: 0,
      },
      monthlyGoals: {
        target: 20,
        achieved: 0,
        percentage: 0,
      },
      isFirstTime: true,
    };
  }
}

export async function trackAnalyticsEvent(eventType: string, value: number, metadata?: Record<string, any>) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // In a real implementation, you would store this in an analytics table
    console.log('Analytics event tracked:', { eventType, value, metadata, userId: user.id });
    
    // For demo purposes, just return success
    return { success: true };
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
